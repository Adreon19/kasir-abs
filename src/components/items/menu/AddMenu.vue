<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue/usetoast";

const isLoading = ref(false);
const menuName = ref("");
const src = ref(null);
const selectedFile = ref(null);
const toast = useToast();
const selectedCategory = ref([]);
const categories = ref([]);
const descriptionForm = ref("");

const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("kategori_menu")
      .select("id, kategori");

    if (error) {
      throw error;
    }
    categories.value = data;
    console.log("Fetched categories:", categories.value);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
};

function onFileSelect(event) {
  const file = event.files[0];
  selectedFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    src.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

const uploadImageAndSaveMenu = async () => {
  if (!menuName.value || !selectedFile.value) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Please provide menu name and image!",
      life: 3000,
    });
    return;
  }

  try {
    isLoading.value = true;

    // Upload image to Supabase bucket
    const filePath = `menu/${Date.now()}_${selectedFile.value.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("menu")
      .upload(filePath, selectedFile.value);

    if (uploadError) {
      throw uploadError;
    }

    const imageUrl = supabase.storage.from("menu").getPublicUrl(filePath)
      .data.publicUrl;

    // Save menu details to the database
    const { data: menuData, error: menuError } = await supabase
      .from("menu_list")
      .insert([
        {
          name: menuName.value,
          image: imageUrl,
          kategori_id: selectedCategory.value,
          description: descriptionForm.value,
        },
      ]);

    if (menuError) {
      throw menuError;
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Menu saved successfully!",
      life: 3000,
    });
    menuName.value = "";
    src.value = null;
    selectedFile.value = null;
    descriptionForm.value = "";
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};
onMounted(fetchCategories);
</script>

<template>
  <section class="main-section">
    <h2 class="font-bold text-2xl m capitalize">Tambah nama menu</h2>
    <div class="flex flex-row gap-20 mt-5 items-center bg[var(--section-bg)]">
      <div class="flex flex-row items-center gap-5">
        <img
          v-if="src"
          :src="src"
          alt="Preview"
          class="img-menu shadow-md max-w-64 rounded-xl z-10"
        />
        <FileUpload
          mode="basic"
          @select="onFileSelect"
          customUpload
          auto
          accept="image/*"
          :maxFileSize="150000"
          severity="secondary"
          class="bg-[var(--input-primary)] text-[var(--text-secondary)] border border-white p-button-outlined p-10 z-0"
        />
      </div>
    </div>
    <div class="flex flex-row gap-5 p-0 mt-8">
      <FloatLabel>
        <InputText
          id="menu name"
          v-model="menuName"
          class="custom-input p-4 w-96"
        />
        <label for="menu name" class="custom-label">Nama menu</label>
      </FloatLabel>
      <Select
        v-model="selectedCategory"
        :options="categories"
        optionLabel="kategori"
        optionValue="id"
        placeholder="Select Categories"
        class="custom-select w-full p-2"
      />

      <Textarea
        v-model="descriptionForm"
        rows="1"
        cols="30"
        placeholder="Masukkan Deskripsi menu "
        style="resize: none"
        class="custom-textarea"
      />
    </div>

    <div>
      <Button
        label="Save"
        icon="fa fa-check"
        iconPos="left"
        @click="uploadImageAndSaveMenu"
        :loading="isLoading"
        class="custom-button p-4 mt-4 w-full"
      />
    </div>
  </section>
</template>

<style>
.img-menu {
  border: 2px solid;
}
</style>
