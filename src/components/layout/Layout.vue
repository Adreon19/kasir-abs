<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../supabase";
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
        console.log("Fetched name:", nama.value);
      } else {
        console.log("No user data found in 'user' table.");
        userRoleId.value = null;
      }
    } else {
      nama.value = "";
      userRoleId.value = null;
      console.log("No authenticated user session.");
    }
  } catch (error) {
    console.error("Error fetching user data and role:", error);
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
  supabase.auth.onAuthStateChange((event, session) => {
    if (
      event === "SIGNED_IN" ||
      event === "SIGNED_OUT" ||
      event === "USER_UPDATED"
    ) {
      fetchUserData();
    }
  });
});
</script>

<template>
  <div class="flex flex-row min-h-screen">
    <!-- <div class="absolute z-10 md:relative max-w-fit mt-8">
      <Button
        class="burger-button xl:hidden text-[var(text-secondary)] bg-[var(--btn-secondary)] ml-8"
        icon="pi pi-bars"
        @click="toggleDrawer"
      />
    </div> -->

    <aside
      class="sidebar text-black xl:max-w-64 xl:min-w-64 lg:max-w-64 lg:min-w-64 flex flex-col justify-between overflow-y-auto"
    >
      <div>
        <div class="logo flex items-center m-4">
          <img src="../../assets/Logo.png" alt="Logo" class="w-10 mr-1" />
          <h1 class="text-base font-semibold text-[var(--text-primary)]">
            Stay High Coffee
          </h1>
        </div>

        <div class="flex flex-col justify-between relative top-10">
          <ul class="flex flex-col">
            <RouterLink to="/profile">
              <li>
                <i class="fa-solid fa-user ease-in duration-300"></i>
                {{ nama }}
              </li>
            </RouterLink>
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
            <RouterLink v-if="userRoleId === 1" to="/add">
              <li>
                <i class="fa-solid fa-square-plus ease-in duration-300"></i>
                Tambah Menu
              </li>
            </RouterLink>
            <RouterLink to="/history">
              <li>
                <i class="fa-solid fa-scroll ease-in duration-300"></i> Riwayat
                Pesanan
              </li>
            </RouterLink>
            <RouterLink v-if="userRoleId === 1" to="/money">
              <li>
                <i class="fa-solid fa-money-bill ease-in duration-300"></i>
                Finansial
              </li>
            </RouterLink>
            <RouterLink to="/inventory">
              <li>
                <i class="fa-solid fa-boxes-stacked ease-in duration-300"></i>
                Inventori
              </li>
            </RouterLink>
          </ul>
        </div>
      </div>
      <div class="flex justify-center mb-4">
        <Button
          label="Log Out"
          icon="fa-solid fa-sign-out-alt"
          class="btn-log bg-[var(--btn-secondary)] text-xl px-5 rounded-md shadow-custom-dark"
          @click="handleLogout"
        />
      </div>
    </aside>

    <Drawer
      v-model:visible="drawerVisible"
      :modal="true"
      :closable="true"
      :style="{ width: '100%' }"
      @hide="drawerVisible = false"
      class="bg-[var(--sidebar-bg)]"
    >
      <template #header>
        <div class="flex justify-end">
          <Button
            label="Log Out"
            icon="fa-solid fa-sign-out-alt"
            class="hidden md:flex xl:flex btn-log bg-[var(--btn-secondary)] text-xl px-5 rounded-md shadow-custom-dark"
            @click="handleLogout"
          />
        </div>
      </template>
      <div
        class="sidebar-mobile text-black flex flex-col justify-between overflow-y-auto"
      >
        <div
          class="flex flex-col gap-1 md:justify-center xl:justify-center md:items-center xl:items-center"
        >
          <!-- Center items -->
          <div class="logo flex md:justify-center md:items-center m-4">
            <img
              src="/images/logoABS.png"
              alt="ABS Logo"
              class="w-12 md:w-8 md:h-8 mr-4"
            />
            <h1
              class="text-xl flex justify-center items-center md:text-sm font-semibold text-[var(--text-primary)]"
            >
              Stay High Coffee
            </h1>
          </div>

          <div class="flex flex-col justify-between relative top-10">
            <ul class="flex flex-col">
              <RouterLink to="/profile" @click="closeDrawer">
                <li>
                  <i class="fa-solid fa-user ease-in duration-300"></i>
                  {{ nama }}
                </li>
              </RouterLink>
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

              <RouterLink to="/" @click="closeDrawer">
                <li>
                  <i class="fa-solid fa-house ease-in duration-300"></i> Halaman
                  Menu
                </li>
              </RouterLink>
              <RouterLink to="/order" @click="closeDrawer">
                <li>
                  <i class="fa-solid fa-cart-shopping ease-in duration-300"></i>
                  Pesanan
                </li>
              </RouterLink>
              <RouterLink
                v-if="userRoleId === 1"
                to="/add"
                @click="closeDrawer"
              >
                <li>
                  <i class="fa-solid fa-square-plus ease-in duration-300"></i>
                  Tambah Menu
                </li>
              </RouterLink>
              <RouterLink to="/history" @click="closeDrawer">
                <li>
                  <i class="fa-solid fa-scroll ease-in duration-300"></i>
                  Riwayat Pesanan
                </li>
              </RouterLink>
              <RouterLink
                v-if="userRoleId === 1"
                to="/money"
                @click="closeDrawer"
              >
                <li>
                  <i class="fa-solid fa-money-bill ease-in duration-300"></i>
                  Finansial
                </li>
              </RouterLink>
              <RouterLink to="/inventory" @click="closeDrawer">
                <li>
                  <i class="fa-solid fa-boxes-stacked ease-in duration-300"></i>
                  Inventory
                </li>
              </RouterLink>
              <div class="flex justify-center mt-6">
                <Button
                  label="Log Out"
                  icon="fa-solid fa-sign-out-alt"
                  class="md:hidden xl:hidden btn-log bg-[var(--btn-secondary)] text-xl px-5 rounded-md shadow-custom-dark"
                  @click="handleLogout"
                />
              </div>
            </ul>
          </div>
        </div>
      </div>
    </Drawer>

    <div class="relative z-0 flex-grow flex flex-col">
      <main class="main flex-grow">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  position: sticky;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 0;
  background-color: var(--sidebar-bg);
}

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
  font-size: 20px;
  color: var(--text-primary);
}

.sidebar-mobile li:hover {
  background: var(--hover-primary);
  transition: 0.5s;
}

.main {
  flex-grow: 1; /* Allow the main area to grow and fill the remaining space */
  padding: 1rem; /* Add some padding for aesthetics */
  overflow-y: auto; /* Allow scrolling if content overflows */
}

.sidebar li {
  padding: 1rem;
  font-size: 20px;
  color: var(--text-primary);
}

.sidebar li:hover {
  background: var(--hover-primary);
  transition: 0.5s;
}

.profile {
  padding: 1rem;
  font-size: 20px;
  color: var(--text-secondary);
}

/* Media query for larger screens */
@media (min-width: 1024px) {
  .main {
    max-width: calc(150vw - 250px);
  }
}
@media (max-width: 1200px) {
  .sidebar {
    display: none;
  }
}
</style>
