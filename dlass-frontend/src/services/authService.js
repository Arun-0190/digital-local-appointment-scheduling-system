import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/auth";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    email,
    password
  });

  return response.data;
};