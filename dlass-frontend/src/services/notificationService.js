import { api } from "./authService";

export const notificationService = {
  getNotifications: async (type = null, page = 0, size = 10) => {
    const params = { page, size };
    if (type && type !== "ALL") {
      params.type = type;
    }
    const response = await api.get("/api/notifications", { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/api/notifications/unread-count");
    return response.data.unreadCount;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/api/notifications/read-all");
    return response.data;
  }
};
