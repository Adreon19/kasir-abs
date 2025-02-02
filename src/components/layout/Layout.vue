<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../supabase";
import { useRouter } from "vue-router";

const router = useRouter();
const darkMode = ref(false);
const checked = ref(false);

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error.message);
  } else {
    router.push("/login");
  }
};
function toggleDarkMode() {
  darkMode.value = !darkMode.value;
  checked.value = !darkMode.value;
  document.documentElement.classList.toggle("my-app-dark", darkMode.value);

  localStorage.setItem("darkMode", darkMode.value);
}
onMounted(() => {
  const savedDarkMode = localStorage.getItem("darkMode");

  if (savedDarkMode === "true") {
    darkMode.value = true;
    checked.value = true;
    document.documentElement.classList.add("my-app-dark");
  }
});
</script>

<template>
  <div class="flex flex-row min-h-screen">
    <aside
      class="sidebar text-black xl:max-w-64 xl:min-w-64 lg:max-w-64 lg:min-w-64 flex flex-col justify-between"
    >
      <div class="">
        <div class="logo flex items-center m-4">
          <img src="/images/logoABS.png" alt="ABS Logo" class="w-8 h-8 mr-4" />
          <h1 class="text-sm font-semibold text-[var(--text-primary)]">
            Artisan Beverage Studio
          </h1>
        </div>

        <div class="flex flex-col justify-between relative top-10">
          <ul class="flex flex-col">
            <div class="m-3">
              <ToggleSwitch v-model="checked" @click="toggleDarkMode()">
                <template #handle="{ checked }">
                  <i
                    :class="[
                      '!text-xs pi',
                      { 'pi-moon': checked, 'pi-sun': !checked },
                    ]"
                  />
                </template>
              </ToggleSwitch>
            </div>
            <RouterLink to="/">
              <li>
                <i class="fa-solid fa-book-open ease-in duration-300"></i> Menu
              </li>
            </RouterLink>
            <RouterLink to="/history">
              <li>
                <i class="fa-solid fa-scroll ease-in duration-300"></i> Riwayat
                Pesanan
              </li>
            </RouterLink>
            <RouterLink to="/order">
              <li>
                <i class="fa-solid fa-cart-shopping ease-in duration-300"></i>
                Pesanan
              </li>
            </RouterLink>
            <RouterLink to="/money">
              <li>
                <i class="fa-solid fa-money-bill ease-in duration-300"></i>
                Keuangan
              </li>
            </RouterLink>
            <RouterLink to="/add">
              <li>
                <i class="fa-solid fa-square-plus ease-in duration-300"></i>
                Tambah Menu
              </li>
            </RouterLink>
          </ul>
        </div>
      </div>
      <div class="flex justify-center mb-4">
        <Button
          label="Log Out"
          icon="fa-solid fa-sign-out-alt"
          class="bg-var[--btn-secondary] text-[var(--text-secondary)] text-xl px-5 rounded-md shadow-custom-dark"
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
  width: 650px;
  height: 100vh;
  position: sticky;
  overflow: hidden;
  top: 0;
  background-color: var(--sidebar-bg);
}

.sidebar li {
  padding: 1rem;
  font-size: 20px;
  color: var(--text-primary);
}

.sidebar li:hover {
  color: #fff;
  background: var(--hover-primary);
  width: 100%;
  transition: 0.5s;
}

.sidebar i {
  /* margin-right: 15px; */
}
</style>
