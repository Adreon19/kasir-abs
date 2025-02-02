<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue";
const toast = useToast();
const categories = ref([]);
const isLoading = ref(true);

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

const deleteCategories = async (kategori) => {
  try {
    const { error } = await supabase
      .from("kategori_menu")
      .delete()
      .eq("kategori", kategori);

    if (error) {
      throw error;
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "category deleted successfully",
      life: 3000,
    });
    await fetchCategories();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error deleting category",
      life: 3000,
    });
    console.error("Error deleting category:", error.message);
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
  <section class="main-section">
    <h2>List Kategori</h2>
    <div class="card flex gap-5">
      <DataTable :value="categories" tableStyle="min-width: 50rem">
        <Column field="kategori" header="Nama Kategori"> </Column>
        <Column header="Aksi" class="flex justify-center">
          <template #body="slotProps">
            <div class="flex justify-center gap-2">
              <Button
                label="Edit"
                icon="fa fa-pencil"
                class="p-button-rounded p-button-info"
                as="router-link"
                :to="{
                  name: 'EditCategory',
                  params: { id: slotProps.data.id },
                }"
              />
              <Button
                label="Delete"
                icon="fa fa-trash"
                class="p-button-rounded p-button-danger"
                @click="deleteCategories(slotProps.data.kategori)"
              />
            </div>
          </template>
        </Column>
        <template #empty> Tidak ada kategori! </template>
      </DataTable>
    </div>
  </section>
</template>
