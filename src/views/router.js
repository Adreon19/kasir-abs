import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/Homepage.vue";
import Add from "../components/layout/Add.vue";
import History from "../components/layout/History.vue";
import Order from "../components/layout/Order.vue";
const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/add",
    name: "Add",
    component: Add,
  },
  {
    path: "/history",
    name: "History",
    component: History,
  },
  {
    path: "/order",
    name: "Order",
    component: Order,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
