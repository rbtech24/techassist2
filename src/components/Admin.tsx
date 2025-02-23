import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { supabase } from '../services/supabase';
import { AIProvider } from '../types';
import { LogOut } from 'lucide-react';

export default function Admin() {
  const { config, updateConfig } = useStore();
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleProviderUpdate = (provider: AIProvider) => {
    const updatedProviders = config.providers.map(p =>
      p.id === provider.id ? provider : p
    );
    updateConfig({ providers: updatedProviders });
    setEditingProvider(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">AI Provider Settings</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
      <p className="text-gray-600 mb-6">
        Configure your AI providers here. Make sure to add your API keys to use the services.
      </p>
      
      <div className="space-y-4">
        {config.providers.map(provider => (
          <div
            key={provider.id}
            className="bg-white p-4 rounded-lg shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{provider.name}</h3>
                <p className="text-sm text-gray-600">
                  Status: {provider.enabled ? (
                    (provider.apiKey || import.meta.env.VITE_OPENAI_API_KEY) ? 
                      <span className="text-green-600">Ready</span> : 
                      <span className="text-yellow-600">API Key Required</span>
                  ) : (
                    <span className="text-gray-500">Disabled</span>
                  )}
                </p>
                {import.meta.env.VITE_OPENAI_API_KEY && (
                  <p className="text-xs text-green-600 mt-1">
                    Using environment API key
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={provider.enabled}
                    onChange={() => handleProviderUpdate({
                      ...provider,
                      enabled: !provider.enabled
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2">Enabled</span>
                </label>
                <button
                  onClick={() => setEditingProvider(provider)}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit {editingProvider.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                {import.meta.env.VITE_OPENAI_API_KEY && (
                  <p className="text-xs text-gray-500 mb-2">
                    An API key is already configured in the environment. Any key set here will override the environment key.
                  </p>
                )}
                <input
                  type="password"
                  value={editingProvider.apiKey || ''}
                  placeholder="Enter your API key here"
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    apiKey: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingProvider(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleProviderUpdate(editingProvider)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}