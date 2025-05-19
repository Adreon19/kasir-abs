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
const checked = ref(false);
const router = useRouter();

const handleRegister = async () => {
  try {
    errorMessage.value = "";

    const { data: existingUser, error: emailCheckError } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", email.value)
      .single();

    const { data: existingName, error: nameCheckError } = await supabase
      .from("user")
      .select("user_id")
      .eq("name", displayName.value)
      .single();

    if (emailCheckError && emailCheckError.code !== "PGRST116") {
      errorMessage.value = emailCheckError.message;
      return;
    }

    if (nameCheckError && nameCheckError.code !== "PGRST116") {
      errorMessage.value = nameCheckError.message;
      return;
    }

    if (existingUser && existingName) {
      toast.add({
        severity: "error",
        summary: "Peringatan",
        detail: "Email dan nama sudah digunakan!",
        life: 5000,
      });
      return;
    }

    if (existingUser) {
      toast.add({
        severity: "error",
        summary: "Peringatan",
        detail: "Email sudah digunakan!",
        life: 5000,
      });
      return;
    }

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

    const { error: insertError } = await supabase.from("user").insert([
      {
        user_id: signUpData.user.id,
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
    alert("Akun sudah terdaftar, silahkan check inbox email mu!");
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
  <div class="flex justify-start w-fit m-3">
    <Button as="router-link" label="Back" icon="pi pi-arrow-left" to="/" />
  </div>
  <section class="flex flex-col items-center gap-8 mb-10">
    <div class="flex flex-col items-center">
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
            <Button label="Register" type="submit" class="btn-inlogin" />
          </div>
        </div>
      </form>
    </div>
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
