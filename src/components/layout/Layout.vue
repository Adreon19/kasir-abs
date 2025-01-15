<script setup>
import { supabase } from "../../supabase";
import { useRouter } from "vue-router";

const router = useRouter();

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error.message);
  } else {
    router.push("/login");
  }
};
</script>

<template>
  <div class="flex flex-row min-h-screen">
    <aside class="sidebar text-black">
      <div class="m-4">
        <div class="logo flex items-center">
          <img src="/images/logoABS.png" alt="ABS Logo" class="w-8 h-8 mr-4" />
          <h1 class="text-xl font-semibold text-white">
            Artisan Beverage Studio
          </h1>
        </div>
      </div>

      <ul class="flex flex-col justify-center">
        <RouterLink to="/">
          <li>
            <i class="fa-solid fa-house ease-in duration-300"></i> Home Page
          </li>
        </RouterLink>
        <RouterLink to="/history">
          <li>
            <i class="fa-solid fa-scroll ease-in duration-300"></i> History Menu
          </li>
        </RouterLink>
        <RouterLink to="/order">
          <li>
            <i class="fa-solid fa-cart-shopping ease-in duration-300"></i> Order
          </li>
        </RouterLink>
        <RouterLink to="/add">
          <li>
            <i class="fa-solid fa-square-plus ease-in duration-300"></i> Add
            Menu
          </li>
        </RouterLink>

        <li>
          <Button
            label="Log Out"
            icon="fa-solid fa-sign-out-alt"
            class="shadow-lg"
            @click="handleLogout"
          />
        </li>
      </ul>
    </aside>

    <div class="flex-grow flex flex-col">
      <main class="flex-grow">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 350px;
  height: 100vh;
  position: sticky;
  top: 0;
  background-color: var(--sidebar-color);
}

.sidebar li {
  padding: 1rem;
  font-size: 20px;
}

.sidebar li:hover {
  color: #fff;
  background: #000;
  width: 100%;
  transition: 0.5s;
}

.sidebar i {
  margin-right: 15px;
}

li {
  color: var(--primary-text);
}

button {
  background: var(--sidebar-color);
}
</style>
