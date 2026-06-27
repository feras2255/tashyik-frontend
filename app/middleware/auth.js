export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  const localePath = useLocalePath();
  const { token } = useAuthToken();

  if (!token.value) {
    return navigateTo(localePath({ name: 'login', query: { redirect: to.path } }));
  }

  await auth.fetchUser();

  if (!auth.user) {
    return navigateTo(localePath({ name: 'login', query: { redirect: to.path } }));
  }

  useSeoMeta({
    robots: 'noindex, nofollow',
  });
});
