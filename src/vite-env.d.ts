import React, { useState } from 'react';
import { Camera, Send, Loader2, QrCode, PlusCircle, Sparkles, Flashlight, Mic } from 'lucide-react';
import { useStore } from '../store';
import { Html5Qrcode } from 'html5-qrcode';
import { getAIResponse, analyzeImage } from '../services/ai';
import { AlertCircle, MessageSquare, Bot } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [showWelcomePrompt, setShowWelcomePrompt] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { currentConversation, addMessage, config, addConversation } = useStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if API key is configured
    const activeProvider = config.providers.find(p => p.id === config.activeProvider);
    if (!activeProvider?.apiKey && !import.meta.env.VITE_OPENAI_API_KEY) {
      handleApiKeyError();
    }
  }, [config]);

  const handleApiKeyError = () => {
    setShowApiKeyPrompt(true);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      setSelectedImage(imageDataUrl);
      
      if (!currentConversation) {
        startNewChat();
        return;
      }

      setIsLoading(true);

      try {
        // Add user's image message
        const imageMessage: Message = {
          id: uuidv4(),
          role: 'user',
          content: 'Analyzing appliance image...',
          timestamp: Date.now(),
          images: [imageDataUrl]
        };
        addMessage(currentConversation, imageMessage);

        // Get AI analysis
        const analysis = await analyzeImage(imageDataUrl, config.activeProvider);

        // Add AI's response
        const aiMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: analysis,
          timestamp: Date.now()
        };
        addMessage(currentConversation, aiMessage);
      } catch (error) {
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Failed to analyze the image.',
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Image analysis failed'
        };
        if (error instanceof Error && error.message.includes('API key not configured')) {
          handleApiKeyError();
        }
        addMessage(currentConversation, errorMessage);
      } finally {
        setIsLoading(false);
        setSelectedImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const startNewChat = () => {
    const newConversation = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      timestamp: Date.now()
    };
    addConversation(newConversation);
  };

  React.useEffect(() => {
    if (!currentConversation) {
      startNewChat();
    }
  }, [currentConversation, addConversation]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    if (!currentConversation) {
      const newConversation = {
        id: uuidv4(),
        title: 'New Conversation',
        messages: [],
        timestamp: Date.now()
      };
      addConversation(newConversation);
    }

    setIsLoading(true);
    const userMessage = message;
    setMessage('');
    
    const userMessageId = uuidv4();
    
    // Add user message
    const userMessageObj: Message = {
      id: userMessageId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    
    addMessage(currentConversation, userMessageObj);

    try {
      const aiResponse = await getAIResponse(userMessage, config.activeProvider);
      
      if (!aiResponse) {
        throw new Error('No response received from AI');
      }
      
      const aiMessageObj: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      };
      
      addMessage(currentConversation, aiMessageObj);
    } catch (error) {
      const errorMessageObj: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'An error occurred while processing your request.',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Failed to get AI response'
      };
      if (error instanceof Error && error.message.includes('API key not configured')) {
        handleApiKeyError();
      }
      addMessage(currentConversation, errorMessageObj);
    }
    
    setIsLoading(false);
  };

  const startScanning = () => {
    const newScanner = new Html5Qrcode("qr-reader");
    
    const constraints = {
      facingMode: { exact: "environment" },
      advanced: [{
        torch: isFlashlightOn
      }]
    };
    
    newScanner.start(
      constraints,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        if (!currentConversation) return;
        
        addMessage(currentConversation, {
          id: uuidv4(),
          role: 'user',
          content: `Scanned QR Code: ${decodedText}`,
          timestamp: Date.now(),
          qrData: decodedText
        });
        
        stopScanning();
      },
      (error) => {
        console.error(error);
      }
    );
    
    setScanner(newScanner);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.stop().then(() => {
        scanner.clear();
      });
      setScanner(null);
    }
    setIsScanning(false);
  };

  const toggleFlashlight = async () => {
    if (!scanner) return;
    
    try {
      const newState = !isFlashlightOn;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          advanced: [{ torch: newState }]
        }
      });
      
      const track = stream.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: newState }]
      });
      
      setIsFlashlightOn(newState);
    } catch (error) {
      console.error('Flashlight not available:', error);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  React.useEffect(() => {
    return () => {
      if (scanner) {
        stopScanning();
      }
    };
  }, [scanner]);

  return (
    <div className="flex flex-col h-[100dvh] overscroll-none bg-gray-50">
      <div className="bg-white border-b px-4 py-4 flex items-center justify-end md:justify-between mt-[5.5rem] md:mt-0">
        <p className="text-sm text-gray-600 hidden md:block">Expert appliance repair assistance at your fingertips</p>
        <button
          onClick={startNewChat}
          className="flex items-center gap-2 px-4 py-2.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Start New Chat</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-6 space-y-3 md:space-y-4 pb-[5.5rem]">
        {currentConversation ? useStore.getState().conversations
          .find(conv => conv.id === currentConversation)
          ?.messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${
                index > 0 ? 'mt-2 md:mt-3' : ''
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[80%] rounded-lg px-3 md:px-4 py-2 text-sm md:text-base ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-md'
                }`}
              >
                {msg.images?.map((image, i) => (
                  <img
                    key={i}
                    src={image}
                    alt="Appliance"
                    className="max-w-full rounded-lg mb-2"
                  />
                ))}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-2 bg-red-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span>{msg.error}</span>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="w-12 h-12 mb-4" />
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start a conversation by sending a message</p>
            </div>
          )}

        {isLoading && (
          <div className="flex justify-start mt-4">
            <div className="bg-blue-50 text-blue-600 rounded-lg px-4 py-3 flex items-center gap-3 ai-thinking">
              <Bot className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">SPARKY is analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {isScanning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="w-full max-w-sm mx-3 md:mx-4 safe-area-inset-bottom">
            <div id="qr-reader" className="w-full bg-white rounded-lg overflow-hidden" style={{ minHeight: '300px' }} />
            <button
              onClick={stopScanning}
              className="mt-3 md:mt-4 w-full bg-red-600 text-white py-2 rounded-lg text-sm md:text-base font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="border-t bg-white px-3 md:px-4 py-3 md:py-4 safe-area-inset-bottom sticky bottom-0 left-0 right-0">
        <div className="flex items-center gap-2 max-w-screen-lg mx-auto">
          <button
            onClick={() => {
              setIsScanning(true);
              startScanning();
            }}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <QrCode className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <label className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={isLoading}
            />
            <Camera className="w-5 h-5 md:w-6 md:h-6" />
          </label>
          <button
            onClick={startVoiceInput}
            disabled={isLoading || isListening}
            className={`p-2 rounded-full transition-colors ${
              isListening
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Mic className={`w-5 h-5 md:w-6 md:h-6 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2.5 min-h-[44px] text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className="p-2 text-blue-600 hover:text-blue-800 disabled:opacity-50 rounded-full hover:bg-blue-50"
          >
          <div className="mt-3 md:mt-4 flex gap-2">
            <button
              onClick={toggleFlashlight}
              className={`flex-1 py-2 rounded-lg text-sm md:text-base font-medium flex items-center justify-center gap-2 ${
                isFlashlightOn 
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <Flashlight className="w-5 h-5" />
              {isFlashlightOn ? 'Turn Off Light' : 'Turn On Light'}
            </button>
            <button
              onClick={stopScanning}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm md:text-base font-medium hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      
      {showApiKeyPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">API Key Required</h3>
            <p className="text-gray-600 mb-4">
              SPARKY requires an OpenAI API key to function. Please contact your administrator to set up the API key.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowApiKeyPrompt(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showWelcomePrompt && !showApiKeyPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-semibold">Welcome to SPARKY</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Your expert appliance repair assistant. Get help with:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                Step-by-step diagnostics
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                Parts identification and ordering
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                Detailed repair procedures
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                Brand-specific support info
              </li>
            </ul>
            <button
              onClick={() => setShowWelcomePrompt(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Start Using SPARKY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}