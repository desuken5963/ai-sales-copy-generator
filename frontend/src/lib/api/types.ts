export type Channel = 'app' | 'line' | 'pop' | 'sns' | 'email';
export type Tone = 'pop' | 'trust' | 'value' | 'luxury' | 'casual';

export interface CreateCopyRequest {
  productName: string;
  productFeatures: string;
  target: string;
  channel: Channel;
  tone: Tone;
  isPublished: boolean;
}

export interface CopyResponse {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
} 