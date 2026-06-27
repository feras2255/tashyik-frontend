export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  const localePath = useLocalePath();
  const { token } = useAuthToken();

  auth.hydratePendingVerification();

  if (to.name?.toString().includes('verify-otp') && auth.pendingVerification) {
    return;
  }

  if (token.value) {
    await auth.fetchUser();
  }

  if (auth.user) {
    return navigateTo(localePath({ name: 'index' }));
  }
});
