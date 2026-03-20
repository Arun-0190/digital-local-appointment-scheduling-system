import { api } from "./authService";

// Search providers by category, subcategory, and pincode
export async function searchProviders(categoryId, subCategoryId, pincode) {
  const response = await api.get("/api/providers/search", {
    params: { categoryId, subCategoryId, pincode },
  });
  return response.data;
}

// Get detailed profile of a single provider
export async function getProviderProfile(providerId) {
  const response = await api.get(`/api/providers/${providerId}/profile`);
  return response.data;
}

// Get the authenticated provider's dashboard stats (requires PROVIDER JWT)
export async function getProviderDashboard() {
  const response = await api.get("/api/provider/dashboard");
  return response.data;
}

// ─── Onboarding & Admin APIs ─────────────────────────────────────────────────

// Apply as a new provider (public)
export async function applyAsProvider(applicationData) {
  const response = await api.post("/api/providers/apply", applicationData);
  return response.data;
}

// Get pending provider applications (ADMIN only)
export async function getPendingProviders() {
  const response = await api.get("/api/admin/providers/pending");
  return response.data;
}

// Approve provider application (ADMIN only)
export async function approveProvider(providerId) {
  const response = await api.patch(`/api/admin/providers/${providerId}/approve`);
  return response.data;
}

// Reject provider application (ADMIN only)
export async function rejectProvider(providerId) {
  const response = await api.patch(`/api/admin/providers/${providerId}/reject`);
  return response.data;
}