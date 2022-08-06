<script setup lang="ts">
import type { PasswordResetChange } from '@/dtos/passwordreset/password-reset-change';
import { useErrorHandler } from '@/composables/errorHandler';
import { usePasswordResetService } from '@/services/password-reset-service';
import type { PasswordResetDetail } from '@/dtos/passwordreset/password-reset-detail';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const passwordResetService = usePasswordResetService();
const errorHandler = useErrorHandler(toast);

const token = route.query['reset-token'] + '';

const passwordReset = ref<PasswordResetDetail | null>(null);
const passwordResetChange = ref<PasswordResetChange>({ token: '', email: '', password: '' });
const repeat = ref('');
const errorMsg = ref('');

const loadPasswordReset = async () => {
  if (!token) {
    toast.error('Missing password reset token');
    return;
  }
  try {
    passwordReset.value = await passwordResetService.checkPasswordResetByUUID(token);
    passwordResetChange.value.token = passwordReset.value.token;
    passwordResetChange.value.email = passwordReset.value.email;
  } catch (error) {
    errorMsg.value = await errorHandler.getErrorMessage(error);
  }
};

loadPasswordReset();

const rules = {
  password: { required, minLength: minLength(8), maxLength: maxLength(255), sameAsRef: sameAs(repeat) },
};

const v$ = useVuelidate(rules, passwordResetChange.value);

async function resetPassword() {
  try {
    const check = await v$.value.$validate();
    if (!check) {
      return;
    }
    await passwordResetService.changePasswordOfUser(passwordResetChange.value);
    toast.success('Your password was changed successfully!');
    router.push('/login');
  } catch (error) {
    errorHandler.error(error);
  }
}
</script>

<template>
  <div v-if="passwordReset">
    <div class="flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-8">
      <form class="max-w-md w-full space-y-8 bg-slate-800 rounded p-6 text-white" @submit.prevent="resetPassword">
        <!-- Login Form -->

        <!-- Header -->
        <h1 class="text-lg font-bold">Change your password</h1>
        <div>
          <div>
            <InputBase
              label="Password"
              placeholder="Enter password"
              v-model="passwordResetChange.password"
              class="w-full"
              type="password"
              name="password"
              :errors="v$.password.$errors" />
          </div>
          <div>
            <InputBase
              label="Confirm Password"
              placeholder="Enter password confirmation"
              v-model="repeat"
              class="w-full"
              type="password"
              name="repeat"
              :errors="v$.password.$errors" />
          </div>
        </div>
        <div>
          <ButtonGreen type="submit" class="w-full">Change Password</ButtonGreen>
        </div>
      </form>
    </div>
  </div>
  <div v-else>
    <div class="text-white flex justify-center text-lg font-bold py-7">
      <p>{{ errorMsg }}</p>
    </div>
  </div>
</template>
