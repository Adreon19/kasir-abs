<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../../supabase";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
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
  document.documentElement.classList.toggle("my-app-dark");
}
</script>

<template>
  <section class="flex flex-col items-center gap-8 mt-10 mb-10">
    <img src="/images/logoABS.png" alt="ABS Logo" class="w-36" />
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
          <label>email</label>
        </FloatLabel>
        <FloatLabel>
          <Password
            v-model="password"
            toggleMask
            class="password text-lg rounded-md min-w-64 border-none focus:outline-none"
          />
          <label>Password</label>
        </FloatLabel>
        <div class="flex gap-3 items-center mt-3">
          <Button
            as="router-link"
            label="Forgot Password?"
            to="/"
            class="p.button bg-transparent border-none text-white"
          />
        </div>
      </div>
      <div class="btn-login flex justify-center">
        <Button
          severity="secondary"
          label="Login"
          type="submit"
          class="btn-inlogin"
        />
      </div>

      <Button
        class="btn-switch"
        label="Toggle Dark Mode"
        @click="toggleDarkMode()"
      />
    </form>
  </section>

  <section class="waves">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
      <path
        fill="#634F2B"
        fill-opacity="1"
        d="M0,96L24,117.3C48,139,96,181,144,197.3C192,213,240,203,288,192C336,181,384,171,432,176C480,181,528,203,576,202.7C624,203,672,181,720,192C768,203,816,245,864,256C912,267,960,245,1008,202.7C1056,160,1104,96,1152,106.7C1200,117,1248,203,1296,224C1344,245,1392,203,1416,181.3L1440,160L1440,320L1416,320C1392,320,1344,320,1296,320C1248,320,1200,320,1152,320C1104,320,1056,320,1008,320C960,320,912,320,864,320C816,320,768,320,720,320C672,320,624,320,576,320C528,320,480,320,432,320C384,320,336,320,288,320C240,320,192,320,144,320C96,320,48,320,24,320L0,320Z"
      ></path>
    </svg>
  </section>
</template>

<style>
.input-container {
  background-color: #634f2b;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-login {
  background-color: #f5f5dc;
  border-radius: 0 0 10px 10px;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.password {
  border: none;
}
</style>
