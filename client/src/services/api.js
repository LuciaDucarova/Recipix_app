import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // port tvojho backendu
});

export const getRecipes = async () => {
  const response = await api.get('/recipes');
  return response.data;
};