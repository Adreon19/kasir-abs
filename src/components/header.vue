<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";
import { useRouter } from "vue-router";

const router = useRouter();
const darkMode = ref(false);
const checked = ref(false);
const nama = ref("");
const drawerVisible = ref(false);
const userRoleId = ref(null);

const fetchUserData = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;

    if (user) {
      const { data, error: userError } = await supabase
        .from("user")
        .select("name, role_id")
        .eq("user_id", user.id)
        .single();

      if (userError) throw userError;

      if (data) {
        nama.value = data.name;
        userRoleId.value = data.role_id;
      } else {
        userRoleId.value = null;
      }
    } else {
      nama.value = "";
      userRoleId.value = null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    nama.value = "";
    userRoleId.value = null;
  }
};

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error.message);
  } else {
    router.push("/login");
  }
};

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  checked.value = !darkMode.value;
  document.documentElement.classList.toggle("my-app-dark", darkMode.value);
  localStorage.setItem("darkMode", darkMode.value);
};

const toggleDrawer = () => {
  drawerVisible.value = !drawerVisible.value;
};

const closeDrawer = () => {
  drawerVisible.value = false;
};

onMounted(() => {
  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode === "true") {
    darkMode.value = true;
    checked.value = true;
    document.documentElement.classList.add("my-app-dark");
  }
  fetchUserData();
  supabase.auth.onAuthStateChange(event => {
    if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) {
      fetchUserData();
    }
  });
});
</script>

<template>
  <!-- HEADER BAR -->
  <header class="flex gap-3 items-center py-3 sticky top-0 z-40">
    <!-- Tombol burger (muncul hanya di mobile/tablet) -->
    <Button
      class="xl:hidden text-[var(text-secondary)] bg-[var(--btn-secondary)]"
      icon="pi pi-bars"
      @click="toggleDrawer"
    />

    <!-- Slot untuk judul/heading -->
    <div class="flex items-center">
      <slot />
    </div>

    <!-- Tombol logout (muncul hanya di desktop) -->
    <Button
      label="Log Out"
      icon="fa-solid fa-sign-out-alt"
      class="hidden xl:flex btn-log bg-[var(--btn-secondary)] text-base px-4 rounded-md shadow-custom-dark"
      @click="handleLogout"
    />
  </header>

  <!-- DRAWER MENU (hanya mobile & tablet) -->
  <Drawer
    v-model:visible="drawerVisible"
    :modal="true"
    :closable="true"
    :style="{ width: '100%' }"
    @hide="closeDrawer"
    class="bg-[var(--sidebar-bg)] xl:hidden"
  >
    <div class="sidebar-mobile flex flex-col justify-between overflow-y-auto">
      <ul class="flex flex-col">
        <RouterLink to="/profile" @click="closeDrawer">
          <li><i class="fa-solid fa-user"></i> {{ nama }}</li>
        </RouterLink>

        <div class="m-3">
          <ToggleSwitch v-model="checked" @click="toggleDarkMode">
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

        <RouterLink to="/" @click="closeDrawer">
          <li><i class="fa-solid fa-house"></i> Halaman Menu</li>
        </RouterLink>
        <RouterLink to="/order" @click="closeDrawer">
          <li><i class="fa-solid fa-cart-shopping"></i> Pesanan</li>
        </RouterLink>
        <RouterLink v-if="userRoleId === 1" to="/add" @click="closeDrawer">
          <li><i class="fa-solid fa-square-plus"></i> Tambah Menu</li>
        </RouterLink>
        <RouterLink to="/history" @click="closeDrawer">
          <li><i class="fa-solid fa-scroll"></i> Riwayat Pesanan</li>
        </RouterLink>
        <RouterLink v-if="userRoleId === 1" to="/money" @click="closeDrawer">
          <li><i class="fa-solid fa-money-bill"></i> Finansial</li>
        </RouterLink>
        <RouterLink to="/inventory" @click="closeDrawer">
          <li><i class="fa-solid fa-boxes-stacked"></i> Inventory</li>
        </RouterLink>

        <div class="flex justify-center mt-6">
          <Button
            label="Log Out"
            icon="fa-solid fa-sign-out-alt"
            class="md:hidden btn-log bg-[var(--btn-secondary)] text-lg px-5 rounded-md shadow-custom-dark"
            @click="handleLogout"
          />
        </div>
      </ul>
    </div>
  </Drawer>
</template>

<style scoped>
.sidebar-mobile {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--sidebar-bg);
}

.sidebar-mobile li {
  padding: 1rem;
  font-size: 18px;
  color: var(--text-primary);
}

.sidebar-mobile li:hover {
  background: var(--hover-primary);
  transition: 0.3s;
}
</style>
