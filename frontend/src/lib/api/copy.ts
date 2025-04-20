import client from './client';
import { CreateCopyRequest, CreateCopyResponse, GetCopyResponse, GetCopiesResponse } from './types';

export const createCopy = async (data: CreateCopyRequest): Promise<CreateCopyResponse> => {
  console.log('Request data:', data);
  const response = await client.post<CreateCopyResponse>('/copies', data);
  return response.data;
};

export const getCopy = async (id: string): Promise<GetCopyResponse> => {
  const response = await client.get<GetCopyResponse>(`/copies/${id}`);
  return response.data;
};

export const getCopies = async (): Promise<GetCopiesResponse> => {
  const response = await client.get<GetCopiesResponse>('/copies');
  return response.data;
};

export const updateLikes = async (id: string): Promise<GetCopyResponse> => {
  const response = await client.put<GetCopyResponse>(`/copies/${id}/likes`);
  return response.data;
}; 