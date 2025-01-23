<script setup>
import { ref, onMounted } from "vue";
import { useToast, Toast } from "primevue";
import { useRouter, useRoute } from "vue-router"; // Import useRoute for accessing route params
import { supabase } from "../../../../supabase";

const toast = useToast();
const route = useRoute();
const router = useRouter(); // Access the route parameters
const selectedCategory = ref({ id: null, kategori: "" }); // Reactive object for the category
const isLoading = ref(false); // Loading state

// Fetch the category details based on the ID in the route
const fetchCategoryById = async (id) => {
  try {
    isLoading.value = true;
    const { data, error } = await supabase
      .from("kategori_menu")
      .select("id, kategori")
      .eq("id", id)
      .single(); // Fetch a single record by ID

    if (error) {
      throw error;
    }

    selectedCategory.value = data; // Populate the form with fetched data
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to fetch category details",
      life: 3000,
    });
    console.error("Error fetching category:", error.message);
  } finally {
    isLoading.value = false;
  }
};

// Update the selected category
const updateCategory = async () => {
  try {
    const { id, kategori } = selectedCategory.value;

    if (!kategori.trim()) {
      toast.add({
        severity: "warn",
        summary: "Warning",
        detail: "Category name cannot be empty",
        life: 3000,
      });
      return;
    }

    const { error } = await supabase
      .from("kategori_menu")
      .update({ kategori })
      .eq("id", id);

    if (error) {
      throw error;
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Category updated successfully",
      life: 3000,
    });
    router.push("/add");
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to update category",
      life: 3000,
    });
    console.error("Error updating category:", error.message);
  }
};

// Fetch the category when the component is mounted
onMounted(() => {
  const categoryId = route.params.id; // Get the ID from the route parameters
  fetchCategoryById(categoryId); // Fetch category details
});
</script>

<template>
  <div class="button-container p-6">
    <Button
      as="router-link"
      label="Kembali"
      icon="fa-solid fa-arrow-left"
      class="maw-w-fit"
      to="/add"
    />
  </div>
  <div class="p-6">
    <h2>Edit Kategori</h2>
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="main-section">
        <div class="field">
          <label for="id">ID:</label>
          <InputText id="id" v-model="selectedCategory.id" disabled />
        </div>
        <div class="field mt-3">
          <label for="kategori">Kategori:</label>
          <InputText
            id="kategori"
            v-model="selectedCategory.kategori"
            placeholder="Enter new category name"
          />
        </div>
        <div class="mt-4 flex justify-end gap-3">
          <Button
            label="Save"
            icon="fa-solid fa-save"
            class="p-button-primary"
            @click="updateCategory"
          />
        </div>
      </section>
    </div>
  </div>

  <Toast />
</template>
