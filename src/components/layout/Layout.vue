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
    <aside class="sidebar text-black max-w-64 flex flex-col justify-between">
      <div class="">
        <div class="logo flex items-center m-4">
          <img src="/images/logoABS.png" alt="ABS Logo" class="w-8 h-8 mr-4" />
          <h1 class="text-sm font-semibold text-white">
            Artisan Beverage Studio
          </h1>
        </div>

        <div class="flex flex-col justify-between">
          <ul class="flex flex-col">
            <RouterLink to="/">
              <li>
                <i class="fa-solid fa-house ease-in duration-300"></i> Halaman
                Menu
              </li>
            </RouterLink>

            <RouterLink to="/order">
              <li>
                <i class="fa-solid fa-cart-shopping ease-in duration-300"></i>
                Pesanan
              </li>
            </RouterLink>

            <RouterLink to="/add">
              <li>
                <i class="fa-solid fa-square-plus ease-in duration-300"></i>
                Tambah Menu
              </li>
            </RouterLink>

            <RouterLink to="/member">
              <li>
                <i class="fa-solid fa-users ease-in duration-300"></i> Member
              </li>
            </RouterLink>

            <RouterLink to="/history">
              <li>
                <i class="fa-solid fa-scroll ease-in duration-300"></i> Riwayat
                Pesanan
              </li>
            </RouterLink>

            <RouterLink to="/money">
              <li>
                <i class="fa-solid fa-money-bill ease-in duration-300"></i>
                Finansial
              </li>
            </RouterLink>
          </ul>
        </div>
      </div>

      <div class="m-4">
        <Button
          label="Log Out"
          icon="fa-solid fa-sign-out-alt"
          class="shadow-lg text-white"
          @click="handleLogout"
        />
      </div>
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
