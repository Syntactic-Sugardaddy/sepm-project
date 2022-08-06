<script setup lang="ts">
import { useAuthService } from '@/services/auth-service';
import type { User } from '@/dtos/user/user';
import { useCustomValidators } from '@/composables/customValidators';
import { useErrorHandler } from '@/composables/errorHandler';

const { notBlank } = useCustomValidators();

const router = useRouter();

const userRegister = ref<User>({ firstName: '', lastName: '', email: '', password: '' });

const passwordConfirm = ref<string>('');

const toast = useToast();
const errorHandler = useErrorHandler(toast);

const rules = {
  firstName: { required, notBlank, maxLength: maxLength(255) },
  lastName: { required, notBlank, maxLength: maxLength(255) },
  email: { required, email, maxLength: maxLength(255) },
  password: { required, minLength: minLength(8), maxLength: maxLength(72), sameAsRef: sameAs(passwordConfirm) },
};

const v$ = useVuelidate(rules, userRegister);

async function register() {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) {
    return;
  }

  const { registerUser } = useAuthService();
  try {
    const user = await registerUser(userRegister.value);
    console.log(user);
    toast.success('Registration was successful. Please log in.');
    await router.push('/login');
  } catch (error) {
    errorHandler.error(error);
  }
}
</script>

<template>
  <div class="flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-8">
    <div class="max-w-lg w-full space-y-8 bg-slate-800 rounded p-6 text-white">
      <!-- Register Form -->

      <!-- Header -->
      <h1 class="text-lg font-bold">Create your account</h1>

      <!-- First Name, Last Name, Email Forms -->
      <div>
        <p class="bg-slate-700 rounded px-3 py-1.5 text-lg">Personal Data</p>
        <div class="flex flex-col gap-2 mt-2">
          <InputFloatingLabel
            label="First Name"
            placeholder="Enter first name"
            v-model="userRegister.firstName"
            class="w-full"
            type="text"
            :errors="v$.firstName.$errors" />
          <InputFloatingLabel
            label="Last Name"
            placeholder="Enter last name"
            v-model="userRegister.lastName"
            class="w-full"
            type="text"
            :errors="v$.lastName.$errors" />
          <InputFloatingLabel
            label="Email"
            placeholder="Enter email"
            v-model="userRegister.email"
            class="w-full"
            type="email"
            :errors="v$.email.$errors" />
        </div>
      </div>

      <!-- Password Form -->
      <div>
        <p class="bg-slate-700 rounded px-3 py-1.5 text-lg">Password</p>
        <div class="flex flex-col gap-2 mt-2">
          <InputFloatingLabel
            label="Password"
            placeholder="Enter password"
            class="w-full"
            type="password"
            v-model="userRegister.password" />
          <InputFloatingLabel
            label="Confirm Password"
            placeholder="Enter password confirmation"
            class="w-full"
            type="password"
            v-model="passwordConfirm"
            :errors="v$.password.$errors" />
        </div>
      </div>
      <!-- Submit Button -->
      <div>
        <ButtonGreen class="w-full" @click="register">Create Account</ButtonGreen>
      </div>
    </div>
  </div>
</template>
