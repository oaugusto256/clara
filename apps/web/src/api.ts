import axios from "axios";

// VITE_API_URL is injected at build time (Dockerfile.stg --build-arg).
// Falls back to same-host relative URL when not set.
const baseURL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : "");

const api = axios.create({ baseURL });

export default api;
