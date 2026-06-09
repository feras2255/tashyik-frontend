export function useChatbot() {
  const apiFetch = useApiFetchClient();
  const runtimeConfig = useRuntimeConfig();
  const token = useCookie('token', { default: () => null });

  // State
  const conversations = ref([]);
  const currentConversation = ref(null);
  const messages = ref([]);
  const guestToken = ref(null);
  const conversationUuid = ref(null);
  const isLoading = ref(false);
  const isSending = ref(false);
  const chatError = ref(null);

  const clearChatError = () => {
    chatError.value = null;
  };

  const getChatErrorPayload = (error) => {
    const status = Number(error?.status || error?.response?.status || 0);
    const message = error?.response?.data?.message || error?.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.';

    return {
      message,
      status,
      code: error?.code ?? null,
    };
  };

  // Initialize guest token from localStorage
  const initializeGuestToken = () => {
    if (process.client) {
      const stored = localStorage.getItem('chatbot_guest_token');
      if (stored) {
        guestToken.value = stored;
      } else {
        guestToken.value = generateUUID();
        localStorage.setItem('chatbot_guest_token', guestToken.value);
      }
    }
  };

  // Generate UUID v4
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Send message (Guest)
  const sendGuestMessage = async (messageText) => {
    if (!messageText.trim()) return;

    clearChatError();
    isSending.value = true;
    try {
      const response = await apiFetch('/chatbot/guest/message', {
        method: 'POST',
        body: {
          message: messageText,
          guest_token: guestToken.value,
          conversation_uuid: conversationUuid.value || undefined,
        },
      });

      // Update conversation UUID if new
      if (!conversationUuid.value && response.conversation_uuid) {
        conversationUuid.value = response.conversation_uuid;
        localStorage.setItem('chatbot_conversation_uuid', response.conversation_uuid);
      }

      // Add AI message
      if (response.message) {
        messages.value.push({
          id: response.assistant_message_id || `ai-${Date.now()}`,
          sender_type: 'ai',
          content: response.message,
          intent: response.intent || 'general',
          created_at: new Date().toISOString(),
        });
      }

      chatError.value = null;
      return response;
    } catch (error) {
      console.error('Error sending guest message:', error);
      chatError.value = getChatErrorPayload(error);
      throw error;
    } finally {
      isSending.value = false;
    }
  };

  // Send message (User)
  const sendUserMessage = async (messageText) => {
    if (!messageText.trim() || !token.value) return;

    clearChatError();
    isSending.value = true;
    try {
      const response = await apiFetch('/chatbot/user/message', {
        method: 'POST',
        body: {
          message: messageText,
          conversation_uuid: conversationUuid.value || undefined,
        },
      });

      // Update conversation UUID if new
      if (!conversationUuid.value && response.conversation_uuid) {
        conversationUuid.value = response.conversation_uuid;
        localStorage.setItem('chatbot_conversation_uuid', response.conversation_uuid);
      }

      // Add AI message
      if (response.message) {
        messages.value.push({
          id: response.assistant_message_id || `ai-${Date.now()}`,
          sender_type: 'ai',
          content: response.message,
          intent: response.intent || 'general',
          created_at: new Date().toISOString(),
        });
      }

      chatError.value = null;
      return response;
    } catch (error) {
      console.error('Error sending user message:', error);
      chatError.value = getChatErrorPayload(error);
      throw error;
    } finally {
      isSending.value = false;
    }
  };

  // Send message (generic)
  const sendMessage = async (messageText) => {
    const authStore = useAuthStore();
    const authUser = authStore.user;

    if (authUser && token.value) {
      return sendUserMessage(messageText);
    } else {
      return sendGuestMessage(messageText);
    }
  };

  // Load conversation messages
  const loadConversationMessages = async (uuid) => {
    if (!uuid || !token.value) return;

    isLoading.value = true;
    try {
      const response = await apiFetch(`/chatbot/user/conversations/${uuid}/messages`);

      if (response.messages && Array.isArray(response.messages.data)) {
        messages.value = response.messages.data;
        conversationUuid.value = uuid;
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // Load user conversations
  const loadConversations = async () => {
    if (!token.value) return;

    isLoading.value = true;
    try {
      const response = await apiFetch('/chatbot/user/conversations');

      if (response.data && Array.isArray(response.data)) {
        conversations.value = response.data;
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // Create new conversation
  const createNewConversation = () => {
    messages.value = [];
    conversationUuid.value = null;
    currentConversation.value = null;
    if (process.client) {
      localStorage.removeItem('chatbot_conversation_uuid');
    }
  };

  // Load stored conversation
  const loadStoredConversation = () => {
    if (process.client) {
      const stored = localStorage.getItem('chatbot_conversation_uuid');
      if (stored) {
        conversationUuid.value = stored;
      }
    }
  };

  // Clear all
  const clearChat = () => {
    messages.value = [];
    conversationUuid.value = null;
    currentConversation.value = null;
    chatError.value = null;
    if (process.client) {
      localStorage.removeItem('chatbot_conversation_uuid');
    }
  };

  return {
    // State
    conversations,
    currentConversation,
    messages,
    guestToken,
    conversationUuid,
    isLoading,
    isSending,
    chatError,

    // Methods
    sendMessage,
    sendGuestMessage,
    sendUserMessage,
    loadConversationMessages,
    loadConversations,
    createNewConversation,
    loadStoredConversation,
    clearChat,
    clearChatError,
    initializeGuestToken,
  };
}
