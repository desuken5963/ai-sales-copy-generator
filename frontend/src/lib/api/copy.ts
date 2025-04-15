import client from './client';
import { CreateCopyRequest, CreateCopyResponse, GetCopyResponse } from './types';

export const createCopy = async (data: CreateCopyRequest): Promise<CreateCopyResponse> => {
  console.log('Request data:', data);
  const response = await client.post<CreateCopyResponse>('/copies', data);
  return response.data;
};

export const getCopy = async (id: string): Promise<GetCopyResponse> => {
  const response = await client.get<GetCopyResponse>(`/copies/${id}`);
  return response.data;
}; 