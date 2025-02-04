<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue/usetoast";
const toast = useToast();
const categories = ref([]);
const newCategory = ref("");
const isLoading = ref(true);

const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("kategori_menu")
      .select("kategori");

    if (error) {
      throw error;
    }

    categories.value = data;
    console.log("Fetched categories:", categories.value);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
};
const addCategory = async () => {
  if (!newCategory.value.trim()) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Category name cannot be empty",
      life: 3000,
    });
    return;
  }

  try {
    const { error } = await supabase
      .from("kategori_menu")
      .insert({ kategori: newCategory.value });

    if (error) {
      throw error;
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Category added successfully",
      life: 3000,
    });
    newCategory.value = "";
    await fetchCategories();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error adding category",
      life: 3000,
    });
    console.error("Error adding category:", error.message);
  }
};

const initializeData = async () => {
  try {
    await fetchCategories();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeData);
</script>

<template>
  <section class="main-section max-w-full container">
    <h2>Tambah Kategori</h2>
    <div class="card flex flex-col gap-5">
      <FloatLabel>
        <InputText
          id="category-name"
          v-model="newCategory"
          class="custom-input p-4 w-full"
        />
        <label for="category-name">Nama Kategori</label>
      </FloatLabel>
      <Button
        label="Save"
        icon="fa fa-check"
        iconPos="left"
        class="custom-button p-4"
        @click="addCategory"
      />
    </div>
  </section>
</template>
