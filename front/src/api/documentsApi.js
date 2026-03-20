import { apiRequest } from "@/lib/apiClient";

export function listDocuments(chatbotId) {
  return apiRequest(`/chatbots/${chatbotId}/documents`);
}

export function uploadDocument(chatbotId, file) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest(`/chatbots/${chatbotId}/documents`, {
    method: "POST",
    body: form,
  });
}

export function deleteDocument(chatbotId, docId) {
  return apiRequest(`/chatbots/${chatbotId}/documents/${docId}`, {
    method: "DELETE",
  });
}
