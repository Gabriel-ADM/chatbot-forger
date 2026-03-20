import { apiRequest } from "@/lib/apiClient";

export function listChatbots() {
  return apiRequest("/chatbots");
}

export function createChatbot(body) {
  return apiRequest("/chatbots", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateChatbot(id, body) {
  return apiRequest(`/chatbots/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function setChatbotStatus(id, active) {
  return apiRequest(`/chatbots/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}
