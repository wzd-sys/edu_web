import { defineStore } from 'pinia';
import { ref } from 'vue';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const useAiStore = defineStore('ai', () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);

  async function sendMessage(message: string) {
    messages.value.push({ role: 'user', content: message });
    messages.value.push({ role: 'assistant', content: '' });
    loading.value = true;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      const lastIndex = messages.value.length - 1;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              messages.value[lastIndex] = {
                ...messages.value[lastIndex],
                content: messages.value[lastIndex].content + parsed.content,
              };
            }
          } catch {
            // skip
          }
        }
      }
    } finally {
      loading.value = false;
    }
  }

  function clearMessages() {
    messages.value = [];
  }

  return { messages, loading, sendMessage, clearMessages };
});
