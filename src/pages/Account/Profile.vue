<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../supabase";
import Burger from "../../components/header.vue";

const isLoading = ref(true);
const nama = ref("");
const email = ref("");

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
        .select("name, email")
        .eq("email", user.email)
        .single();

      if (userError) throw userError;

      if (data) {
        nama.value = data.name;
        email.value = data.email;
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  } finally {
    isLoading.value = false;
  }
};

const resetPassword = async () => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value);
    if (error) throw error;
    alert("Permintaan ganti password dikirim! Tolong check inbox Email kamu!.");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    alert("Gagal mengirim permintaan ganti password. Tolong coba lagi.");
  }
};

onMounted(fetchUserData);
</script>
<template>
  <Burger />
  <div class="mt-20 md:mt-0 p-4 md:p-8">
    <div
      v-if="isLoading"
      class="flex justify-center items-center min-h-[200px]"
    >
      <ProgressSpinner />
    </div>

    <div v-else class="flex flex-col gap-6 max-w-full md:max-w-4xl mx-auto">
      <section class="main-section flex flex-col gap-6">
        <h2
          class="text-xl md:text-2xl font-semibold text-[var(--text-primary)]"
        >
          Halo, {{ nama }}!
        </h2>

        <div class="flex flex-col md:flex-row md:gap-6 gap-4">
          <!-- Email -->
          <div class="flex flex-col gap-2 w-full">
            <label for="email" class="text-sm font-medium text-gray-700"
              >Email</label
            >
            <InputText
              id="email"
              v-model="email"
              disabled
              class="custom-input text-base w-full"
              placeholder="Email"
            />
          </div>

          <!-- Nama -->
          <div class="flex flex-col gap-2 w-full">
            <label for="nama" class="text-sm font-medium text-gray-700"
              >Nama</label
            >
            <InputText
              id="nama"
              v-model="nama"
              disabled
              class="custom-input text-base w-full"
              placeholder="Nama"
            />
          </div>
        </div>

        <!-- Tombol Edit Password -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            label="Edit Password"
            icon="fa fa-pencil"
            iconPos="left"
            @click="resetPassword"
            class="custom-button w-full sm:w-fit"
          />
          <Button
            as="router-link"
            to="/register"
            label="Bikin Akun Baru"
            class="custom-button w-full sm:w-fit"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.custom-input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.custom-button {
  background-color: var(--btn-secondary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
}

.custom-button:hover {
  background-color: var(--btn-secondary-hover);
}
</style>
