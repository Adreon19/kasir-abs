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
    <h2>Tambah nama menu</h2>
    <div class="flex card">
      <img
        v-if="src"
        :src="src"
        alt="Preview"
        class="shadow-md rounded-xl w-full sm:w-64"
      />
      <FileUpload
        mode="basic"
        @select="onFileSelect"
        customUpload
        auto
        severity="secondary"
        class="p-button-outlined"
      />
    </div>
    <div class="card flex gap-5">
      <FloatLabel>
        <InputText id="menu name" v-model="menuName" class="p-3" />
        <label for="menu name">Nama menu</label>
      </FloatLabel>
      <Select
        v-model="selectedCategory"
        :options="categories"
        optionLabel="kategori"
        optionValue="id"
        placeholder="Select Categories"
        class="w-full md:w-56"
      />
      <Button
        label="Save"
        icon="fa fa-check"
        iconPos="left"
        @click="uploadImageAndSaveMenu"
        :loading="isLoading"
      />
    </div>
  </section>
</template>
