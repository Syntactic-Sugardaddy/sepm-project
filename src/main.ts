import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import Toast from 'vue-toastification';
import router from './router';

import 'vue-toastification/dist/index.css';
import './index.css';

const app = createApp(App);

app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true,
  containerClassName: 'my-toast-container',
});
app.use(createPinia());
app.use(router);

app.config.errorHandler = async (err, instance, info) => {
  console.error({
    err,
    instance,
    info,
  });
};

app.mount('#app');
