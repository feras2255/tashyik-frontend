<script setup>
  const { t } = useI18n();
  const localePath = useLocalePath();
  const loader = ref(false);
  const errors = ref({});
  const showChangePhone = ref(false);
  const newPhone = ref('');

  const auth = useAuthStore();
  const { verifyOtp, resendOtp, changePhoneDuringVerification, applyPendingVerificationUpdate } = auth;

  const otp = ref('');
  const resendCountdown = useOtpCountdown(0);
  const otpExpiryCountdown = useOtpCountdown(0);

  function syncCountdownsFromPending() {
    const pending = auth.pendingVerification;
    if (!pending) return;

    const now = Math.floor(Date.now() / 1000);

    if (pending.otp_expires_at) {
      otpExpiryCountdown.start(Math.max(0, pending.otp_expires_at - now));
    } else if (pending.expires_in) {
      otpExpiryCountdown.start(pending.expires_in);
    }

    if (pending.resend_available_at) {
      resendCountdown.start(Math.max(0, pending.resend_available_at - now));
    } else if (pending.resend_available_in) {
      resendCountdown.start(pending.resend_available_in);
    }
  }

  definePageMeta({
    layout: 'guest',
    middleware: ['guest', 'pending-verification'],
  });

  useSeoMeta({
    title: t('guest.verify_otp.title'),
  });
  useNoIndexSeo();

  onMounted(() => {
    auth.hydratePendingVerification();
    syncCountdownsFromPending();
  });

  async function handleVerify() {
    if (!auth.pendingVerification) return;

    loader.value = true;
    errors.value = {};

    const validationErrors = await verifyOtp({
      phone: auth.pendingVerification.phone,
      otp: otp.value,
      verification_session: auth.pendingVerification.verification_session,
    });

    if (validationErrors) {
      errors.value = validationErrors;
    }

    loader.value = false;
  }

  async function handleResend() {
    if (!auth.pendingVerification || !resendCountdown.canResend.value) return;

    loader.value = true;
    errors.value = {};

    try {
      const response = await resendOtp(auth.pendingVerification.verification_session);

      auth.setPendingVerification(applyPendingVerificationUpdate(auth.pendingVerification, response));

      otp.value = '';
      syncCountdownsFromPending();
    } catch (error) {
      if (Number(error.status) === 422) {
        errors.value = error?.body?.errors || error?.data?.errors || {};
      }
    }

    loader.value = false;
  }

  async function handleChangePhone() {
    if (!auth.pendingVerification || !newPhone.value) return;

    loader.value = true;
    errors.value = {};

    try {
      const response = await changePhoneDuringVerification(auth.pendingVerification.verification_session, newPhone.value);

      auth.setPendingVerification({
        ...applyPendingVerificationUpdate(auth.pendingVerification, response),
        phone: response.phone_normalized ?? newPhone.value,
      });

      newPhone.value = '';
      showChangePhone.value = false;
      otp.value = '';
      syncCountdownsFromPending();
    } catch (error) {
      if (Number(error.status) === 422) {
        errors.value = error?.body?.errors || error?.data?.errors || {};
      }
    }

    loader.value = false;
  }
</script>

<template>
  <div>
    <div class="my-10">
      <h1 class="text-xl text-gray-800 font-medium text-center">{{ $t('guest.verify_otp.title') }}</h1>
      <p class="text-gray-600 mt-2 text-center">
        {{ $t('guest.verify_otp.subtitle') }}
        <span v-if="auth.pendingVerification?.phone_masked" class="block font-medium mt-1 text-gray-800">
          {{ auth.pendingVerification.phone_masked }}
        </span>
        <span v-if="otpExpiryCountdown.remaining > 0" class="block text-sm mt-2 text-gray-500">
          {{ $t('guest.verify_otp.expires_in', { time: otpExpiryCountdown.formatted }) }}
        </span>
      </p>
    </div>

    <form @submit.prevent="handleVerify()" class="space-y-6">
      <div>
        <InputsLabel :name="$t('guest.verify_otp.otp_label')" class="text-center mb-4" />
        <InputsOtpInput v-model="otp" @complete="handleVerify" />
        <InputsError :message="errors?.otp?.[0]" class="text-center mt-2" />
      </div>

      <ButtonsPrimary type="submit" class="w-full" :name="$t('guest.verify_otp.verify_button')" :loader />
    </form>

    <div class="text-center mt-4 space-y-2">
      <InputsError :message="errors?.verification_session?.[0] || errors?.phone?.[0]" class="text-center" />
      <button
        type="button"
        class="text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors disabled:opacity-50"
        :disabled="loader || !resendCountdown.canResend"
        @click="handleResend"
      >
        <template v-if="resendCountdown.canResend">{{ $t('guest.verify_otp.resend_otp') }}</template>
        <template v-else>{{ $t('guest.verify_otp.resend_in', { time: resendCountdown.formatted }) }}</template>
      </button>
    </div>

    <div class="mt-8 border-t pt-6">
      <button type="button" class="text-sm text-gray-600 hover:text-brand-600" @click="showChangePhone = !showChangePhone">
        {{ $t('guest.verify_otp.change_phone') }}
      </button>

      <form v-if="showChangePhone" @submit.prevent="handleChangePhone()" class="space-y-4 mt-4">
        <InputsLabel for="new_phone" :name="$t('inputs.phone')" />
        <InputsDefault v-model="newPhone" id="new_phone" type="tel" :placeholder="$t('inputs.phone_placeholder')" required />
        <InputsError :message="errors?.phone?.[0]" />
        <ButtonsPrimary type="submit" class="w-full" :name="$t('guest.verify_otp.change_phone_submit')" :loader />
      </form>
    </div>
  </div>
</template>
