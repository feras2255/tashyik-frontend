<script setup>
import { ref, nextTick, onMounted, watch, computed } from 'vue';

const emit = defineEmits(['close']);
const { messages, sendMessage, isSending, isLoading, loadStoredConversation, clearChat, clearChatError, chatError, loadConversations } = useChatbot();
const authStore = useAuthStore();
const messageInput = ref('');
const messagesContainer = ref(null);

// Auto-scroll to bottom
watch(() => messages.value.length, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
});

// Load stored conversation
onMounted(() => {
  loadStoredConversation();
  if (authStore.user) {
    loadConversations();
  }
});

const handleSendMessage = async () => {
  if (!messageInput.value.trim() || isSending.value) return;

  clearChatError();
  const message = messageInput.value;
  messageInput.value = '';

  messages.value.push({
    id: `user-${Date.now()}`,
    sender_type: 'user',
    content: message,
    created_at: new Date().toISOString(),
  });

  try {
    await sendMessage(message);
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    messageInput.value = message; // Restore message on error
  }
};

const handleNewChat = () => {
  clearChat();
  messageInput.value = '';
};

const chatErrorText = computed(() => {
  if (!chatError.value) {
    return '';
  }

  if (chatError.value.status === 0) {
    return $t('chatbot.error_network');
  }

  if (chatError.value.status >= 500) {
    return $t('chatbot.error_server');
  }

  return chatError.value.message || $t('chatbot.error_generic');
});

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};
</script>

<template>
  <div class="fixed bottom-4 right-4 w-full max-w-[360px] bg-white rounded-[34px] shadow-[0_24px_80px_rgba(99,102,241,0.2)] overflow-hidden z-50 border border-slate-200">
    <div class="relative bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-5 text-white">
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        :aria-label="$t('common.close')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-[28px] bg-white/10 border border-white/20 flex items-center justify-center text-2xl">🤖</div>
        <div>
          <p class="text-xs uppercase tracking-[0.2em] opacity-90">AI Report</p>
          <h3 class="mt-2 text-xl font-semibold">{{ $t('chatbot.title') || 'تقرير ذكاء اصطناعي' }}</h3>
          <p class="mt-1 text-sm opacity-90">{{ $t('chatbot.subtitle') || 'إجابة سريعة وواضحة عن سؤالك' }}</p>
        </div>
      </div>
    </div>

    <div v-if="chatError" class="px-4 pb-2 pt-4">
      <div class="rounded-3xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <div class="flex items-start justify-between gap-3">
          <p class="leading-6">{{ chatErrorText }}</p>
          <button
            type="button"
            @click="clearChatError"
            class="text-red-700 underline text-xs"
          >
            {{ $t('chatbot.retry') || 'حاول مرة أخرى' }}
          </button>
        </div>
      </div>
    </div>

    <div
      ref="messagesContainer"
      class="overflow-y-auto p-4 space-y-4 bg-slate-50"
      style="min-height: 340px; max-height: 420px;"
    >
      <div v-if="isLoading && messages.length === 0" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="w-10 h-10 border-4 border-violet-200 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-sm text-slate-500">{{ $t('common.loading') }}</p>
        </div>
      </div>

      <div v-else-if="messages.length === 0" class="space-y-4">
        <div class="rounded-[28px] bg-white border border-slate-200 p-4 shadow-sm">
          <p class="text-sm text-slate-700 leading-7">{{ $t('chatbot.welcome') || 'مرحباً! اطلب تقريرًا سريعًا عن خدمتك أو استفسارك وسأوفر لك ملخصاً واضحاً.' }}</p>
        </div>
        <div class="grid gap-3">
          <div class="rounded-3xl bg-violet-600/10 border border-violet-200 p-3 text-sm text-violet-700">مثال: هل يمكنني تأمين خدمة فني كهربائي سريع؟</div>
          <div class="rounded-3xl bg-violet-600/10 border border-violet-200 p-3 text-sm text-violet-700">مثال: كيف أطلب خدمة صيانة مكيف؟</div>
        </div>
      </div>

      <template v-else>
        <div class="space-y-4">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              message.sender_type === 'user' ? 'self-end' : 'self-start',
              'max-w-full'
            ]"
          >
            <div
              v-if="message.sender_type === 'user'"
              class="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600 shadow-sm"
            >
              {{ message.content }}
            </div>

            <div
              v-if="message.sender_type === 'ai'"
              class="rounded-[28px] border border-violet-100 bg-white p-4 shadow-sm"
            >
              <p class="text-sm leading-7 text-slate-700">{{ message.content }}</p>
            </div>
          </div>

          <div v-if="isSending" class="rounded-[28px] border border-slate-200 bg-white px-4 py-3 shadow-sm inline-flex items-center gap-2 max-w-[110px]">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 0.1s"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 0.2s"></span>
          </div>
        </div>
      </template>
    </div>

    <div class="border-t border-slate-200 bg-white p-4">
      <form @submit.prevent="handleSendMessage" class="flex gap-2">
        <textarea
          v-model="messageInput"
          @keydown="handleKeyDown"
          :placeholder="$t('chatbot.placeholder') || 'اكتب استفسارك هنا...'"
          :disabled="isSending"
          rows="1"
          class="flex-1 border border-slate-200 rounded-[28px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
        ></textarea>
        <button
          type="submit"
          :disabled="isSending || !messageInput.trim()"
          class="w-12 h-12 rounded-[28px] bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white flex items-center justify-center transition-colors disabled:cursor-not-allowed"
          :aria-label="$t('common.send')"
        >
          <svg v-if="!isSending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
          <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </button>
      </form>
      <div class="mt-3 flex justify-between items-center text-xs text-slate-500">
        <button
          type="button"
          @click="handleNewChat"
          class="rounded-full bg-slate-100 px-3 py-2 hover:bg-slate-200 transition-colors"
        >
          {{ $t('chatbot.new_chat') || 'محادثة جديدة' }}
        </button>
        <span>{{ messages.length }} {{ $t('chatbot.messages_count') || 'رسالة' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  font-family: inherit;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #eef2ff;
  border-radius: 999px;
}

::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a78bfa;
}
</style>
