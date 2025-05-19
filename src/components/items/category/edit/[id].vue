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
  <div class="container p-6">
    <div class="button-container mb-4">
      <Button
        as="router-link"
        label="Kembali"
        icon="fa-solid fa-arrow-left"
        class="custom-button maw-w-fit"
        to="/add"
      />
    </div>
    <h2 class="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
      Edit Kategori
    </h2>
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="main-section bg-white shadow-md rounded-lg p-6">
        <div class="field mb-4">
          <label for="id" class="block text-sm font-medium text-gray-700"
            >ID:</label
          >
          <InputText
            id="id"
            v-model="selectedCategory.id"
            disabled
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div class="field mb-4">
          <label for="kategori" class="block text-sm font-medium text-gray-700"
            >Kategori:</label
          >
          <InputText
            id="kategori"
            v-model="selectedCategory.kategori"
            placeholder="Enter new category name"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div class="flex justify-end">
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
