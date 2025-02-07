<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "../supabase";
import { useToast } from "primevue";

const toast = useToast();
const isLoading = ref(false);
const inventories = ref([]);
const itemName = ref("");
const itemQuantity = ref();
const dialogVisible = ref(false);
const selectedItem = ref({ id: null, Name: "", quantity: "" });

const fetchInventory = async () => {
  try {
    isLoading.value = true;
    const { data, error } = await supabase
      .from("inventory")
      .select(`id, Name, quantity, timestamp`);

    if (error) throw error;
    inventories.value = data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Inventory barang gagal ditampilkan",
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};

// Computed property to get items with zero quantity
const emptyItems = computed(() => {
  return inventories.value.filter((item) => item.quantity === 0);
});

// Computed property to generate the message
const emptyItemsMessage = computed(() => {
  if (emptyItems.value.length > 0) {
    const itemNames = emptyItems.value.map((item) => item.Name).join(", ");
    return `Barang yang kosong: ${itemNames}`;
  }
  return "Stock semua barang masih ada!";
});

const fetchItemById = async (id) => {
  dialogVisible.value = true;
  try {
    isLoading.value = true;
    const { data, error } = await supabase
      .from("inventory")
      .select("id, Name, quantity")
      .eq("id", id)
      .single();

    if (error) throw error;

    selectedItem.value = data;
  } catch (error) {
    console.error("Error fetching item:", error.message);
  } finally {
    isLoading.value = false;
  }
};

const insertInventory = async () => {
  try {
    if (!itemName.value || itemQuantity.value === undefined) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Nama barang dan kuantitas tidak boleh kosong",
        life: 5000,
      });
      return;
    }

    // Check if the item already exists
    const { data: existingItem, error: checkError } = await supabase
      .from("inventory")
      .select("id")
      .eq("Name", itemName.value)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingItem) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Barang ini sudah ada, silahkan ganti kuantitasnya saja!",
        life: 5000,
      });
      return;
    }

    // Proceed to insert the new item
    const { error } = await supabase.from("inventory").insert([
      {
        Name: itemName.value,
        quantity: itemQuantity.value,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Barang berhasil ditambahkan!",
      life: 5000,
    });

    await fetchInventory();
    itemName.value = "";
    itemQuantity.value = null;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Gagal menambahkan barang",
      life: 5000,
    });
  }
};

const updateItem = async () => {
  try {
    const { id, Name, quantity } = selectedItem.value;

    if (!id) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ID barang tidak valid",
        life: 5000,
      });
      return;
    }

    const trimmedNama = Name.trim(); // Trim the name

    // Check if the name is empty
    if (!trimmedNama) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Nama tidak boleh kosong",
        life: 5000,
      });
      return;
    }

    // Check if quantity is a valid number
    if (
      quantity === null ||
      quantity === undefined ||
      isNaN(quantity) ||
      quantity < 0
    ) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Jumlah tidak boleh kosong dan harus lebih besar dari 0",
        life: 5000,
      });
      return;
    }

    const { error } = await supabase
      .from("inventory")
      .update({ quantity, Name: trimmedNama }) // No need to trim quantity
      .eq("id", id);

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: "Barang berhasil diperbarui!",
      life: 5000,
    });

    await fetchInventory();
    dialogVisible.value = false;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error updating item:", error);
  }
};

const deleteItem = async (itemId) => {
  try {
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("id", itemId);
    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: "Barang berhasil dihapus!",
      life: 5000,
    });

    await fetchInventory();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error deleting item:", error);
  }
};

const formatDate = (timestamp) => {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(timestamp));
};

const initializeData = async () => {
  try {
    await fetchInventory();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeData);
</script>

<template>
  <div class="p-6">
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else class="flex flex-col gap-6 max-w-full container">
      <section class="main-section">
        <h2>{{ emptyItemsMessage }}</h2>
        <!-- Display the message here -->
      </section>
      <section class="main-section flex flex-col gap-4">
        <h2>Inventory</h2>
        <div class="flex justify-between item-center gap-3">
          <div class="flex justify-between item-center gap-3">
            <div class="flex flex-col gap-3">
              <label for="itemName"> Nama Barang </label>
              <InputText
                v-model="itemName"
                id="itemName"
                class="custom-input h-full text-lg max-w-fit"
                placeholder="Masukkan Nama Barang"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label for="itemQuantity"> Jumlah </label>
              <InputNumber
                v-model="itemQuantity"
                id="itemQuantity"
                :min="0"
                :max="999"
                class="h-full text-lg max-w-fit"
                placeholder="Masukkan Jumlah Barang"
              />
            </div>
            <div class="flex justify-center items-center">
              <Button
                label="Simpan"
                icon="fa fa-check"
                iconPos="left"
                @click="insertInventory"
                :loading="isLoading"
                class="custom-button w-fit h-fit mt-6"
              />
            </div>
          </div>
        </div>
        <div class="container flex flex-col gap-4">
          <DataTable
            :value="inventories"
            stripedRows
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]"
          >
            <Column field="Name" header="Nama Barang" />
            <Column field="quantity" header="Jumlah" />
            <Column field="timestamp" header="Tanggal">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.timestamp) }}
              </template>
            </Column>
            <template #empty> Belum ada barang! </template>
            <Column header="Aksi">
              <template #body="slotProps">
                <div class="flex justify-center gap-2">
                  <Button
                    label="Edit"
                    icon="fa fa-pencil"
                    class="p-button-rounded p-button-info"
                    @click="fetchItemById(slotProps.data.id)"
                  />
                  <Button
                    label="Delete"
                    icon="fa fa-trash"
                    class="p-button-rounded p-button-danger"
                    @click="deleteItem(slotProps.data.id)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </section>
    </div>
  </div>

  <Dialog
    v-model:visible="dialogVisible"
    header="Edit Barang"
    :modal="true"
    :closable="true"
    class="w-400px"
  >
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else>
      <div class="flex flex-col">
        <label for="editNama">Nama</label>
        <InputText
          v-model="selectedItem.Name"
          id="editNama"
          placeholder="Nama Barang"
        />
      </div>
      <div class="mt-3 flex flex-col">
        <label for="editQuantity">Quantity</label>
        <InputNumber
          v-model="selectedItem.quantity"
          id="editQuantity"
          :min="0"
          :max="999"
          placeholder="Jumlah Barang"
        />
      </div>
      <div class="mt-4 flex justify-end">
        <Button
          label="Update"
          icon="fa fa-check"
          class="p-button-rounded p-button-success"
          @click="updateItem(selectedItem?.id)"
        />
      </div>
    </div>
  </Dialog>
  <Toast />
</template>
