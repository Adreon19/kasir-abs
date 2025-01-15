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
        cold_price,
        hot_price,
        menu_list (name),
        kategori_menu (kategori)
      `);

    if (error) {
      throw error;
    }

    menu.value = data.map((item) => ({
      id: item.id,
      name: item.menu_list.name,
      kategori: item.kategori_menu.kategori,
      price: item.price,
      cold_price: item.cold_price,
      hot_price: item.hot_price,
    }));

    console.log("Fetched menu with details:", menu.value);
  } catch (error) {
    console.error("Error fetching menu:", error.message);
  }
};

const deleteMenu = async (menuId) => {
  try {
    const { error } = await supabase
      .from("menu_detail")
      .delete()
      .eq("id", menuId);

    if (error) {
      throw error;
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Menu deleted successfully",
      life: 3000,
    });
    await fetchMenu();
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
        <Column field="cold_price" header="Harga Dingin"> </Column>
        <Column field="hot_price" header="Harga Panas"> </Column>
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
                @click="deleteMenu(slotProps.data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </section>
</template>
