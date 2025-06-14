import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/Homepage.vue";
import Add from "../pages/Add.vue";
import History from "../pages/History.vue";
import Order from "../pages/Order.vue";
import Login from "../pages/login.vue";
import Money from "../pages/Money.vue";
import EditMenu from "../components/items/menu/edit/MenuEdit.vue";
import Register from "../pages/Account/Register.vue";
import EditCategory from "../components/items/category/edit/[id].vue";
import Inventory from "../pages/Inventory.vue";
import Profile from "../pages/Account/Profile.vue";
import Cart from "../pages/Order/Cart.vue";
import Edit from "../pages/Account/Edit.vue";
import { supabase } from "../supabase";

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
    meta: { requiresAuth: true, layout: true, requiresAdmin: true },
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
    meta: { requiresAuth: true, layout: true, requiresAdmin: true }, // Added requiresAdmin
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresAuth: false, layout: false },
  },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: { requiresAuth: false, layout: false },
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
    meta: { requiresAuth: true, layout: true },
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
    path: "/inventory",
    name: "Inventory",
    component: Inventory,
    meta: { requiresAuth: true, layout: true },
  },
  {
    path: "/cart",
    name: "Cart",
    component: Cart,
    meta: { requiresAuth: true, layout: true },
  },
  {
    path: "/profile/edit",
    name: "Edit",
    component: Edit,
    meta: { requiresAuth: true, layout: true, requiresAdmin: true },
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

  if (to.meta.requiresAdmin) {
    if (!session) {
      return next({ name: "login" });
    }

    try {
      const { data: user, error } = await supabase
        .from("user")
        .select("role_id")
        .eq("user_id", session.user.id)
        .single();
      if (error) {
        console.error("Error fetching user role:", error);
        return next({ name: "Home" });
      }

      if (user && user.role_id === 1) {
        next();
      } else {
        return next({ name: "Home" });
      }
    } catch (err) {
      console.error("Unexpected error during admin check:", err);
      return next({ name: "Home" });
    }
  } else {
    next();
  }
});

export default router;
