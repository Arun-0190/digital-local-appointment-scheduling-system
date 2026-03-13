import axios from "axios";

const API_BASE = "http://localhost:8080/api/providers";

export const searchProviders = async (query) => {
  const response = await axios.get(`${API_BASE}/search`, {
    params: { q: query }
  });

  return response.data;
};