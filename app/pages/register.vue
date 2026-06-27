<script setup>
  const { t } = useI18n();
  const cities = ref(null);
  const loader = ref(false);
  const errors = ref({});
  const { register } = useAuthStore();

  const credentials = reactive({
    city: '',
    name: '',
    email: '',
    phone: '',
    account_type: 'user',
  });

  definePageMeta({
    layout: 'guest',
    middleware: ['guest'],
  });

  useSeoMeta({
    title: t('seo.register.title'),
  });
  useNoIndexSeo();

  async function handleRegister() {
    loader.value = true;
    errors.value = {};

    const payload = { ...credentials };
    if (!payload.email) payload.email = null;

    const validationErrors = await register(payload);

    if (validationErrors) {
      errors.value = validationErrors;
    }

    loader.value = false;
  }

  onMounted(async () => {
    try {
      const response = await useApiFetch('/cities', {
        query: { per_page: 120 },
      });

      cities.value = response.data;
    } catch (error) {
      console.error('Failed to load cities:', error);
    }
  });
</script>

<template>
  <div>
    <div class="my-10">
      <h1 class="text-xl text-gray-800 font-medium text-center">{{ $t('guest.register.customer.title') }}</h1>
      <p class="text-gray-600 mt-2 text-center">{{ $t('guest.register.customer.subtitle') }}</p>
    </div>

    <form @submit.prevent="handleRegister()" class="space-y-6">
      <div>
        <InputsLabel for="name" :name="$t('inputs.name')" />
        <InputsDefault v-model="credentials.name" id="name" required />
        <InputsError :message="errors?.name?.[0]" />
      </div>

      <div>
        <InputsLabel for="phone" :name="$t('inputs.phone')" />
        <InputsDefault v-model="credentials.phone" id="phone" :placeholder="$t('inputs.phone_placeholder')" type="tel" required />
        <InputsError :message="errors?.phone?.[0]" />
      </div>

      <div>
        <InputsLabel for="email" :name="$t('inputs.email_optional')" />
        <InputsDefault v-model="credentials.email" id="email" type="email" autocomplete="email" />
        <InputsError :message="errors?.email?.[0]" />
      </div>

      <div>
        <InputsLabel for="city" :name="$t('inputs.city')" />
        <InputsSelect v-model="credentials.city" id="city" required>
          <option value="" v-text="$t('common.select_city')"></option>
          <option v-for="city in cities" :key="city.id" :value="city.id" v-text="city.name"></option>
        </InputsSelect>
        <InputsError :message="errors?.city?.[0]" />
      </div>

      <ButtonsPrimary type="submit" class="w-full" :name="$t('guest.register.create_account')" :loader />
    </form>

    <div class="text-center mt-6">
      <p class="text-gray-600">
        {{ $t('guest.register.have_account') }}
        <NuxtLinkLocale :to="{ name: 'login' }" class="text-brand-600 hover:text-brand-700 font-medium">
          {{ $t('guest.register.sign_in') }}
        </NuxtLinkLocale>
      </p>
    </div>
  </div>
</template>
