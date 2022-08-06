<script setup lang="ts">
import type { EventCreate } from '@/dtos/event/event-create';
import { useEventService } from '@/services/event-service';
import type { EventType } from '@/dtos/event-type';
import { useCustomValidators } from '@/composables/customValidators';
import { useErrorHandler } from '@/composables/errorHandler';

const { notBlank, validEventType } = useCustomValidators();

const toast = useToast();
const errorHandler = useErrorHandler(toast);

const rules = {
  title: { required, notBlank, maxLength: maxLength(255) },
  type: { required, validEventType },
  description: { required, maxLength: maxLength(255) },
};

const newEvent = ref<{ title: string; type: EventType | null; description: string }>({
  title: '',
  type: null,
  description: '',
});

const eventService = useEventService();

const v$ = useVuelidate(rules, newEvent);

async function addEvent() {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) {
    toast.error('Event not created - please check your inputs');
    return;
  }
  try {
    const event = await eventService.create(newEvent.value as EventCreate);
    console.log(event);
    toast.success('Event created successfully!');
  } catch (error) {
    errorHandler.error(error);
  }
}
</script>

<template>
  <div class="flex rounded max-w-screen-md mx-auto bg-slate-800 flex-col p-8 mt-8">
    <h1 class="font-bold text-2xl text-white mb-4">Create an Event</h1>
    <form @submit.prevent="addEvent">
      <div class="flex flex-col gap-2.5">
        <div class="flex space-x-8">
          <InputFloatingLabel label="Title" v-model="newEvent.title" placeholder="Party" :errors="v$.title.$errors" />
          <SelectEvent class="w-1/3" :required="true" v-model="newEvent.type"></SelectEvent>
        </div>
        <label for="Text" class="text-gray-300 mt-2">Description:</label>
        <textarea
          id="Text"
          v-model="newEvent.description"
          placeholder="Enter Description..."
          :errors="v$.description.$errors"
          rows="6"
          cols="100"
          class="form-control block w-full px-3 py-1.5 text-base text-white bg-slate-800 bg-clip-padding border border-solid border-gray-300 rounded m-0 focus:text-white focus:bg-slate-800 focus:border-blue-500 focus:outline-none" />
        <ButtonGreen type="submit" class="w-fit mt-5 place-self-end">Add Event</ButtonGreen>
      </div>
    </form>
  </div>
</template>
