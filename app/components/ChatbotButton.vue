<script setup>
const { isChatOpen, toggleChat } = useChatbot();
</script>

<template>
  <div>
    <!-- Chatbot Button -->
    <button
      @click="toggleChat"
      :aria-label="$t('a11y.chatbot')"
      class="fixed bottom-4 sm:bottom-6 start-4 sm:start-6 bg-brand-500 hover:bg-brand-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full static-color z-50 transition-colors shadow-2xl flex items-center justify-center"
      title="فتح الدردشة"
    >
      <!-- Chat Icon -->
      <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
      </svg>
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
