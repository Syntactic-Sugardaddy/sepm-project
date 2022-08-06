<script setup lang="ts">
import type { Ref } from 'vue';
import type { EventShowCreate } from '@/dtos/eventshow/event-show-create';
import { useEventShowService } from '@/services/event-show-service';
import type { Page } from '@/dtos/page';
import { useArtistService } from '@/services/artist-service';
import { useLocationService } from '@/services/location-service';
import { useEventService } from '@/services/event-service';
import type { ArtistDetail } from '@/dtos/artist/artist-detail';
import type { LocationDetail } from '@/dtos/location/location-detail';
import type { ArtistSearch } from '@/dtos/artist/artist-search';
import type { EventSearch } from '@/dtos/event/event-search';
import type { IsoDateTimeString } from '@/dtos/iso-date-time-string';
import type { EventType } from '@/dtos/event-type';
import type { LocationSearch } from '@/dtos/location/location-search';
import { useDebounceWatcher } from '@/composables/debounceWatcher';
import { useCustomValidators } from '@/composables/customValidators';
import type { Pagination } from '@/dtos/pagination';
import type { EventDetail } from '@/dtos/event/event-detail';
import { useErrorHandler } from '@/composables/errorHandler';
import type { SeatingPlanSearch } from '@/dtos/seatingplan/seating-plan-search';
import { useSeatingPlanService } from '@/services/seating-plan-service';
import type { SeatingPlan } from '@/dtos/seatingplan/seating-plan';

const newEventShow = ref<{
  name: string;
  startTime: IsoDateTimeString;
  endTime: IsoDateTimeString;
  price: number;
  eventId: number | null;
  locationId: number | null;
  artistId: number | null;
  seatingPlanId: number | null;
}>({
  name: '',
  startTime: '',
  endTime: '',
  price: 0,
  eventId: null,
  locationId: null,
  artistId: null,
  seatingPlanId: null,
});

const eventShowService = useEventShowService();
const artistService = useArtistService();
const locationService = useLocationService();
const eventService = useEventService();
const seatingPlanService = useSeatingPlanService();
const toast = useToast();
const errorHandler = useErrorHandler(toast);

const page = ref<Page>({ pageIndex: 0, pageSize: 10 });

const artists = ref<ArtistDetail[]>([]);
const totalArtists = ref<number>(0);
const events = ref<EventDetail[]>([]);
const totalEvents = ref<number>(0);
const locations = ref<LocationDetail[]>([]);
const totalLocations = ref<number>(0);
const seatingPlans = ref<SeatingPlan[]>([]);
const totalSeatingPlans = ref<number>(0);

const { notBlank, dateNotInPast, isAfterDateTime } = useCustomValidators();
const startTime = computed(() => newEventShow.value.startTime);
const endTimeAfterStartTime = helpers.withMessage('End date must be after start date', isAfterDateTime(startTime));

const rules = {
  name: { required, notBlank, maxLength: maxLength(255) },
  startTime: { required, dateNotInPast },
  endTime: { required, endTimeAfterStartTime, dateNotInPast }, //TODO: Validate time not in future, actual date (backend)
  price: { required, minValue: minValue(0) }, //TODO: Not negative
  eventId: { required },
  locationId: { required },
  artistId: { required },
  seatingPlanId: { required },
};

const searchTermsArtist = ref<{ firstName: string; lastName: string; stageName: string }>({
  firstName: '',
  lastName: '',
  stageName: '',
});

const searchTermsEvent = ref<{ title: string; type: EventType | null; duration: number | null; description: string }>({
  title: '',
  type: null,
  duration: null,
  description: '',
});

const searchTermsLocations = ref<{ name: string; country: string; city: string; postalCode: string; address: string }>({
  name: '',
  country: '',
  city: '',
  postalCode: '',
  address: '',
});

const searchTermsSeatingPlan = ref<{ name: string }>({
  name: '',
});

const selectedSeatingPlan = computed(() => {
  return seatingPlans.value.find((x) => newEventShow.value.seatingPlanId === x.id);
});

async function search<T>(
  searchValue: T,
  searchFunction: (value: T, page: Page) => Promise<Pagination<T>>,
  ref: Ref<T[]>,
  total: Ref<number>,
  resetFunc: () => void
) {
  resetFunc();
  try {
    const data = await searchFunction(searchValue, page.value);
    ref.value = data.elements;
    total.value = data.total;
  } catch (err) {
    errorHandler.error(err);
  }
}

const artistSearch = () =>
  search(
    searchTermsArtist.value as ArtistSearch,
    artistService.findByFilters,
    artists,
    totalArtists,
    () => (newEventShow.value.artistId = null)
  );

const locationSearch = () =>
  search(
    searchTermsLocations.value as LocationSearch,
    locationService.findByFilters,
    locations,
    totalLocations,
    () => (newEventShow.value.locationId = null)
  );

const eventSearch = () =>
  search(
    searchTermsEvent.value as EventSearch,
    eventService.findByFilters,
    events,
    totalEvents,
    () => (newEventShow.value.eventId = null)
  );

const seatingPlanSearch = () =>
  search(
    searchTermsSeatingPlan.value as SeatingPlanSearch,
    seatingPlanService.findByFilters,
    seatingPlans,
    totalSeatingPlans,
    () => (newEventShow.value.seatingPlanId = null)
  );

const setEventId = (id: number) => {
  newEventShow.value.eventId = id;
};

const setLocationId = (id: number) => {
  newEventShow.value.locationId = id;
};

const setArtistId = (id: number) => {
  newEventShow.value.artistId = id;
};

const setSeatingPlanId = (id: number) => {
  newEventShow.value.seatingPlanId = id;
};

const v$ = useVuelidate(rules, newEventShow);

async function addEventShow() {
  const validate = await v$.value.$validate();
  if (!validate) {
    toast.error('Show not created - please check your inputs');
    return;
  }
  try {
    await eventShowService.createShow(newEventShow.value as EventShowCreate);
    toast.success('Show created successfully!');
  } catch (error) {
    errorHandler.error(error);
  }
}

useDebounceWatcher(searchTermsArtist, artistSearch, 500);
useDebounceWatcher(searchTermsLocations, locationSearch, 500);
useDebounceWatcher(searchTermsEvent, eventSearch, 500);
useDebounceWatcher(searchTermsSeatingPlan, seatingPlanSearch, 500);
artistSearch();
locationSearch();
eventSearch();
seatingPlanSearch();
</script>

<template>
  <form @submit.prevent="addEventShow()">
    <!-- General Data -->
    <div class="flex rounded max-w-screen-lg mx-auto bg-slate-800 flex-col gap-1 p-8 mt-8">
      <h1 class="font-bold text-2xl text-white mb-4">Create a Show</h1>
      <label class="bg-slate-700 rounded px-3 py-1.5 text-lg mb-2 text-white">General Data</label>
      <div class="flex flex-col gap-2.5">
        <InputFloatingLabel
          label="Name"
          placeholder="The name of the show"
          type=""
          v-model="newEventShow.name"
          :errors="v$.name.$errors" />
        <div class="flex space-x-8">
          <InputFloatingLabel
            label="Start Date and Time"
            placeholder=""
            type="datetime-local"
            v-model="newEventShow.startTime"
            :errors="v$.startTime.$errors" />
          <InputFloatingLabel
            label="End Date and Time"
            placeholder=""
            type="datetime-local"
            v-model="newEventShow.endTime"
            :errors="v$.endTime.$errors" />
        </div>
        <InputCurrency label="Price" v-model="newEventShow.price" :errors="v$.price.$errors" />
      </div>
    </div>

    <!-- Artist Selection -->
    <div class="flex rounded max-w-screen-lg mx-auto bg-slate-800 flex-col gap-5 p-8 mt-4">
      <div class="flex justify-between bg-slate-700 text-white rounded px-3 py-1.5">
        <label class="text-lg">Artist</label>
        <p class="align-middle my-auto italic">Select an artist from the results</p>
      </div>
      <span v-for="error in v$.artistId.$errors" :key="error.$uid" class="text-rose-500 text-sm block">{{
        error.$message
      }}</span>
      <div class="flex flex-row gap-5">
        <InputFloatingLabel label="First Name" v-model="searchTermsArtist.firstName" placeholder="John" />
        <InputFloatingLabel label="Last Name" v-model="searchTermsArtist.lastName" placeholder="Doe" />
        <InputFloatingLabel label="Stage Name" v-model="searchTermsArtist.stageName" placeholder="Jim Jones" />
      </div>
      <ChooseableList
        :headers="['First Name', 'Last Name', 'Stage Name']"
        :object-array="artists"
        :shownFields="['firstName', 'lastName', 'stageName']"
        :totalNumberOf="totalArtists"
        :pageSize="page.pageSize"
        :newEventShowProperty="newEventShow.artistId"
        @setId="setArtistId">
      </ChooseableList>
    </div>

    <!-- Event Selection -->
    <div class="flex rounded max-w-screen-lg mx-auto bg-slate-800 flex-col gap-5 p-8 mt-4">
      <div class="flex justify-between bg-slate-700 rounded px-3 py-1.5">
        <label class="text-lg text-white">Event</label>
        <p class="text-white align-middle my-auto italic">Select an event from the results</p>
      </div>
      <span v-for="error in v$.eventId.$errors" :key="error.$uid" class="text-rose-500 text-sm block">{{
        error.$message
      }}</span>
      <div class="flex flex-row space-x-5">
        <div class="w-1/4">
          <InputFloatingLabel label="Title" v-model="searchTermsEvent.title" placeholder="Party" />
        </div>
        <div class="flex flex-col w-1/4 pl-5">
          <SelectEvent v-model="searchTermsEvent.type" :required="true"></SelectEvent>
        </div>
        <div class="w-1/2">
          <InputFloatingLabel label="Description" v-model="searchTermsEvent.description" placeholder="Description" />
        </div>
      </div>
      <ChooseableList
        :headers="['Title', 'Type', 'Description']"
        :object-array="events"
        :shownFields="['title', 'type', 'description']"
        :totalNumberOf="totalEvents"
        :pageSize="page.pageSize"
        :newEventShowProperty="newEventShow.eventId"
        @setId="setEventId">
      </ChooseableList>
    </div>

    <!-- Location Selection -->
    <div class="flex rounded max-w-screen-lg mx-auto bg-slate-800 flex-col gap-5 p-8 mt-4">
      <div class="flex justify-between bg-slate-700 rounded px-3 py-1.5">
        <label class="text-lg text-white">Location</label>
        <p class="text-white align-middle my-auto italic">Select a loaction from the results</p>
      </div>
      <span v-for="error in v$.locationId.$errors" :key="error.$uid" class="text-rose-500 text-sm block">{{
        error.$message
      }}</span>
      <div class="flex flex-row gap-5">
        <InputFloatingLabel label="Name" v-model="searchTermsLocations.name" placeholder="Freedom Stadium" />
        <InputFloatingLabel label="Country" v-model="searchTermsLocations.country" placeholder="USA" />
        <InputFloatingLabel label="City" v-model="searchTermsLocations.city" placeholder="Washington" />
        <InputFloatingLabel label="Postal Code" v-model="searchTermsLocations.postalCode" placeholder="12345" />
        <InputFloatingLabel label="Address" v-model="searchTermsLocations.address" placeholder="Downing Street 213" />
      </div>
      <ChooseableList
        :headers="['Name', 'Country', 'City', 'Postal Code', 'Address']"
        :object-array="locations"
        :shownFields="['name', 'country', 'city', 'postalCode', 'address']"
        :totalNumberOf="totalLocations"
        :pageSize="page.pageSize"
        :newEventShowProperty="newEventShow.locationId"
        @setId="setLocationId">
      </ChooseableList>
    </div>

    <!-- Seating Plan Selection -->
    <div class="flex rounded max-w-screen-lg mx-auto bg-slate-800 flex-col p-8 mt-4">
      <div class="flex justify-between bg-slate-700 rounded px-3 py-1.5 mb-2">
        <label class="text-lg text-white">Seating Plan</label>
        <p class="text-white align-middle my-auto italic">Select a seating plan from the results</p>
      </div>
      <span v-for="error in v$.seatingPlanId.$errors" :key="error.$uid" class="text-rose-500 text-sm block">{{
        error.$message
      }}</span>
      <InputFloatingLabel label="Name" v-model="searchTermsSeatingPlan.name" placeholder="Freedom Stadium" />
      <div class="grid grid-cols-2">
        <ChooseableList
          :headers="['Name']"
          :object-array="seatingPlans"
          :shownFields="['name']"
          :totalNumberOf="totalSeatingPlans"
          :pageSize="page.pageSize"
          :newEventShowProperty="newEventShow.seatingPlanId"
          @setId="setSeatingPlanId"
          class="mt-10">
        </ChooseableList>
        <SeatingPlan v-if="selectedSeatingPlan" :seatingPlan="selectedSeatingPlan"></SeatingPlan>
      </div>
    </div>
    <div class="mb-8 max-w-screen-lg mx-auto mt-4">
      <ButtonGreen type="submit" class="w-full py-2 text-lg">Create new Show</ButtonGreen>
    </div>
  </form>
</template>
