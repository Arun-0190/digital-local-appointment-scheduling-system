import axios from 'axios';
import { API_URL } from './apiUtils';

const CATALOG_API = `${API_URL}/catalog`;

export const getCategories = async () => {
  const res = await axios.get(`${CATALOG_API}/categories`);
  return res.data;
};

export const getSubCategories = async (categoryId) => {
  const res = await axios.get(`${CATALOG_API}/subcategories`, {
    params: { categoryId }
  });
  return res.data;
};
