import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
});

export const processVideo = async (url: string) => {
  const { data } = await api.post('/process_video', { url });
  return data;
};



export const fetchVideos = async () => {
  const { data } = await api.get('/videos');
  return data;
};

export const chatWithAi = async (query: string, video_url: string, history: any[] = []) => {
  const { data } = await api.post('/chat', { query, video_url, history });
  return data;
};

export const generateQuiz = async (video_url: string) => {
  const { data } = await api.post('/quiz', { video_url });
  return data;
};

export const getExplanation = async (query: string) => {
  const { data } = await api.post('/general_explanation', { query });
  return data;
};

export const deleteVideo = async (video_url: string) => {
  const { data } = await api.post('/delete_video', { video_url });
  return data;
};

export default api;
