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

interface BaseCopyResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCopyResponse extends BaseCopyResponse {}

export interface GetCopyResponse extends BaseCopyResponse {
  title: string;
  description: string;
  likes: number;
  channel: Channel;
  tone: Tone;
  target: string;
}

export type GetCopiesResponse = GetCopyResponse[]; 