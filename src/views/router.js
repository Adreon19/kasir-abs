import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/Homepage.vue";
import Add from "../pages/Add.vue";
import History from "../pages/History.vue";
import Order from "../pages/Order.vue";
import Login from "../pages/login.vue";
import { supabase } from "../supabase"; // Import your Supabase instance

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { requiresAuth: true, layout: true }, // Requires authentication
  },
  {
    path: "/add",
    name: "Add",
    component: Add,
    meta: { requiresAuth: true, layout: true },
  },
  {
    path: "/history",
    name: "History",
    component: History,
    meta: { requiresAuth: true, layout: true },
  },
  {
    path: "/order",
    name: "Order",
    component: Order,
    meta: { requiresAuth: true, layout: true },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresAuth: false, layout: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (to.name === "login" && session) {
    return next({ name: "Home" });
  }
  if (to.meta.requiresAuth && !session) {
    return next({ name: "login" });
  }

  next();
});

export default router;
