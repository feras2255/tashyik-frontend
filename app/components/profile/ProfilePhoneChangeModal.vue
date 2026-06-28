<script setup>
  const { t } = useI18n();
  const auth = useAuthStore();
  const emit = defineEmits(['close', 'success']);

  const step = ref(1); // 1: Request, 2: Verify
  const phone = ref('');
  const otp = ref('');
  const loader = ref(false);
  const errors = ref({});
  const verificationSession = ref(null);

  const countdown = ref(0);
  let timerInterval = null;

  function startCountdown(seconds) {
    countdown.value = seconds;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
  }

  onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
  });

  async function handleRequest() {
    loader.value = true;
    errors.value = {};

    try {
      const response = await useApiFetch('/profile/change-phone/request', {
        method: 'POST',
        body: { phone: phone.value },
      });

      verificationSession.value = response.verification_session;
      startCountdown(response.resend_after || 60);
      step.value = 2;
    } catch (error) {
      const status = error.status || error.statusCode || error.response?.status;
      const responseData = error.data || error.response?.data || error.body;

      if (status === 422) {
        errors.value = responseData?.errors?.errors || responseData?.errors || {};
      } else {
        errors.value = { phone: [responseData?.message || error.message || 'حدث خطأ، يرجى المحاولة لاحقاً'] };
        console.error('Failed to request phone change:', error);
      }
    }

    loader.value = false;
  }

  async function handleVerify() {
    loader.value = true;
    errors.value = {};

    try {
      const response = await useApiFetch('/profile/change-phone/verify', {
        method: 'POST',
        body: {
          verification_session: verificationSession.value,
          otp: otp.value,
        },
      });

      auth.fetchUser();
      emit('success', response.message);
      emit('close');
    } catch (error) {
      const status = error.status || error.statusCode || error.response?.status;
      const responseData = error.data || error.response?.data || error.body;

      if (status === 422) {
        errors.value = responseData?.errors?.errors || responseData?.errors || {};
      } else {
        errors.value = { otp: [responseData?.message || error.message || 'حدث خطأ في التحقق'] };
        console.error('Failed to verify phone change:', error);
      }
    }

    loader.value = false;
  }

  function handleClose() {
    emit('close');
  }
</script>

<template>
  <div class="w-full h-full fixed z-50 top-0 start-0 flex items-center justify-center bg-black/40 px-4">
    <div class="bg-white rounded-xl shadow-lg p-6 max-w-md w-full relative">
      <!-- Close Button -->
      <button @click="handleClose" class="absolute top-4 end-4 text-gray-400 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Step 1: Request -->
      <div v-if="step === 1" class="space-y-6">
        <div>
          <h3 class="text-xl font-medium text-gray-900">{{ $t('profile.change_phone') }}</h3>
        </div>

        <form @submit.prevent="handleRequest" class="space-y-4">
          <div>
            <InputsLabel for="new_phone" :name="$t('inputs.phone')" />
            <InputsDefault v-model="phone" id="new_phone" required />
            <InputsError :message="errors?.phone?.[0]" />
          </div>

          <div class="pt-2">
            <ButtonsPrimary type="submit" :name="$t('common.send')" :loader class="w-full" />
          </div>
        </form>
      </div>

      <!-- Step 2: Verify -->
      <div v-else-if="step === 2" class="space-y-6">
        <div>
          <h3 class="text-xl font-medium text-gray-900">{{ $t('guest.verify_otp.title') }}</h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ $t('guest.verify_otp.subtitle') }} <span dir="ltr">{{ phone }}</span>
          </p>
        </div>

        <form @submit.prevent="handleVerify" class="space-y-4">
          <div>
            <InputsLabel for="otp" name="OTP" />
            <InputsDefault v-model="otp" id="otp" type="text" maxlength="6" required class="text-center tracking-widest text-lg" />
            <InputsError :message="errors?.otp?.[0] || errors?.verification_session?.[0]" />
          </div>

          <div class="pt-2">
            <ButtonsPrimary type="submit" :name="$t('guest.verify_otp.verify_button')" :loader class="w-full" />
          </div>
        </form>

        <div class="text-center text-sm">
          <button
            v-if="countdown === 0"
            @click="handleRequest"
            :disabled="loader"
            class="text-violet-600 hover:text-violet-700 font-medium"
          >
            {{ $t('guest.verify_otp.resend_otp') }}
          </button>
          <span v-else class="text-gray-500"> {{ $t('guest.verify_otp.resend_otp') }} ({{ countdown }}s) </span>
        </div>
      </div>
    </div>
  </div>
</template>
