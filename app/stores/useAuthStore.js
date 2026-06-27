export const useAuthStore = defineStore('auth', () => {
  const { setToken, clearToken } = useAuthToken();
  const localePath = useLocalePath();
  const route = useRoute();
  const pendingStorage = usePendingVerification();

  const user = ref(null);
  const pendingVerification = ref(null);
  const isLoggedIn = computed(() => !!user.value);

  function hydratePendingVerification() {
    pendingVerification.value = pendingStorage.read();
  }

  function setPendingVerification(payload) {
    pendingVerification.value = payload;
    pendingStorage.write(payload);
  }

  function clearPendingVerification() {
    pendingVerification.value = null;
    pendingStorage.clear();
  }

  function buildPendingVerification(response, phone, flow) {
    const now = Math.floor(Date.now() / 1000);

    return {
      verification_session: response.verification_session,
      phone,
      phone_masked: response.phone,
      expires_in: response.expires_in,
      otp_expires_at: now + Number(response.expires_in ?? 600),
      resend_available_in: response.resend_available_in,
      resend_available_at: now + Number(response.resend_available_in ?? 0),
      flow,
    };
  }

  function applyPendingVerificationUpdate(current, response) {
    const now = Math.floor(Date.now() / 1000);

    return {
      ...current,
      verification_session: response.verification_session,
      phone_masked: response.phone,
      expires_in: response.expires_in,
      otp_expires_at: now + Number(response.expires_in ?? 600),
      resend_available_in: response.resend_available_in,
      resend_available_at: now + Number(response.resend_available_in ?? 0),
    };
  }

  function extractValidationErrors(error) {
    return error?.body?.errors || error?.data?.errors || error?.response?.data?.errors || null;
  }

  async function register(credentials) {
    try {
      const response = await useApiFetch('/v1/auth/register', {
        method: 'POST',
        body: credentials,
      });

      setPendingVerification(buildPendingVerification(response, credentials.phone, 'register'));

      return navigateTo(
        localePath({
          name: 'verify-otp',
          query: route.query.redirect ? { redirect: route.query.redirect } : undefined,
        }),
      );
    } catch (error) {
      if (Number(error.status) === 422) {
        return extractValidationErrors(error);
      }

      console.error('Failed to register:', error);
    }
  }

  async function login(credentials) {
    resetUser();

    try {
      const response = await useApiFetch('/v1/auth/login', {
        method: 'POST',
        body: {
          phone: credentials.phone,
        },
      });

      setPendingVerification(buildPendingVerification(response, credentials.phone, 'login'));

      return navigateTo(
        localePath({
          name: 'verify-otp',
          query: route.query.redirect ? { redirect: route.query.redirect } : undefined,
        }),
      );
    } catch (error) {
      if (Number(error.status) === 422) {
        return extractValidationErrors(error);
      }

      console.error('Failed to login:', error);
    }
  }

  async function verifyOtp({ phone, otp, verification_session }) {
    try {
      const response = await useApiFetch('/v1/auth/verify-otp', {
        method: 'POST',
        body: {
          phone,
          otp,
          verification_session,
        },
      });

      const resolvedUser = extractApiUser(response);

      if (!resolvedUser || !response.token) {
        console.error('Verify OTP succeeded but user/token missing in response', response);
        return;
      }

      user.value = resolvedUser;
      setToken(response.token);
      clearPendingVerification();

      return navigateTo(route.query.redirect ?? localePath({ name: 'index' }));
    } catch (error) {
      if (Number(error.status) === 422) {
        return extractValidationErrors(error);
      }

      console.error('Failed to verify OTP:', error);
    }
  }

  async function resendOtp(verification_session) {
    return useApiFetch('/v1/auth/resend-otp', {
      method: 'POST',
      body: { verification_session },
    });
  }

  async function changePhoneDuringVerification(verification_session, phone) {
    return useApiFetch('/v1/auth/change-phone', {
      method: 'POST',
      body: {
        verification_session,
        phone,
      },
    });
  }

  async function fetchUser() {
    const { token } = useAuthToken();

    if (!token.value) {
      user.value = null;
      return;
    }

    try {
      const response = await useApiFetch('/user');
      const resolvedUser = extractApiUser(response);

      if (resolvedUser) {
        user.value = resolvedUser;
      }
    } catch (error) {
      if (Number(error.status) === 401) {
        await resetUser();
      } else {
        console.error('Failed to fetch user:', error);
      }
    }
  }

  async function logout() {
    try {
      await useApiFetch('/logout', {
        method: 'POST',
      });

      await resetUser();

      return navigateTo(localePath({ name: 'index' }));
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  async function resetUser() {
    user.value = null;

    await clearToken();
  }

  return {
    user,
    pendingVerification,
    isLoggedIn,
    hydratePendingVerification,
    setPendingVerification,
    clearPendingVerification,
    applyPendingVerificationUpdate,
    register,
    login,
    verifyOtp,
    resendOtp,
    changePhoneDuringVerification,
    resetUser,
    logout,
    fetchUser,
  };
});
