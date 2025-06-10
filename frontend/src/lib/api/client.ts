import axios from 'axios';

const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
};

const client = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターを追加
client.interceptors.request.use((config) => {
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
    baseURL: config.baseURL,
    apiBaseUrl: process.env.API_BASE_URL,
    openaiApiKey: process.env.OPENAI_API_KEY ? '***' : 'not set'
  });
  return config;
});

// レスポンスインターセプターを追加
client.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export default client; 