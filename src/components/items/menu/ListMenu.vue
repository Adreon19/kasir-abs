<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue/usetoast";

const menu = ref([]);
const toast = useToast();
const isLoading = ref(true);

const fetchMenu = async () => {
  try {
    const { data, error } = await supabase.from("menu_detail").select(`
        id,
        price,
        hot_price,
        cold_price,
        menu_id (name, kategori_id (kategori))
        ),
      `);

    if (error) throw error;

    // Update the 'menu' variable with the fetched data
    menu.value = data.map((item) => ({
      id: item.id,
      price: item.price || item.cold_price,
      hotWater: item.hot_price || `ini ${item.menu_id?.kategori_id?.kategori}`,
      coldWater:
        item.cold_price || `ini ${item.menu_id?.kategori_id?.kategori}`,
      name: item.menu_id?.name || "gak ada",
      kategori: item.menu_id?.kategori_id?.kategori || "gak ada",
    }));
  } catch (err) {
    console.error("Error fetching menu list:", err.message);
  }
};

const deleteMenu = async (menuId) => {
  try {
    const { error } = await supabase
      .from("menu_detail")
      .delete()
      .eq("id", menuId);

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Menu deleted successfully",
      life: 3000,
    });

    await fetchMenu(); // Refresh the menu list after deletion
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error deleting menu",
      life: 3000,
    });
    console.error("Error deleting menu:", error.message);
  }
};

const initializeData = async () => {
  try {
    await fetchMenu();
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
    <h2>List Menu</h2>
    <div class="card flex gap-5">
      <DataTable :value="menu" tableStyle="min-width: 50rem">
        <Column field="name" header="Nama Menu"> </Column>
        <Column field="kategori" header="Kategori"> </Column>
        <Column field="price" header="Harga"> </Column>
        <Column field="coldWater" header="Harga Dingin"> </Column>
        <Column field="hotWater" header="Harga Panas"> </Column>
        <Column header="Aksi" class="flex justify-center">
          <template #body="slotProps">
            <div class="flex justify-center gap-2">
              <Button
                label="Edit"
                icon="fa fa-pencil"
                class="p-button-rounded p-button-info"
                @click="editMenu(slotProps.data)"
              />
              <Button
                label="Delete"
                icon="fa fa-trash"
                class="p-button-rounded p-button-danger"
                @click="deleteMenu(slotProps.data?.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </section>
</template>
