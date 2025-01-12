import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/Homepage.vue";
import Add from "../pages/Add.vue";
import History from "../pages/History.vue";
import Order from "../pages/Order.vue";
import Login from "../pages/login.vue";
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
  {
    path: "/login",
    name: "login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
