import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/Homepage.vue";
import Add from "../pages/Add.vue";
import History from "../pages/History.vue";
import Order from "../pages/Order.vue";
import Login from "../pages/login.vue";
import Money from "../pages/Money.vue";
import Member from "../pages/Member.vue";
import EditMenu from "../components/items/menu/edit/MenuEdit.vue";
import EditCategory from "../components/items/category/edit/[id].vue";
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
    path: "/money",
    name: "Money",
    component: Money,
    meta: { requiresAuth: true, layout: true },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresAuth: false, layout: false },
  },
  {
    path: "/menu/edit/:id",
    name: "EditMenu",
    component: EditMenu,
    props: true,
    meta: { layout: true },
  },
  {
    path: "/category/edit/:id",
    name: "EditCategory",
    component: EditCategory,
    props: true,
    meta: { layout: true },
  },
  {
    path: "/member",
    name: "Member",
    component: Member,
    meta: { requiresAuth: true, layout: true },
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
