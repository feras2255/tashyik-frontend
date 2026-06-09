<script setup>
import { ref } from 'vue';

const isChatOpen = ref(false);
const { initializeGuestToken } = useChatbot();

const toggleChat = () => {
  if (!isChatOpen.value) {
    initializeGuestToken();
  }
  isChatOpen.value = !isChatOpen.value;
};
</script>

<template>
  <div>
    <!-- Chatbot Button -->
    <button
      @click="toggleChat"
      :aria-label="$t('a11y.chatbot')"
      class="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 w-14 h-14 rounded-full static-color z-50 transition-colors shadow-2xl flex items-center justify-center"
      title="فتح الدردشة"
    >
      <!-- Chat Icon -->
      <span class="text-xl">🤖</span>
    </button>

    <!-- Chat Window -->
    <ClientOnly>
      <Teleport to="body">
        <Transition name="chat-slide">
          <ChatWindow v-if="isChatOpen" @close="isChatOpen = false" />
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style scoped>
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s ease;
}

.chat-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.static-color {
  filter: hue-rotate(0deg);
}
</style>
