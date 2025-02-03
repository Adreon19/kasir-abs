<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const variants = ref([]);
const newVariant = ref("");
const isLoading = ref(false);
const dialogVisible = ref(false);
const selectedVariant = ref({ id: null, name: "" }); // Initialize with an object

const fetchVariants = async () => {
  try {
    isLoading.value = true;
    const { data, error } = await supabase
      .from("menu_variants")
      .select("id, name");

    if (error) throw error;

    variants.value = data;
    console.log("Fetched variants:", variants.value);
  } catch (error) {
    console.error("Error fetching variants:", error.message);
  } finally {
    isLoading.value = false;
  }
};

const fetchVariantById = async (id) => {
  dialogVisible.value = true; // Show the dialog
  try {
    isLoading.value = true;
    const { data, error } = await supabase
      .from("menu_variants")
      .select("id, name")
      .eq("id", id)
      .single();

    if (error) throw error;

    selectedVariant.value = data; // Set the selected variant
  } catch (error) {
    console.error("Error fetching variant:", error.message);
  } finally {
    isLoading.value = false;
  }
};

const updateVariant = async () => {
  try {
    const { id, name } = selectedVariant.value;

    if (!id) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ID Variant tidak valid",
        life: 5000,
      });
      return;
    }

    if (!name.trim()) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Nama variant tidak boleh kosong",
        life: 5000,
      });
      return;
    }

    const { error } = await supabase
      .from("menu_variants")
      .update({ name: name })
      .eq("id", id);

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: "Variant berhasil diperbarui!",
      life: 5000,
    });

    await fetchVariants();
    dialogVisible.value = false; // Close the dialog
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error updating Variant:", error);
  }
};

const addVariant = async () => {
  if (!newVariant.value.trim()) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Nama variant tidak boleh kosong!",
      life: 5000,
    });
    return;
  }

  try {
    const { error } = await supabase
      .from("menu_variants")
      .insert({ name: newVariant.value });

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Variant berhasil ditambahkan!",
      life: 5000,
    });
    newVariant.value = ""; // Clear input
    await fetchVariants();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error Menambahkan variant",
      life: 3000,
    });
    console.error("Error adding variant:", error.message);
  }
};

const deleteVariant = async (variantId) => {
  try {
    const { error } = await supabase
      .from("menu_variants")
      .delete()
      .eq("id", variantId);
    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: "Variant berhasil dihapus!",
      life: 5000,
    });

    await fetchVariants();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error deleting Variant:", error);
  }
};

const initializeData = async () => {
  try {
    await fetchVariants();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  }
};

onMounted(initializeData);
</script>

<template>
  <section class="main-section">
    <h2>Tambah Variant</h2>
    <div class="card flex flex-col gap-5">
      <div class="flex gap-5">
        <FloatLabel>
          <InputText id="variant-name" v-model="newVariant" class="p-3" />
          <label for="variant-name">Nama variant</label>
        </FloatLabel>
        <Button
          label="Save"
          icon="fa fa-check"
          iconPos="left"
          @click="addVariant"
        />
      </div>
      <DataTable
        :value="variants"
        stripedRows
        paginator
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
      >
        <Column field="name" header="Nama Variant" />
        <Column header="Aksi" class="flex justify-center">
          <template #body="slotProps">
            <div class="flex justify-center gap-2">
              <Button
                label="Edit"
                icon="fa fa-pencil"
                class="p-button-rounded p-button-info"
                @click="fetchVariantById(slotProps.data.id)"
              />
              <Button
                label="Delete"
                icon="fa fa-trash"
                class="p-button-rounded p-button-danger"
                @click="deleteVariant(slotProps.data.id)"
              />
            </div>
          </template>
        </Column>
        <template #empty> Belum ada variant baru! </template>
      </DataTable>
    </div>
  </section>

  <Dialog
    v-model:visible="dialogVisible"
    header="Edit variant"
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
          v-model="selectedVariant.name"
          id="editNama"
          placeholder="Nama Variant"
        />
      </div>
      <div class="mt-4 flex justify-end">
        <Button
          label="Update"
          icon="fa fa-check"
          class="p-button-rounded p-button-success"
          @click="updateVariant"
        />
      </div>
    </div>
  </Dialog>

  <Toast />
</template>
