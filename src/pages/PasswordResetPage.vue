<script setup lang="ts">
import { useErrorHandler } from '@/composables/errorHandler';
import type { PasswordResetCreate } from '@/dtos/passwordreset/password-reset-create';
import { usePasswordResetService } from '@/services/password-reset-service';

const passwordResetService = usePasswordResetService();

const toast = useToast();
const errorHandler = useErrorHandler(toast);

const resetInquiry = ref<PasswordResetCreate>({
  email: '',
});

const rules = {
  email: { required, email },
};

const v$ = useVuelidate(rules, resetInquiry);

async function createInquiry() {
  try {
    await passwordResetService.createPasswordReset(resetInquiry.value);
    toast.success('A link to reset your password was sent to the email address!');
  } catch (error) {
    errorHandler.error(error);
  }
}
</script>

<template>
  <form
    class="max-w-lg mx-auto mt-8 w-full flex flex-col bg-slate-800 rounded p-6 text-white"
    @submit.prevent="createInquiry()">
    <div>
      <p class="text-lg font-semibold">Forgot your password?</p>
      <p class="text-md mt-1 mb-3">Please enter your Email adress and we will send you a link to reset your password.</p>
    </div>
    <div>
      <InputFloatingLabel
        label="Email"
        placeholder="Enter email"
        v-model="resetInquiry.email"
        class="w-full"
        type="email"
        name="email"
        :errors="v$.email.$errors" />
    </div>
    <div>
      <ButtonGreen type="submit" class="w-full mt-6">Send Link</ButtonGreen>
      <div class="mt-4">
        <RouterLink to="/login">
          <p class="text-center font-semibold">Back to Login</p>
        </RouterLink>
      </div>
    </div>
  </form>
</template>
