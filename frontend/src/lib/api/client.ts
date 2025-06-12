import axios from 'axios';

const getBaseURL = () => {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  if (environment === 'test') {
    return 'http://api-test:8080';
  }
  if (environment === 'production') {
    // 本番環境ではドメインを固定
    return 'https://api.ai-sales-copy-generator.click';
  }
  // 開発・その他環境は環境変数優先
  return 'http://localhost:8080';
};

const client = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターを追加
client.interceptors.request.use((config) => {
  // パスに/api/v1を追加（先頭に追加）
  config.url = `/api/v1${config.url}`;
  
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
    baseURL: config.baseURL,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
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