import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/catalog';

export const getCategories = async () => {
  const res = await axios.get(`${API_BASE_URL}/categories`);
  return res.data;
};

export const getSubCategories = async (categoryId) => {
  const res = await axios.get(`${API_BASE_URL}/subcategories`, {
    params: { categoryId }
  });
  return res.data;
};
