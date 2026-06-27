export function useOtpCountdown(initialSeconds = 0) {
  const remaining = ref(Math.max(0, initialSeconds));
  let timer = null;

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start(seconds) {
    stop();
    remaining.value = Math.max(0, Number(seconds) || 0);

    if (remaining.value <= 0) {
      return;
    }

    timer = setInterval(() => {
      if (remaining.value <= 1) {
        remaining.value = 0;
        stop();
      } else {
        remaining.value -= 1;
      }
    }, 1000);
  }

  const formatted = computed(() => {
    const minutes = Math.floor(remaining.value / 60);
    const seconds = remaining.value % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  const canResend = computed(() => remaining.value <= 0);

  onBeforeUnmount(stop);

  return {
    remaining,
    formatted,
    canResend,
    start,
    stop,
  };
}
