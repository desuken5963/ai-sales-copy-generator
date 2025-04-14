import client from './client';
import { CreateCopyRequest, CopyResponse } from './types';

export const createCopy = async (data: CreateCopyRequest): Promise<CopyResponse> => {
  console.log('Request data:', data);
  const response = await client.post<CopyResponse>('/copies', data);
  return response.data;
}; 