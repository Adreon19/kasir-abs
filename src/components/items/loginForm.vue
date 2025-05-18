<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../../supabase";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const darkMode = ref(false);
const router = useRouter();

const handleLogin = async () => {
  try {
    errorMessage.value = "";

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      errorMessage.value = error.message;
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
        <div class="flex gap-3 items-center mt-3 justify-between">
          <Button
            as="router-link"
            label="Forgot Password?"
            to="/"
            class="p.button bg-transparent border-none text-black"
          />

          <Button
            :icon="darkMode ? 'pi pi-moon' : 'pi pi-sun'"
            :class="darkMode ? 'text-yellow-500' : 'text-black'"
            @click="toggleDarkMode()"
            class="bg-transparent hover:border-none active:border-none p-0"
          />
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
