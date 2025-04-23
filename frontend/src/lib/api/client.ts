import axios from 'axios';

const getBaseURL = () => {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  if (environment === 'production') {
    return 'https://api.ai-sales-copy-generator.click/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
};

const client = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client; 