<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../supabase";

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
  <div class="p-6">
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else class="flex flex-col gap-6 max-w-full container">
      <section class="main-section flex flex-col gap-6">
        <h2>Halo, {{ nama }}!</h2>
        <div class="flex flex-row gap-4">
          <div class="flex flex-col gap-3">
            <label for="telfon"> Email </label>
            <InputText
              v-model="email"
              disabled
              class="custom-input h-full text-lg max-w-fit"
              placeholder="Email"
            />
          </div>
          <div class="flex flex-col gap-3">
            <label for="telfon"> Nama </label>
            <InputText
              v-model="nama"
              disabled
              class="custom-input h-full text-lg max-w-fit"
              placeholder="Username"
            />
          </div>
          <div class="flex justify-center items-center">
            <Button
              label="Edit Password"
              icon="fa fa-pencil"
              iconPos="left"
              @click="resetPassword"
              class="custom-button w-fit h-fit mt-6"
            />
          </div>
        </div>
        <Button
          as="router-link"
          to="/register"
          label="Bikin Akun baru"
          class="custom-button last:max-w-fit"
        />
      </section>
    </div>
  </div>
</template>
