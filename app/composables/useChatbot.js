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
    const code = error?.response?.data?.error || null;

    let message;
    if (status === 0 || code === 'network_error') {
      message = 'تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.';
    } else if (status >= 500) {
      message = 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.';
    } else if (status === 404 && code === 'conversation_not_found') {
      message = null; // handled by retry logic, don't show error
    } else {
      message = 'تعذر إرسال رسالتك. حاول مرة أخرى.';
    }

    return message ? { message, status, code } : null;
  };

  // Initialize guest token from localStorage
  const initializeGuestToken = () => {
    if (process.client) {
      const storedToken = localStorage.getItem('chatbot_guest_token');
      const storedUuid = localStorage.getItem('chatbot_conversation_uuid');
      // Only restore both if they exist together (they are a pair)
      if (storedToken && storedUuid) {
        guestToken.value = storedToken;
        conversationUuid.value = storedUuid;
      } else {
        // Clear any orphaned data and generate a fresh token
        localStorage.removeItem('chatbot_guest_token');
        localStorage.removeItem('chatbot_conversation_uuid');
        guestToken.value = generateUUID();
        localStorage.setItem('chatbot_guest_token', guestToken.value);
        conversationUuid.value = null;
      }
    }
  };

  const clearStoredConversationUuid = () => {
    conversationUuid.value = null;
    guestToken.value = generateUUID();
    if (process.client) {
      // Clear the whole pair and generate a new guest_token for the next fresh conversation
      localStorage.removeItem('chatbot_conversation_uuid');
      localStorage.setItem('chatbot_guest_token', guestToken.value);
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
  const sendGuestMessage = async (messageText, retry = true) => {
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

      if (response.conversation_uuid) {
        // Always save uuid and guest_token together as a pair
        conversationUuid.value = response.conversation_uuid;
        localStorage.setItem('chatbot_conversation_uuid', response.conversation_uuid);
        localStorage.setItem('chatbot_guest_token', guestToken.value);
      }

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
      const status = Number(error?.status || error?.response?.status || 0);
      const code = error?.response?.data?.error || null;

      // 404 or guest_token_mismatch → clear the pair and retry fresh
      if (retry && (status === 404 || code === 'guest_token_mismatch')) {
        clearStoredConversationUuid();
        isSending.value = false;
        return await sendGuestMessage(messageText, false);
      }

      const payload = getChatErrorPayload(error);
      if (payload) chatError.value = payload;
      throw error;
    } finally {
      isSending.value = false;
    }
  };

  // Send message (User)
  const sendUserMessage = async (messageText, retry = true) => {
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

      if (!conversationUuid.value && response.conversation_uuid) {
        conversationUuid.value = response.conversation_uuid;
        localStorage.setItem('chatbot_conversation_uuid', response.conversation_uuid);
      }

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
      const status = Number(error?.status || error?.response?.status || 0);

      // Any 404 with stored UUID → clear and retry fresh
      if (retry && status === 404 && conversationUuid.value) {
        clearStoredConversationUuid();
        isSending.value = false;
        return await sendUserMessage(messageText, false);
      }

      const payload = getChatErrorPayload(error);
      if (payload) chatError.value = payload;
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

  // Get conversation messages (for polling)
  const getConversationMessages = async (conversationId) => {
    return await apiFetch(`/chat/conversations/${conversationId}/messages`);
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
    guestToken.value = generateUUID();
    if (process.client) {
      localStorage.removeItem('chatbot_conversation_uuid');
      localStorage.setItem('chatbot_guest_token', guestToken.value);
    }
  };

  // Load stored conversation (only if the pair exists together)
  const loadStoredConversation = () => {
    if (process.client) {
      const storedUuid = localStorage.getItem('chatbot_conversation_uuid');
      const storedToken = localStorage.getItem('chatbot_guest_token');
      if (storedUuid && storedToken) {
        conversationUuid.value = storedUuid;
        guestToken.value = storedToken;
      } else {
        localStorage.removeItem('chatbot_conversation_uuid');
        localStorage.removeItem('chatbot_guest_token');
      }
    }
  };

  // Clear all
  const clearChat = () => {
    messages.value = [];
    conversationUuid.value = null;
    currentConversation.value = null;
    chatError.value = null;
    guestToken.value = generateUUID();
    if (process.client) {
      localStorage.removeItem('chatbot_conversation_uuid');
      localStorage.setItem('chatbot_guest_token', guestToken.value);
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
    getConversationMessages,
    loadConversationMessages,
    loadConversations,
    createNewConversation,
    loadStoredConversation,
    clearChat,
    clearChatError,
    initializeGuestToken,
  };
}
