import { createApp } from "vue";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import Aura from "@primevue/themes/aura";
import { ConfirmationService } from "primevue";
import router from "./views/router";
import "./style.css";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: "system",
      cssLayer: true,
    },
  },
});
app.use(router);
app.use(ToastService);
app.use(ConfirmationService);
app.mount("#app");
