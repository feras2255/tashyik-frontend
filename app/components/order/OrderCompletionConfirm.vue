<script setup>
  const props = defineProps({
    order: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['updated']);

  const note = ref('');
  const loader = ref(false);
  const errorMessage = ref('');
  const showRejectConfirm = ref(false);

  const isPending = computed(() => props.order.status === 'pending-customer-confirmation');
  const canUndo = computed(() => Boolean(props.order.can_undo_reject));

  async function refreshOrder() {
    emit('updated');
  }

  async function confirmCompletion() {
    if (loader.value) return;

    loader.value = true;
    errorMessage.value = '';

    try {
      await useApiFetch(`/user/orders/${props.order.id}/confirm-completion`, {
        method: 'POST',
        body: { note: note.value || null },
      });
      await refreshOrder();
    } catch (error) {
      errorMessage.value = error?.data?.message || error?.statusMessage || 'Error';
    } finally {
      loader.value = false;
    }
  }

  async function rejectCompletion() {
    if (loader.value) return;

    if (!note.value?.trim()) {
      errorMessage.value = 'note_required';
      return;
    }

    if (!showRejectConfirm.value) {
      showRejectConfirm.value = true;
      return;
    }

    loader.value = true;
    errorMessage.value = '';

    try {
      await useApiFetch(`/user/orders/${props.order.id}/reject-completion`, {
        method: 'POST',
        body: { note: note.value.trim() },
      });
      showRejectConfirm.value = false;
      await refreshOrder();
    } catch (error) {
      errorMessage.value = error?.data?.message || error?.statusMessage || 'Error';
    } finally {
      loader.value = false;
    }
  }

  async function undoReject() {
    if (loader.value) return;

    loader.value = true;
    errorMessage.value = '';

    try {
      await useApiFetch(`/user/orders/${props.order.id}/undo-reject-completion`, {
        method: 'POST',
      });
      await refreshOrder();
    } catch (error) {
      errorMessage.value = error?.data?.message || error?.statusMessage || 'Error';
    } finally {
      loader.value = false;
    }
  }
</script>

<template>
  <section v-if="isPending || canUndo" class="bg-white rounded-xl p-5 md:p-6 shadow col-span-12 flex flex-col gap-4">
    <template v-if="isPending">
      <span class="text-xl md:text-2xl font-medium text-gray-800">{{ $t('order.completion.title') }}</span>
      <p class="text-gray-500">{{ $t('order.completion.description') }}</p>

      <label class="flex flex-col gap-2">
        <span class="text-gray-600">{{ $t('order.completion.note_label') }}</span>
        <textarea
          v-model="note"
          rows="3"
          class="rounded-xl border border-gray-200 p-3 text-gray-800"
          :placeholder="$t('order.completion.note_placeholder')"
        />
      </label>

      <p v-if="errorMessage === 'note_required'" class="text-sm text-red-600">
        {{ $t('order.completion.note_required') }}
      </p>
      <p v-else-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

      <div v-if="showRejectConfirm" class="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800">
        {{ $t('order.completion.reject_confirm') }}
      </div>

      <div class="flex flex-col md:flex-row gap-3">
        <ButtonsFilled :disabled="loader" @click="confirmCompletion">
          {{ $t('order.completion.confirm') }}
        </ButtonsFilled>
        <ButtonsDanger :loader="loader" @click="rejectCompletion">
          {{ showRejectConfirm ? $t('order.completion.reject_confirm_action') : $t('order.completion.reject') }}
        </ButtonsDanger>
        <ButtonsOutline v-if="showRejectConfirm" :disabled="loader" @click="showRejectConfirm = false">
          {{ $t('order.completion.cancel') }}
        </ButtonsOutline>
      </div>
    </template>

    <template v-else-if="canUndo">
      <span class="text-xl md:text-2xl font-medium text-gray-800">{{ $t('order.completion.rejected_title') }}</span>
      <p class="text-gray-500">{{ $t('order.completion.rejected_description') }}</p>
      <p v-if="order.customer_completion_note" class="rounded-xl bg-gray-100 p-4 text-gray-700 whitespace-pre-wrap">
        {{ order.customer_completion_note }}
      </p>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
      <ButtonsOutline :disabled="loader" @click="undoReject">
        {{ $t('order.completion.undo_reject') }}
      </ButtonsOutline>
    </template>
  </section>
</template>
