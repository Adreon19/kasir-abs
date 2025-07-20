<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "../supabase";
import { useToast } from "primevue";
import Burger from "../components/header.vue";

const toast = useToast();
const isLoading = ref(false);
const inventories = ref([]);
const itemName = ref("");
const itemQuantity = ref();
const units = ref([]);
const selectedUnit = ref(null);
const dialogVisible = ref(false);
const selectedItem = ref({ id: null, Name: "", quantity: "", unit_id: null });
const dt = ref();

const exportCSV = () => {
  dt.value.exportCSV();
};

const fetchUnit = async () => {
  try {
    const { data, error } = await supabase.from("Unit").select(`id, Name`);

    if (error) throw error;
    units.value = data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Satuan barang gagal ditampilkan",
      life: 5000,
    });
  }
};

const fetchInventory = async () => {
  try {
    isLoading.value = true;
    const { data, error } = await supabase.from("inventory").select(
      `
        id,
        Name,
        quantity,
        timestamp,
        unit_id (
        id,
        Name
        )
        `
    );

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

const emptyItems = computed(() => {
  return inventories.value.filter(item => item.quantity === 0);
});

const emptyItemsMessage = computed(() => {
  if (emptyItems.value.length > 0) {
    const itemNames = emptyItems.value.map(item => item.Name).join(", ");
    return `Barang yang kosong: ${itemNames}`;
  }
  return "Stock semua barang masih ada!";
});

const fetchItemById = async id => {
  dialogVisible.value = true;
  try {
    isLoading.value = true;
    const { data, error } = await supabase
      .from("inventory")
      .select("id, Name, quantity, unit_id")
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

    const { error } = await supabase.from("inventory").insert([
      {
        Name: itemName.value,
        quantity: itemQuantity.value,
        timestamp: new Date().toISOString(),
        unit_id: selectedUnit.value,
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
    selectedUnit.value = null;
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
    const { id, Name, quantity, unit_id } = selectedItem.value;

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

    const { error } = await supabase
      .from("inventory")
      .update({
        quantity,
        Name: trimmedNama,
        unit_id,
        timestamp: new Date().toISOString(),
      })
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

const deleteItem = async itemId => {
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

const formatDate = timestamp => {
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
    await fetchUnit();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeData);
</script>

<template>
  <Burger>
    <slot>
      <h1 class="text text-xl font-bold mb-4 ml-14 md:ml-0 xl:ml-0">
        Inventory
      </h1>
    </slot>
  </Burger>

  <div v-if="isLoading" class="flex justify-center">
    <ProgressSpinner />
  </div>
  <div v-else class="flex flex-col gap-6 max-w-full md:mt-0 xl:mt-0 container">
    <section class="main-section w-full">
      <h2 class="text-xl">{{ emptyItemsMessage }}</h2>
      <!-- Display the message here -->
    </section>
    <section class="main-section flex flex-col gap-4">
      <div class="flex flex-row items-center justify-between">
        <h2>Inventory</h2>
        <!-- <Button
            label="Simpan"
            icon="fa fa-check"
            iconPos="left"
            @click="insertInventory"
            :loading="isLoading"
            class="custom-button w-fit h-fit mt-6"
          /> -->
      </div>
      <div class="flex justify-between item-center gap-3 flex-col">
        <div
          class="flex flex-col md:flex-row xl:flex-row justify-between item-center gap-3"
        >
          <div class="flex flex-col gap-3">
            <label for="itemName"> Nama Barang </label>
            <InputText
              v-model="itemName"
              id="itemName"
              class="custom-input h-full text-lg max-w-fit"
              placeholder="Masukkan Nama Barang"
            />
          </div>

          <div class="flex flex-col gap-2 w-full">
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
          <div class="flex flex-col gap-2">
            <label for="itemUnit"> Jumlah </label>
            <Select
              v-model="selectedUnit"
              :options="units"
              optionLabel="Name"
              optionValue="id"
              placeholder="Pilih Satuan"
              class="custom-select w-full md:w-auto p-4"
            />
          </div>
        </div>
        <div class="">
          <Button
            label="Simpan"
            icon="fa fa-check"
            iconPos="left"
            @click="insertInventory"
            :loading="isLoading"
            class="custom-button w-full h-fit mt-6"
          />
        </div>
      </div>
      <div
        class="w-full overflow-x-auto md:overflow-x-visible xl:overflow-x-visible"
      >
        <div
          class="container flex flex-col gap-4 max-w-[350px] md:max-w-full xl:max-w-full"
        >
          <DataTable
            :value="inventories"
            stripedRows
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            ref="dt"
            v-if="!isLoading"
            class="w-full"
          >
            <template #header>
              <div class="text-end pb-4 text-white">
                <Button
                  icon="pi pi-external-link"
                  label="Export"
                  @click="exportCSV"
                />
              </div>
            </template>
            <Column field="Name" header="Nama Barang" />
            <Column field="quantity" header="Jumlah" />
            <Column field="unit_id.Name" header="satuan" />
            <Column field="timestamp" header="Tanggal">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.timestamp) }}
              </template>
            </Column>
            <template #empty> Belum ada barang! </template>
            <Column header="Aksi">
              <template #body="slotProps">
                <div class="flex justify-start gap-2">
                  <Button
                    label="Edit"
                    icon="fa fa-pencil"
                    class="p-button rounded-xl bg-[var(--input-addMenu)] text-white"
                    @click="fetchItemById(slotProps.data.id)"
                  />
                  <Button
                    label="Delete"
                    icon="fa fa-trash"
                    class="p-button rounded-xl p-button-danger"
                    @click="deleteItem(slotProps.data.id)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
          <div v-else>Loading Data...</div>
        </div>
      </div>
    </section>
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
        <label for="editNama" class="text-[var(--text-primary)]">Nama</label>
        <InputText
          v-model="selectedItem.Name"
          id="editNama"
          placeholder="Nama Barang"
          class="bg-[var(--input-primary)]"
        />
      </div>
      <div class="mt-3 flex flex-col">
        <label for="editQuantity" class="text-[var(--text-primary)]"
          >Quantity</label
        >
        <InputNumber
          v-model="selectedItem.quantity"
          id="editQuantity"
          :min="0"
          :max="999"
          placeholder="Jumlah Barang"
        />
      </div>
      <div class="mt-3 flex flex-col">
        <label for="editUnit" class="text-[var(--text-primary)]">Satuan</label>
        <Select
          v-model="selectedItem.unit_id"
          :options="units"
          optionLabel="Name"
          optionValue="id"
          placeholder="Pilih Satuan"
          class="custom-select w-full md:w-auto p-4"
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

<style scoped>
.text {
  color: var(--text-secondary);
}
</style>
