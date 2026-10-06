import { API_BASE_URL } from './axiosClient';
import { ChatMessage } from '@/types';

export interface StreamChatCallbacks {
  onUserMessage?: (message: ChatMessage) => void;
  onToken?: (token: string) => void;
  onAssistantMessage?: (message: ChatMessage) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export async function streamChatMessage(
  sessionId: string,
  content: string,
  callbacks: StreamChatCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = `${API_BASE_URL.replace(/\/+$/, '')}/api/chat/sessions/${sessionId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ content }),
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      let errDetail = `Status ${response.status} ${response.statusText}`;
      try {
        const json = await response.json();
        if (json.message) errDetail = json.message;
      } catch {
        // ignore
      }
      throw new Error(`Failed to send message: ${errDetail}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported on response body.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE lines are separated by \n or \r\n
      // Events are separated by double newlines (\n\n or \r\n\r\n)
      const eventBlocks = buffer.split(/\r?\n\r?\n/);
      // The last element is an incomplete block still accumulating
      buffer = eventBlocks.pop() || '';

      for (const block of eventBlocks) {
        if (!block.trim()) continue;

        let currentEvent = 'message';
        const dataLines: string[] = [];

        const lines = block.split(/\r?\n/);
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trimStart());
          }
        }

        const rawData = dataLines.join('\n');

        if (currentEvent === 'user_message') {
          try {
            const parsed = JSON.parse(rawData) as ChatMessage;
            callbacks.onUserMessage?.(parsed);
          } catch (e) {
            console.error('Failed to parse user_message SSE data:', rawData, e);
          }
        } else if (currentEvent === 'token') {
          // Token could be JSON encoded string (e.g. " hello ") or raw string
          let tokenStr = rawData;
          try {
            if (rawData.startsWith('"') && rawData.endsWith('"')) {
              tokenStr = JSON.parse(rawData);
            }
          } catch {
            tokenStr = rawData;
          }
          callbacks.onToken?.(tokenStr);
        } else if (currentEvent === 'assistant_message') {
          try {
            const parsed = JSON.parse(rawData) as ChatMessage;
            callbacks.onAssistantMessage?.(parsed);
          } catch (e) {
            console.error('Failed to parse assistant_message SSE data:', rawData, e);
          }
        } else if (currentEvent === 'done') {
          callbacks.onDone?.();
        }
      }
    }

    // Flush any leftover buffer
    if (buffer.trim()) {
      let currentEvent = 'message';
      const dataLines: string[] = [];
      const lines = buffer.split(/\r?\n/);
      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart());
        }
      }
      const rawData = dataLines.join('\n');
      if (currentEvent === 'done') {
        callbacks.onDone?.();
      }
    }

    callbacks.onDone?.();
  } catch (err: unknown) {
    if (signal?.aborted) {
      return; // aborted intentionally
    }
    const error = err instanceof Error ? err : new Error(String(err));
    callbacks.onError?.(error);
  }
}

