<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../../supabase";
import { Toast, useToast } from "primevue";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const darkMode = ref(false);
const router = useRouter();
const toast = useToast(); // Initialize toast

const handleLogin = async () => {
  try {
    errorMessage.value = "";

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      // Show toast notification for invalid email/password
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Email atau password salah",
        life: 3000,
      });
      return;
    }

    const session = await supabase.auth.getSession();

    if (session?.data?.session) {
      router.push("/");
    } else {
      errorMessage.value = "Failed to establish a session.";
    }
  } catch (err) {
    errorMessage.value = "An unexpected error occurred. Please try again.";
    console.error(err);
  }
};

function toggleDarkMode() {
  darkMode.value = !darkMode.value;
  document.documentElement.classList.toggle("my-app-dark", darkMode.value);
  localStorage.setItem("darkMode", darkMode.value);
}

onMounted(() => {
  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode === "true") {
    darkMode.value = true;
    document.documentElement.classList.add("my-app-dark");
  }
});
</script>

<template>
  <section class="flex flex-col items-center gap-8 mb-10 mt-10">
    <img src="/images/logoABS.png" alt="ABS Logo" class="w-36 mb-10" />
    <form class="flex flex-col" @submit.prevent="handleLogin">
      <div
        class="input-container flex flex-col gap-6 p-11 rounded-t-lg shadow-md"
      >
        <FloatLabel>
          <InputText
            type="text"
            v-model="email"
            class="text-lg rounded-md bg-white text-black focus:outline-none border-none shadow-none min-w-64"
          />
          <label style="color: black">Email</label>
        </FloatLabel>
        <FloatLabel>
          <Password
            v-model="password"
            toggleMask
            class="password text-lg rounded-md min-w-64 border-none focus:outline-none"
          />
          <label style="color: black">Password</label>
        </FloatLabel>
        <div class="flex gap-3 items-center mt-3 justify-between">
          <Button
            :icon="darkMode ? 'pi pi-moon' : 'pi pi-sun'"
            :class="darkMode ? 'text-yellow-500' : 'text-black'"
            @click="toggleDarkMode()"
            class="bg-transparent hover:border-none active:border-none p-0"
          />
        </div>
        <div class="btn-login flex justify-center">
          <Button label="Login" type="submit" class="btn-inlogin" />
        </div>
      </div>
    </form>
  </section>
  <Toast />
</template>

<style>
.input-container {
  background-color: #634f2b;
  opacity: 50%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 1);
}

.btn-login {
  border: none;
  padding: 1rem;
}

.btn-login Button {
  background-color: #b99043;
  text-transform: uppercase;
}

.btn-inlogin:hover {
  background-color: #9f782f;
  border: none;
}

.password {
  border: none;
}
</style>
