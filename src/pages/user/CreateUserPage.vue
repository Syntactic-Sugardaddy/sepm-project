<script setup lang="ts">
import { useCustomValidators } from '@/composables/customValidators';
import { useErrorHandler } from '@/composables/errorHandler';
import type { User } from '@/dtos/user/user';
import { useUserService } from '@/services/user-service';

const userService = useUserService();
const { notBlank } = useCustomValidators();
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const userRegister = ref<User>({ firstName: '', lastName: '', email: '', password: '' });
const passwordConfirm = ref<string>('');

const rules = {
  firstName: { required, notBlank, maxLength: maxLength(255) },
  lastName: { required, notBlank, maxLength: maxLength(255) },
  email: { required, email, maxLength: maxLength(255) },
  password: { required, minLength: minLength(8), maxLength: maxLength(255), sameAsRef: sameAs(passwordConfirm) },
};

const v$ = useVuelidate(rules, userRegister);
async function register(user: User) {
  try {
    const isFormCorrect = await v$.value.$validate();
    if (!isFormCorrect) {
      toast.error('User not created - please check your inputs');
      return;
    }
    await userService.create(user);
    toast.success('Successfully created User');
  } catch (error) {
    errorHandler.error(error);
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto mt-8 w-full bg-slate-800 rounded p-6 text-white">
    <!-- Header -->
    <h1 class="font-bold text-2xl">Create New User</h1>

    <!-- Form -->
    <div class="flex flex-col mt-6">
      <label class="bg-slate-700 rounded px-3 py-1.5 text-lg mb-2">Personal Data</label>
      <div class="flex flex-col gap-2 px-2">
        <InputFloatingLabel
          label="Firstname"
          placeholder="Firstname"
          v-model="userRegister.firstName"
          class="w-full"
          type="text"
          :errors="v$.firstName.$errors" />
        <InputFloatingLabel
          label="Lastname"
          placeholder="Lastname"
          v-model="userRegister.lastName"
          class="w-full"
          type="text"
          :errors="v$.lastName.$errors" />
        <InputFloatingLabel
          label="Email"
          placeholder="Enter"
          v-model="userRegister.email"
          class="w-full"
          type="email"
          :errors="v$.email.$errors" />
      </div>
    </div>
    <div class="flex flex-col mt-6">
      <label class="bg-slate-700 rounded px-3 py-1.5 text-lg my-2">Password</label>
      <div class="flex flex-col gap-2 px-2">
        <InputFloatingLabel
          label="Password"
          placeholder="Password"
          class="w-full"
          type="password"
          v-model="userRegister.password" />
        <InputFloatingLabel
          label="Confirm Password"
          placeholder="Confirm Password"
          class="w-full"
          type="password"
          v-model="passwordConfirm"
          :errors="v$.password.$errors" />
      </div>
    </div>
    <ButtonGreen id="create" class="w-full mt-8" @click="register(userRegister)">Create User</ButtonGreen>
  </div>
</template>
