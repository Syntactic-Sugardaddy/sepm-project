import { createRouter, createWebHashHistory } from 'vue-router';

import HomePageVue from '@/pages/HomePage.vue';
import LoginPage from '@/pages/LoginPage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import AdminPage from '@/pages/AdminPage.vue';

import SearchPage from '@/pages/event/SearchPage.vue';
import SearchArtistPage from '@/pages/event/search/SearchArtistPage.vue';
import SearchEventPage from '@/pages/event/search/SearchEventPage.vue';
import SearchEventShowPage from '@/pages/event/search/SearchEventShowPage.vue';
import SearchLocationPage from '@/pages/event/search/SearchLocationPage.vue';

import CreateEventPage from '@/pages/event/create/CreateEventPage.vue';
import CreateEventShowPage from '@/pages/event/create/CreateEventShowPage.vue';
import CreateNewsPage from '@/pages/news/CreateNewsPage.vue';

import DisplayEventsOfArtistPage from '@/pages/event/detail/DisplayEventsOfArtistPage.vue';
import DisplayEventShowsOfEventPage from '@/pages/event/detail/DisplayEventShowsOfEventPage.vue';
import DisplayEventShowsOfLocation from '@/pages/event/detail/DisplayEventShowsOfLocation.vue';

import BuyTicketPage from '@/pages/BuyTicketPage.vue';
import CheckoutPage from '@/pages/CheckoutPage.vue';
import InvoicePage from '@/pages/InvoicePage.vue';
import PasswordResetPage from '@/pages/PasswordResetPage.vue';
import PasswordReset from '@/pages/PasswordReset.vue';

import UserDetailPage from '@/pages/UserDetailPage.vue';
import UserTicketsPage from '@/pages/UserTicketsPage.vue';
import CreateUserPage from '@/pages/user/CreateUserPage.vue';
import UserInvoicePage from '@/pages/UserInvoicePage.vue';

import CreateMerchandisePage from '@/pages/merchandise/CreateMerchandiseProductPage.vue';
import SearchMerchandisePage from '@/pages/merchandise/SearchMerchandiseProductPage.vue';
import DetailMerchandisePage from '@/pages/merchandise/DetailMerchandiseProductPage.vue';

import NewsPage from '@/pages/news/NewsPage.vue';
import NewsDetailPage from '@/pages/news/NewsDetailPage.vue';

import { getUserRole } from '@/stores/auth-store';

const toast = useToast();

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomePageVue,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/search',
      component: SearchPage,
      children: [
        {
          path: '',
          redirect: '/search/event',
        },
        {
          path: 'artist',
          component: SearchArtistPage,
        },
        {
          path: 'event',
          component: SearchEventPage,
        },
        {
          path: 'event-show',
          component: SearchEventShowPage,
        },
        {
          path: 'location',
          component: SearchLocationPage,
        },
      ],
    },
    {
      path: '/artist/:id/events',
      component: DisplayEventsOfArtistPage,
    },
    {
      path: '/event/create',
      component: CreateEventPage,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/event/:id/event-shows',
      component: DisplayEventShowsOfEventPage,
    },
    {
      path: '/event-show/create',
      component: CreateEventShowPage,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/location/:id/event-shows',
      component: DisplayEventShowsOfLocation,
    },
    {
      path: '/event-show/:id',
      component: BuyTicketPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout',
      component: CheckoutPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/invoice/:id',
      component: InvoicePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/user-tickets',
      component: UserTicketsPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/user-page',
      component: UserDetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/user/create',
      component: CreateUserPage,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/merchandise/create',
      component: CreateMerchandisePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/merchandise/:id',
      component: DetailMerchandisePage,
    },
    {
      path: '/merchandise',
      component: SearchMerchandisePage,
    },
    {
      path: '/news/create',
      component: CreateNewsPage,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/news/:id',
      component: NewsDetailPage,
    },
    {
      path: '/news',
      component: NewsPage,
    },
    {
      path: '/forgot-password',
      component: PasswordResetPage,
    },
    {
      path: '/password-reset',
      component: PasswordReset,
    },
    {
      path: '/user-invoices',
      component: UserInvoicePage,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userRole = getUserRole();
  if (to.matched.some((record) => record.meta.requiresAuth) && userRole === 'UNDEFINED') {
    console.warn('not logged in');
    toast.info('Please log in!');
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }
  if (to.matched.some((record) => record.meta.requiresAdmin) && userRole !== 'ADMIN') {
    console.warn('not admin');
    toast.info('You are not logged in as an admin!');
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }
  next();
});

export default router;
