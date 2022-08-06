<script setup lang="ts">
import { useUserService } from '@/services/user-service';
import { ref } from 'vue';
import type { UserDetail } from '@/dtos/user/user-detail';
import { useCustomValidators } from '@/composables/customValidators';
import { useErrorHandler } from '@/composables/errorHandler';
import type { UserEdit } from '@/dtos/user/user-edit';
import { useAuthStore } from '@/stores/auth-store';
import type { UserEditPassword } from '@/dtos/user/user-edit-password';

const { notBlank } = useCustomValidators();
const userService = useUserService();
const router = useRouter();
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const passwordConfirm = ref<string>('');
const userData = ref<UserDetail | null>(null);
const userEditForm = ref<UserEdit>({ firstName: '', lastName: '', address: '' });
const userEditPasswordForm = ref<UserEditPassword>({ password: '', newPassword: '' });
const deleteWindowOpen = ref<boolean>(false);
const messages = {
  question: 'Are you sure you want to delete your account? This is permanent and can not be undone!',
  positive: 'Delete',
  negative: 'Cancel',
};

const rulesPersonalInfo = {
  firstName: { required, notBlank, maxLength: maxLength(255) },
  lastName: { required, notBlank, maxLength: maxLength(255) },
  address: { maxLength: maxLength(255) },
};

const rulesPassword = {
  newPassword: { required, notBlank, minLength: minLength(8), maxLength: maxLength(255), sameAsRef: sameAs(passwordConfirm) },
};

const vPrs$ = useVuelidate(rulesPersonalInfo, userEditForm);
const vPwd$ = useVuelidate(rulesPassword, userEditPasswordForm);

const authStore = useAuthStore();

async function editUser() {
  const isFormCorrect = await vPrs$.value.$validate();
  if (!isFormCorrect) {
    return;
  }
  try {
    const userValue = userData.value;
    if (!userValue) {
      return;
    }
    const updatedUser = await userService.editUser(userEditForm.value);
    userData.value = await userService.fetchCurrentUser();
    console.log(updatedUser);
    toast.success('Edit was successful.');
  } catch (error) {
    errorHandler.error(error);
  }
}

async function editUserPassword() {
  const isFormCorrect = await vPwd$.value.$validate();
  if (!isFormCorrect) {
    return;
  }
  try {
    const userValue = userData.value;
    if (!userValue) {
      return;
    }
    const updatedUser = await userService.editUserPassword(userEditPasswordForm.value);
    userData.value = await userService.fetchCurrentUser();
    console.log(updatedUser);
    toast.success('Edit was successful.');
  } catch (error) {
    errorHandler.error(error);
  }
}

async function deleteAccount() {
  try {
    const userValue = userData.value;
    if (!userValue) {
      return;
    }
    await userService.deleteCurrentUser();
    authStore.logoutUser();
    toast.success(`Deleted your account (${userValue.email}). You're logged out.`);
    await router.push('/login');
  } catch (error) {
    errorHandler.error(error);
  }
}

const loadUserData = async () => {
  userData.value = await userService.fetchCurrentUser();
  userEditForm.value.firstName = userData.value.firstName;
  userEditForm.value.lastName = userData.value.lastName;
  userEditForm.value.address = userData.value.address;
};
loadUserData();
</script>

<template>
  <div class="max-w-screen-sm mx-auto">
    <h1 class="bg-slate-800 rounded-t pt-4 px-8 w-fit text-center text-white text-xl mt-8">
      Profile of {{ userData?.firstName }}
    </h1>
  </div>
  <div class="max-w-screen-sm mx-auto rounded-b rounded-tr bg-slate-800 flex flex-col gap-4 p-8 text-white bold mb-10">
    <div class="flex flex-row gap-3">
      <RouterLink :to="'/user-tickets'" class="basis-1/2">
        <ButtonBlue class="bg-blue-500 w-full rounded p-2 text-center"> Show my Tickets </ButtonBlue>
      </RouterLink>
      <RouterLink :to="'/merchandise'" class="basis-1/2">
        <ButtonGreen class="bg-emerald-500 w-full rounded p-2 text-center">
          Redeem Points ({{ userData?.points }})
        </ButtonGreen>
      </RouterLink>
    </div>
    <div>
      <div class="bg-slate-700 rounded px-3 py-2 text-lg">Personal Data</div>
      <div class="flex flex-col gap-3 p-2">
        <InputFloatingLabel
          label="First Name"
          placeholder="First Name"
          v-model="userEditForm.firstName"
          class="w-full"
          type="text"
          :errors="vPrs$.firstName.$errors" />
        <InputFloatingLabel
          label="Last Name"
          placeholder="Last Name"
          v-model="userEditForm.lastName"
          class="w-full"
          type="text"
          :errors="vPrs$.lastName.$errors" />
        <InputFloatingLabel
          label="Address"
          placeholder="Edit address"
          v-model="userEditForm.address"
          class="w-full"
          type="text"
          :errors="vPrs$.address.$errors" />
        <ButtonGreen class="w-fit place-self-end mt-2" @click="editUser">Save Changes</ButtonGreen>
      </div>
    </div>
    <!-- Password Form -->
    <div>
      <div class="bg-slate-700 rounded mt-3 px-3 py-2 text-lg">Change Password</div>
      <div class="flex flex-col gap-3 p-2">
        <InputFloatingLabel
          label="Old Password"
          placeholder="Old password"
          class="w-full"
          type="password"
          v-model="userEditPasswordForm.password" />
        <InputFloatingLabel
          label="New Password"
          placeholder="New password"
          class="w-full"
          type="password"
          v-model="userEditPasswordForm.newPassword" />
        <InputFloatingLabel
          label="Confirm Password"
          placeholder="Enter password confirmation"
          class="w-full"
          type="password"
          v-model="passwordConfirm"
          :errors="vPwd$.newPassword.$errors" />
        <ButtonGreen class="w-fit place-self-end mt-2" @click="editUserPassword"> Save Changes </ButtonGreen>
      </div>
    </div>
    <div class="px-2">
      <ButtonRed
        class="w-full"
        v-on:click="
          {
            deleteWindowOpen = true;
          }
        ">
        Delete account
      </ButtonRed>
    </div>
  </div>
  <DialogConfirm
    :isOpen="deleteWindowOpen"
    :messages="messages"
    @accepted="deleteAccount"
    @canceled="
      {
        deleteWindowOpen = false;
      }
    ">
  </DialogConfirm>
</template>
