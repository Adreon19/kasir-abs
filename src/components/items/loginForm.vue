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
</script>
<template>
  <section class="flex flex-col items-center gap-8 mt-10">
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
          class="p-button p-3 text-lg bg-white text-black hover:bg-black hover:text-white transition hover:duration-700 min-w-48"
        />
      </div>
    </form>
  </section>
</template>

<style>
.input-container {
  background-color: #c8a241;
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
