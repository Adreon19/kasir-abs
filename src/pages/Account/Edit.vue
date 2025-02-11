<template>
  <div class="p-6">
    <h2>Edit Profile</h2>
    <div class="flex flex-col gap-4">
      <section class="main-section">
        <h3>Change Password</h3>
        <div class="flex flex-col gap-3">
          <label for="newPassword">New Password</label>
          <InputText
            v-model="newPassword"
            id="newPassword"
            type="password"
            class="custom-input h-full text-lg max-w-fit"
            placeholder="Masukkan Password Baru"
            autocomplete="off"
          />
        </div>
        <div class="flex justify-end">
          <Button
            label="Ganti Password"
            icon="fa fa-lock"
            class="p-button-rounded p-button-warning"
            @click="updatePassword"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../supabase";

const newPassword = ref(""); // New password input

const fetchUserData = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;

    if (user) {
      // You can fetch additional user data if needed
      console.log("User  email:", user.email);
    } else {
      console.log("No user data found.");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const updatePassword = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;

    if (!user) {
      alert("Kamu harus login terlebih dahulu untuk mengubah password.");
      return;
    }

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    });

    if (error) throw error;

    alert("Password berhasil diubah!");
    newPassword.value = ""; // Clear the input field after successful update
  } catch (error) {
    console.error("Error updating password:", error);
    alert("Gagal mengubah password. Silakan coba lagi.");
  }
};

onMounted(fetchUserData);
</script>
