import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const processVideo = async (url: string) => {
  const { data } = await api.post('/process_video', { url });
  return data;
};

export const uploadLocalVideo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload_local_video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
