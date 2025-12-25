<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../../supabase";
import { Toast, useToast } from "primevue";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const darkMode = ref(false);
const checked = ref(false);
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
  <section class="flex flex-col items-center gap-8 mb-10 mt-10">
    <!-- <img src="src\assets\Logo.png" alt="Logo" class="w-36 mb-10" /> -->
    <form class="flex flex-col" @submit.prevent="handleLogin">
      <div
        class="input-container flex flex-col gap-6 p-11 rounded-t-lg shadow-md bg-[var(--bg-form-login)]/20 backdrop-brightness-75"
      >
        <FloatLabel>
          <InputText
            type="text"
            v-model="email"
            class="Email text-lg rounded-md text-black focus:outline-none border-none shadow-none min-w-64 bg-[var(--input-text-login)] backdrop-brightness-75"
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
        <div class="btn-login flex justify-center">
          <Button
            label="Login"
            type="submit"
            class="btn-inlogin bg-[var(--btn-login)]"
          />
        </div>
      </div>
    </form>
  </section>
  <Toast />
</template>

<style scoped>
.btn-login {
  border: none;
  padding: 1rem;
}

.password {
  border: none;
}
</style>
