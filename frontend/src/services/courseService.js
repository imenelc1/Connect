import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/", // adapte l'URL si nécessaire
});

export default api;