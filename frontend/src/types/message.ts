// src/types/message.ts

export type MessagePriority = 'LOW' | 'MEDIUM' | 'HIGH'; // valori logici dal BE

export const PRIORITY_LABEL: Record<MessagePriority, string> = {
  LOW: 'BASSA',
  MEDIUM: 'MEDIA',
  HIGH: 'ALTA',
};

export interface Message {
  id: number;
  senderName: string;
  senderProfileUrl: string;
  snippet: string;
  receivedAt: string; // ISO string dal backend
  priority: MessagePriority;
  source: string;
  tags: string[];

  // campi extra per Hermes:
  fullText?: string | null;   // thread completo importato
  threadUrl?: string | null;  // URL del thread LinkedIn (se presente)
  lastFromMe?: boolean | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: string;
}
