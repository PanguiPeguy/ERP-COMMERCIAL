import axios from "axios";

const api = axios.create({
  baseURL: typeof window !== "undefined"
    ? "/api"
    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api`,
  headers: { "Content-Type": "application/json" },
});

export const clientsApi = {
  getAll: () => api.get("/clients").then(r => r.data),
  getById: (id: number) => api.get(`/clients/${id}`).then(r => r.data),
  create: (data: any) => api.post("/clients", data).then(r => r.data),
  update: (id: number, data: any) => api.put(`/clients/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};

export const articlesApi = {
  getAll: () => api.get("/articles").then(r => r.data),
  getById: (id: number) => api.get(`/articles/${id}`).then(r => r.data),
  create: (data: any) => api.post("/articles", data).then(r => r.data),
  update: (id: number, data: any) => api.put(`/articles/${id}`, data).then(r => r.data),
  updateStock: (id: number, delta: number) => api.patch(`/articles/${id}/stock`, { delta }).then(r => r.data),
  delete: (id: number) => api.delete(`/articles/${id}`),
};

export const commandesApi = {
  getAll: () => api.get("/commandes").then(r => r.data),
  getById: (id: number) => api.get(`/commandes/${id}`).then(r => r.data),
  getByClient: (clientId: number) => api.get(`/commandes/client/${clientId}`).then(r => r.data),
  create: (data: any) => api.post("/commandes", data).then(r => r.data),
  updateStatut: (id: number, statut: string) => api.patch(`/commandes/${id}/statut`, { statut }).then(r => r.data),
  delete: (id: number) => api.delete(`/commandes/${id}`),
};

export const livraisonsApi = {
  getAll: () => api.get("/livraisons").then(r => r.data),
  getById: (id: number) => api.get(`/livraisons/${id}`).then(r => r.data),
  create: (data: any) => api.post("/livraisons", data).then(r => r.data),
  updateStatut: (id: number, statut: string) => api.patch(`/livraisons/${id}/statut`, { statut }).then(r => r.data),
};

export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats").then(r => r.data),
};

export default api;