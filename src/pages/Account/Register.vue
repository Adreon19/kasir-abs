<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../../supabase";
import { Toast, useToast } from "primevue";

const toast = useToast();
const email = ref("");
const password = ref("");
const displayName = ref("");
const errorMessage = ref("");
const darkMode = ref(false);
const router = useRouter();

const handleRegister = async () => {
  try {
    errorMessage.value = "";

    // Check if the email already exists
    const { data: existingUser, error: emailCheckError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", email.value)
      .single();

    // Check if the display name already exists
    const { data: existingName, error: nameCheckError } = await supabase
      .from("user")
      .select("user_id")
      .eq("name", displayName.value)
      .single();

    // Handle errors for both checks
    if (emailCheckError && emailCheckError.code !== "PGRST116") {
      errorMessage.value = emailCheckError.message;
      return;
    }

    if (nameCheckError && nameCheckError.code !== "PGRST116") {
      errorMessage.value = nameCheckError.message;
      return;
    }

    // Check if both email and name already exist
    if (existingUser && existingName) {
      toast.add({
        severity: "error",
        summary: "Peringatan",
        detail: "Email dan nama sudah digunakan!",
        life: 5000,
      });
      return;
    }

    // Check if only the email exists
    if (existingUser) {
      toast.add({
        severity: "error",
        summary: "Peringatan",
        detail: "Email sudah digunakan!",
        life: 5000,
      });
      return;
    }

    // Check if only the display name exists
    if (existingName) {
      toast.add({
        severity: "error",
        summary: "Peringatan",
        detail: "Nama sudah digunakan!",
        life: 5000,
      });
      return;
    }

    // Proceed with user registration
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: email.value,
        password: password.value,
        options: {
          data: {
            display_name: displayName.value,
          },
        },
      }
    );

    if (signUpError) {
      errorMessage.value = signUpError.message;
      return;
    }

    const userId = signUpData.user.id;

    // Insert the user data into the custom 'user' table
    const { error: insertError } = await supabase.from("user").insert([
      {
        user_id: userId,
        name: displayName.value,
        email: email.value,
        role_id: 1,
      },
    ]);

    if (insertError) {
      errorMessage.value = insertError.message;
      toast.add({
        severity: "error",
        summary: "Peringatan",
        detail: "User  gagal ditambahkan!",
        life: 5000,
      });
      return;
    }

    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "User  berhasil ditambahkan",
      life: 5000,
    });
    router.push("/member");
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
  <div class="p-6">
    <Button
      as="router-link"
      label="Back"
      icon="pi pi-arrow-left"
      to="/member"
    />
  </div>
  <section class="flex flex-col items-center gap-8 mb-10 mt-10">
    <img src="/images/logoABS.png" alt="ABS Logo" class="w-36 mb-10" />
    <form class="flex flex-col" @submit.prevent="handleRegister">
      <div
        class="input-container flex flex-col gap-6 p-11 rounded-t-lg shadow-md"
      >
        <FloatLabel>
          <InputText
            type="text"
            v-model="displayName"
            class="text-lg rounded-md bg-white text-black focus:outline-none border-none shadow-none w-full"
          />
          <label style="color: black">Display Name</label>
        </FloatLabel>
        <FloatLabel>
          <InputText
            type="text"
            v-model="email"
            class="text-lg rounded-md bg-white text-black focus:outline-none border-none shadow-none w-full"
          />
          <label style="color: black">Email</label>
        </FloatLabel>
        <FloatLabel>
          <Password
            v-model="password"
            toggleMask
            class="password text-lg rounded-md w-full border-none focus:outline-none"
          />
          <label style="color: black">Password</label>
        </FloatLabel>
        <div
          v-if="errorMessage"
          class="text-red-600 text-center mt-2 bg-slate-900"
        >
          {{ errorMessage }}
        </div>
        <h3>Selalu ingat Email anda untuk login!</h3>
        <div class="flex gap-3 items-center mt-3 justify-between">
          <Button
            :icon="darkMode ? 'pi pi-moon' : 'pi pi-sun'"
            :class="darkMode ? 'text-yellow-500' : 'text-black'"
            @click="toggleDarkMode()"
            class="bg-transparent hover:border-none active:border-none p-0"
          />
        </div>
        <div class="btn-login flex justify-center">
          <Button label="Register" type="submit" class="btn-inlogin" />
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
