import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/Homepage.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/",
    name: "buat menu",
    component: HomePage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
