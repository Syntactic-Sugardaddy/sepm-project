<script setup lang="ts">
import { useAuthService } from '@/services/auth-service';
import { useAuthStore } from '../stores/auth-store';
import { useErrorHandler } from '@/composables/errorHandler';
import type { AuthRequest } from '@/dtos/auth-request';

const authRequest = ref<AuthRequest>({ email: '', password: '' });

const authStore = useAuthStore();

const toast = useToast();
const erroHandler = useErrorHandler(toast);

const rules = {
  email: { required, email },
  password: { required, minLength: minLength(8), maxLength: maxLength(72) },
};

const v$ = useVuelidate(rules, authRequest);

const route = useRoute();
const router = useRouter();

async function login() {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) {
    return;
  }

  const { loginUser } = useAuthService();
  try {
    const token = await loginUser(authRequest.value);
    authStore.setToken(token);
    const redirectTo = route.query['redirect'];
    if (!Array.isArray(redirectTo) && redirectTo) {
      await router.push(redirectTo);
    } else {
      await router.push('/');
    }
  } catch (error) {
    erroHandler.error(error);
  }
}
</script>

<template>
  <div class="flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-8">
    <form class="max-w-lg w-full space-y-8 bg-slate-800 rounded p-6 text-white" @submit.prevent="login">
      <!-- Login Form -->

      <!-- Header -->
      <h1 class="text-lg font-bold">Login to your account</h1>
      <div class="flex flex-col gap-2">
        <div>
          <InputFloatingLabel
            label="Email"
            placeholder="Enter email"
            v-model="authRequest.email"
            class="w-full"
            type="email"
            name="email"
            :errors="v$.email.$errors" />
        </div>
        <div>
          <InputFloatingLabel
            label="Password"
            placeholder="Enter password"
            v-model="authRequest.password"
            class="w-full"
            type="password"
            name="password"
            :errors="v$.password.$errors" />
        </div>
      </div>
      <div>
        <ButtonGreen type="submit" class="w-full">Login</ButtonGreen>
        <RouterLink to="/forgot-password">
          <ButtonBlue class="w-full mt-5">Forgot your Password?</ButtonBlue>
        </RouterLink>
      </div>
    </form>
  </div>
</template>
