<script setup lang="ts">
import { useRouterRef } from '@/composables/routerRef';
import type { Page } from '@/dtos/page';
import type { UserDetail } from '@/dtos/user/user-detail';
import type { UserSearch } from '@/dtos/user/user-search';
import { useUserService } from '@/services/user-service';
import { useErrorHandler } from '@/composables/errorHandler';
import { useDebounceWatcher } from '@/composables/debounceWatcher';
import { usePasswordResetService } from '@/services/password-reset-service';
import type { PasswordResetCreate } from '@/dtos/passwordreset/password-reset-create';

const users = ref<UserDetail[]>([]);
const userService = useUserService();
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const searchTerms = ref<UserSearch>({ email: '' });

const total = ref<number | null>(null);
const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 }, ['pageSize']);

const passwordReset = usePasswordResetService();

const messageDeleteUser = {
  question: 'Are you sure you want to delete this user?',
  positive: 'Delete',
  negative: 'Cancel',
};

const messagesResetPW = {
  question: 'Are you sure you want to reset the password of this user?',
  positive: 'Reset Password',
  negative: 'Cancel',
};

const isDeleteDialogOpen = ref<boolean>(false);
const toBeDeletedUser = ref<UserDetail>({
  id: -1,
  firstName: '',
  lastName: '',
  email: '',
  isAdmin: null,
  isLocked: null,
  address: '',
  points: 0,
});

const isPasswordResetDialogOpen = ref<boolean>(false);
const passwordResetCreate = ref<PasswordResetCreate>({ email: '' });

const deletedUserName = '';

const reloadUsers = async () => {
  try {
    const data = await userService.findByFilters(searchTerms.value, page.value as Page);
    users.value = data.elements;
    total.value = data.total;
  } catch (error) {
    errorHandler.error(error);
  }
};

reloadUsers();

async function lockUnlock(user: UserDetail) {
  try {
    await userService.lock(user.id, !user.isLocked);
    await reloadUsers();
    const message = `User (Email: ${user.email}) ${!user.isLocked ? 'locked' : 'unlocked'} successfully`;
    toast.success(message);
  } catch (error) {
    errorHandler.error(error);
  }
}
async function deleteUser(user: UserDetail) {
  try {
    await userService.deleteUser(user.id);
    console.log('User to delete: ' + user.firstName);
    await reloadUsers();
  } catch (error) {
    errorHandler.error(error);
  }
}

async function sendResetRequest() {
  isPasswordResetDialogOpen.value = false;
  passwordReset
    .createPasswordReset(passwordResetCreate.value)
    .then(() => {
      toast.success('An email with a reset link has been sent to this user.');
    })
    .catch((error) => errorHandler.error(error));
}

useDebounceWatcher(searchTerms, reloadUsers, 500);
</script>

<template>
  <!-- Simple pop-up dialog box -->
  <DialogConfirm
    :isOpen="isDeleteDialogOpen"
    :messages="messageDeleteUser"
    :itemName="deletedUserName"
    @canceled="isDeleteDialogOpen = false"
    @accepted="
      () => {
        deleteUser(toBeDeletedUser);
        isDeleteDialogOpen = false;
      }
    ">
  </DialogConfirm>
  <DialogConfirm
    :isOpen="isPasswordResetDialogOpen"
    :messages="messagesResetPW"
    :itemName="'(Email: ' + passwordResetCreate.email + ')'"
    @canceled="isPasswordResetDialogOpen = false"
    @accepted="sendResetRequest">
  </DialogConfirm>

  <div class="max-w-screen-lg mx-auto">
    <h1 class="bg-slate-800 rounded py-3 mt-8 mb-4 text-3xl font-semibold text-white text-center">Administration</h1>

    <!-- Create Buttons -->
    <div class="flex gap-2.5 text-white text-lg">
      <RouterLink to="/event-show/create" class="basis-1/5">
        <ButtonBlue class="w-full">Create Show</ButtonBlue>
      </RouterLink>
      <RouterLink to="/event/create" class="basis-1/5">
        <ButtonBlue class="w-full">Create Event</ButtonBlue>
      </RouterLink>
      <RouterLink to="/news/create" class="basis-1/5">
        <ButtonBlue class="w-full">Create News</ButtonBlue>
      </RouterLink>
      <RouterLink to="/merchandise/create" class="basis-1/5">
        <ButtonBlue class="w-full">Create Merchandise</ButtonBlue>
      </RouterLink>
      <RouterLink to="/user/create" class="basis-1/5">
        <ButtonBlue class="w-full">Create User</ButtonBlue>
      </RouterLink>
    </div>

    <!-- Filter -->
    <div class="flex rounded bg-slate-800 justify-between pt-0 p-6 mt-8 text-white">
      <div class="flex basis-1/2">
        <label class="text-white text-2xl font-semibold place-self-end mr-2">Users</label>
        <span class="text-white place-self-end text-sm">(Current User not displayed)</span>
      </div>
      <div class="flex basis-1/2">
        <p class="font-semibold text-lg place-self-end min-w-fit align-middle mr-3">Filter Users:</p>
        <InputFloatingLabel class="-bottom-2" label="Email" v-model="searchTerms.email" placeholder="user@email.com" />
      </div>
    </div>

    <!-- Users -->
    <div class="mt-4" v-if="total != null && total > 0">
      <div class="flex flex-col gap-2 mt-2">
        <div v-for="user in users" :key="user.id" class="">
          <div class="p-6 flex items-center justify-between rounded bg-slate-800 text-white">
            <div class="">
              <p>Email: {{ user.email }}</p>
              <p>First Name: {{ user.firstName }}</p>
              <p>Last Name: {{ user.lastName }}</p>
            </div>

            <!-- Action Buttons (Delete, Lock, Reset Password) -->
            <div class="flex flex-end gap-4">
              <div v-if="user.isLocked">
                <ButtonRed class="flex items-center gap-2" @click="lockUnlock(user)" title="Unlock user">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-lock-fill"
                    viewBox="0 0 16 16">
                    <path
                      d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  </svg>
                  Locked
                </ButtonRed>
              </div>

              <div v-if="!user.isLocked">
                <ButtonBlue class="flex items-center gap-2" @click="lockUnlock(user)" title="Lock user">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-unlock-fill"
                    viewBox="0 0 16 16">
                    <path
                      d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z" />
                  </svg>
                  Unlocked
                </ButtonBlue>
              </div>

              <div>
                <ButtonRed
                  class="flex items-center gap-2"
                  @click="
                    () => {
                      toBeDeletedUser = user;
                      deletedUserName = '(Email: ' + user.email + ')';
                      isDeleteDialogOpen = true;
                      isPasswordResetDialogOpen = false;
                    }
                  ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-trash"
                    viewBox="0 0 16 16">
                    <path
                      d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                    <path
                      fill-rule="evenodd"
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                  </svg>
                  Delete
                </ButtonRed>
              </div>
              <div>
                <ButtonGreen
                  @click="
                    {
                      passwordResetCreate.email = user.email;
                      isPasswordResetDialogOpen = true;
                      isDeleteDialogOpen = false;
                    }
                  ">
                  Reset Password
                </ButtonGreen>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <h1 class="mt-2 text-white text-2xl font-semibold py-2" v-if="total === 0">No user found</h1>

    <PaginationBar
      :total="total ?? 0"
      v-model:page-size="page.pageSize"
      v-model:page-index="page.pageIndex"
      @switch-page="reloadUsers">
    </PaginationBar>
  </div>

  <div class="max-w-screen-md"></div>
</template>
