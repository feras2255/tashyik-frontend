import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

/**
 * Single Echo/Pusher client for private order tracking channels.
 * Auth uses Sanctum Bearer token (same cookie as useApiFetch).
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const key = config.public.pusherAppKey;
  const cluster = config.public.pusherAppCluster || 'eu';
  const apiBase = (config.public.apiBaseUrl || '').replace(/\/$/, '');

  if (!key || !apiBase) {
    return {
      provide: {
        echo: null,
      },
    };
  }

  window.Pusher = Pusher;

  const echo = new Echo({
    broadcaster: 'pusher',
    key,
    cluster,
    forceTLS: true,
    authEndpoint: `${apiBase}/broadcasting/auth`,
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        const { token } = useAuthToken();

        $fetch(`${apiBase}/broadcasting/auth`, {
          method: 'POST',
          body: {
            socket_id: socketId,
            channel_name: channel.name,
          },
          headers: {
            Accept: 'application/json',
            ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
          },
        })
          .then((response) => callback(null, response))
          .catch((error) => callback(error, null));
      },
    }),
  });

  return {
    provide: {
      echo,
    },
  };
});
