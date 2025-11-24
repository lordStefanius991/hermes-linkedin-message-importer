// src/api/messages.ts
import { api } from './http';
import type { ApiResponse, Message, MessagePriority } from '../types/message';

export async function fetchAllMessages(): Promise<Message[]> {
  const response = await api.get<ApiResponse<Message[]>>('/messages');
  return response.data.data ?? [];
}

// 🔹 NUOVO: carica un singolo messaggio (thread) per id
export async function fetchMessageById(id: number): Promise<Message | null> {
  const response = await api.get<ApiResponse<Message>>(`/messages/${id}`);
  return response.data.data ?? null;
}

export async function updateMessagePriority(
  id: number,
  priority: MessagePriority
): Promise<void> {
  await api.patch<ApiResponse<Message>>(`/messages/${id}/priority`, {
    priority,
  });
}

export async function saveCustomList(
  tag: string,
  messageIds: number[]
): Promise<void> {
  await api.post<ApiResponse<void>>('/messages/custom-list', {
    tag,
    messageIds,
  });
}
