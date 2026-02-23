import axios from "axios";

const api = axios.create({
  baseURL: "${process.env.REACT_APP_API_URL}/api/spaces/",
});

// Récupérer les espaces de l'étudiant connecté
export const getMySpaces = async () => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await api.get("my-spaces/", { headers });
  return res.data;
};

export default { getMySpaces };
