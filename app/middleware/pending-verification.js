export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const localePath = useLocalePath();

  auth.hydratePendingVerification();

  if (!auth.pendingVerification) {
    return navigateTo(localePath({ name: 'login' }));
  }
});
