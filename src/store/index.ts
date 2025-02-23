import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation, AppConfig } from '../types';
import { supabase } from '../services/supabase';

interface AppState {
  conversations: Conversation[];
  currentConversation: string | null;
  config: AppConfig;
  addConversation: (conversation: Conversation) => void;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateConfig: (config: Partial<AppConfig>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      conversations: [],
      currentConversation: null,
      config: {
        activeProvider: 'openai',
        providers: [
          { id: 'openai', name: 'OpenAI (GPT-4)', enabled: true }
        ]
      },
      addConversation: async (conversation) => {
        const { data: userData } = await supabase.auth.getUser();
        
        // Use the same UUID for both local state and Supabase
        const conversationId = conversation.id;
        
        // If user is authenticated, save to Supabase
        if (userData.user && import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
          try {
            // Validate UUID format
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
              throw new Error('Invalid UUID format');
            }
            
            await supabase
              .from('conversations').insert({
                id: conversationId,
                user_id: userData.user.id,
                title: conversation.title,
                timestamp: new Date(conversation.timestamp).toISOString(),
                appliance: conversation.appliance || null
              })
              .select()
              .single();
          } catch (error) {
            console.error('Failed to save conversation to Supabase:', error);
          }
        }

        set((state) => ({
          conversations: [...state.conversations, conversation],
          currentConversation: conversation.id
        }));
      },
      setCurrentConversation: (id) =>
        set({ currentConversation: id }),
      addMessage: async (conversationId, message) => {
        const { data: userData } = await supabase.auth.getUser();
        
        // Use the same UUID for both local state and Supabase
        const messageId = message.id;
        
        // If user is authenticated, save to Supabase
        if (userData.user && import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
          try {
            // Validate UUID format
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(messageId)) {
              throw new Error('Invalid UUID format');
            }
            
            await supabase
              .from('messages')
              .insert([{
                id: messageId,
                conversation_id: conversationId,
                role: message.role,
                content: message.content,
                timestamp: new Date(message.timestamp).toISOString(),
                error: message.error || null,
                qr_data: message.qrData || null,
                images: message.images || null
              }]);
          } catch (error) {
            console.error('Failed to save message to Supabase:', error);
          }
        }

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, messages: [...conv.messages, message] }
              : conv
          )
        }));
      },
      updateConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config }
        }))
    }),
    {
      name: 'appliance-repair-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const hasSupabaseConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

        if (!hasSupabaseConfig) {
          console.warn('Supabase environment variables missing, using local storage only');
          return;
        }

        // Load conversations from Supabase
        (async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            // For unauthenticated users, just use local storage
            return;
          }

          const { data: conversations } = await supabase
            .from('conversations')
            .select(`
              *,
              messages:messages(*)
            `)
            .order('timestamp', { ascending: false });

          if (conversations) {
            state.conversations = conversations.map(conv => ({
              id: conv.id,
              title: conv.title,
              timestamp: new Date(conv.timestamp).getTime(),
              appliance: conv.appliance,
              messages: conv.messages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.timestamp).getTime(),
                error: msg.error || undefined,
                qrData: msg.qr_data || undefined,
                images: msg.images || undefined
              }))
            }));
          }
        })().catch(error => {
          console.error('Failed to load conversations:', error);
        }
        )
      }
    }
  )
);