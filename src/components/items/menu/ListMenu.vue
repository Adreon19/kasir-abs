<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue/usetoast";
import { formatCurrency } from "../../../utils/formatter/currency";

const menu = ref([]);
const toast = useToast();
const isLoading = ref(true);

const fetchMenu = async () => {
  try {
    const { data, error } = await supabase.from("menu_detail").select(`
        id,
        price,
        menu_id (id, name, kategori_id (kategori)),
        variant_id (name)
      `);

    if (error) throw error;

    menu.value = data;
  } catch (err) {
    console.error("Error fetching menu list:", err.message);
  }
};

const deleteMenuByMenuId = async (menuId) => {
  try {
    // Delete from the menu table by menu_id
    const { error } = await supabase
      .from("menu_list")
      .delete()
      .eq("id", menuId); // `menu_id` corresponds to the `menu` table's `id`

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Menu and its details deleted successfully",
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
    console.error("Error deleting menu by menu_id:", error.message);
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
    <div class="flex gap-5">
      <!-- Updated DataTable -->
      <DataTable :value="menu" stripedRows class="w-full">
        <!-- Menu Name -->
        <Column
          field="menu_id.name"
          header="Nama Menu"
          :sortable="true"
          :filter="true"
        >
          <template #body="slotProps">
            {{ slotProps.data.menu_id?.name }}
          </template>
        </Column>

        <!-- Category -->
        <Column
          field="menu_id.kategori_id.kategori"
          header="Kategori"
          :sortable="true"
          :filter="true"
        >
          <template #body="slotProps">
            {{ slotProps.data.menu_id?.kategori_id?.kategori }}
          </template>
        </Column>

        <!-- Variant -->
        <Column
          field="variant_id.name"
          header="Varian"
          :sortable="true"
          :filter="true"
        >
          <template #body="slotProps">
            {{ slotProps.data.variant_id?.name || "No Variant" }}
          </template>
        </Column>

        <!-- Price -->
        <Column field="price" header="Harga" :sortable="true" :filter="true">
          <template #body="slotProps"
            >{{ formatCurrency(slotProps.data.price) }}
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Aksi" class="flex justify-center">
          <template #body="slotProps">
            <div class="flex justify-center gap-2">
              <Button
                label="Edit"
                as="router-link"
                icon="fa fa-pencil"
                class="p-button-rounded p-button-info"
                :to="{
                  name: 'EditMenu',
                  params: { id: slotProps.data.menu_id.id },
                }"
              />

              <Button
                label="Delete"
                icon="fa fa-trash"
                class="p-button-rounded p-button-danger"
                @click="deleteMenuByMenuId(slotProps.data?.menu_id?.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </section>
</template>
