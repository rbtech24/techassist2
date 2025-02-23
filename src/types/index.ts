export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  images?: string[];
  videos?: string[];
  annotations?: {
    type: 'circle' | 'arrow' | 'text';
    x: number;
    y: number;
    content?: string;
  }[];
  error?: string;
  qrData?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  appliance?: {
    model?: string;
    serialNumber?: string;
    qrData?: string;
    brand?: string;
    type?: string;
    installDate?: string;
    warrantyInfo?: {
      type: string;
      expirationDate: string;
      coverage: string[];
    };
    repairHistory?: {
      date: string;
      issue: string;
      resolution: string;
      parts: string[];
      technician: string;
    }[];
  };
  estimatedTime?: number;
  partsNeeded?: {
    partNumber: string;
    description: string;
    quantity: number;
    price: number;
    availability: 'in-stock' | 'backordered' | 'discontinued';
  }[];
}

export interface AIProvider {
  id: 'openai' | 'claude' | 'grok';
  name: string;
  apiKey?: string;
  enabled: boolean;
}

export interface AppConfig {
  activeProvider: AIProvider['id'];
  providers: AIProvider[];
}