import axios from 'axios';

const API_BASE_URL = 'https://phishguard-api-6byp.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeEmail = async (emailData) => {
  try {
    const response = await api.post('/api/analyze', emailData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Unable to connect to PhishGuard AI Backend. Please ensure backend server is running on port 8000.');
  }
};

export const generateReport = async (analysisData) => {
  try {
    const response = await api.post('/api/generate-report', analysisData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to generate incident report.');
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'offline', model_loaded: false };
  }
};

export default api;
