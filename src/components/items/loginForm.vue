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

    if (data.user) {
      router.push("/");
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
        class="input-container flex flex-col gap-6 p-8 rounded-t-lg shadow-md"
      >
        <FloatLabel>
          <InputText
            type="text"
            v-model="email"
            class="p-3 text-lg rounded-md"
          />
          <label>email</label>
        </FloatLabel>
        <FloatLabel>
          <Password
            v-model="password"
            toggleMask
            class="p-4 text-lg rounded-md"
          />
          <label>Password</label>
        </FloatLabel>
      </div>
      <div class="btn-login flex justify-center">
        <Button
          severity="secondary"
          label="Login"
          type="submit"
          class="p-button p-3 text-lg bg-black hover:bg-white hover:text-black"
        />
      </div>
    </form>
  </section>
</template>

<style>
.input-container {
  background-color: rgba(202, 141, 27, 0.9);
  border-radius: 10px 10px 0 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-login {
  background-color: blanchedalmond;
  border-radius: 0 0 10px 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
