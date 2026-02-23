//courseService
import axios from "axios";

const api = axios.create({
  baseURL: "https://connect-1-t976.onrender.com/api/",
});

export default api;
