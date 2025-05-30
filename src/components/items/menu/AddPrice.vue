<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue";
import { onEvent, emitEvent } from "../../../utils/BusEvent"; // Adjust the path as necessary

const toast = useToast();
const menus = ref([]);
const selectedMenu = ref(null);
const variantDetails = ref([{ variant_id: null, price: null }]);
const variants = ref([]);

const fetchMenus = async () => {
  try {
    const { data, error } = await supabase.from("menu_list").select(`id, name`);

    if (error) {
      throw error;
    }

    menus.value = data;

    console.log("Fetched menu with details:", menus.value);
  } catch (error) {
    console.error("Error fetching menu:", error.message);
  }
};

const fetchVariants = async () => {
  try {
    const { data, error } = await supabase
      .from("menu_variants")
      .select(`id, name`);
    if (error) {
      throw error;
    }
    variants.value = data;
  } catch (error) {
    console.error("Error fetching menu variants:", error.message);
  }
};

const addVariantField = () => {
  variantDetails.value.push({ variant_id: null, price: null });
};

const removeVariantField = (index) => {
  variantDetails.value.splice(index, 1);
};

const insertMenuDetail = async () => {
  try {
    // Check if the selected menu already has the chosen variant
    const { data: existingData, error: fetchError } = await supabase
      .from("menu_detail")
      .select("variant_id")
      .eq("menu_id", selectedMenu.value);

    if (fetchError) {
      throw fetchError;
    }

    const existingVariantIds = existingData.map((item) => item.variant_id);

    const duplicateVariant = variantDetails.value.find((detail) =>
      existingVariantIds.includes(detail.variant_id)
    );

    if (duplicateVariant) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Variant ini sudah ada",
        life: 9000,
      });
      return;
    }

    // Proceed with insertion
    const payload = variantDetails.value.map((detail) => ({
      menu_id: selectedMenu.value,
      variant_id: detail.variant_id,
      price: detail.price,
    }));

    const { error } = await supabase.from("menu_detail").insert(payload);

    if (error) {
      throw error;
    }

    emitEvent("priceAdded", { menuId: selectedMenu.value });
    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: "Detail menu berhasil disimpan!",
      life: 9000,
    });

    // Reset form
    selectedMenu.value = null;
    variantDetails.value = [{ variant_id: null, price: null }];
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Kesalahan",
      detail: error.message,
      life: 9000,
    });
    console.error("Error inserting menu detail:", error.message);
  }
};

onMounted(() => {
  fetchMenus();
  fetchVariants();
  onEvent("menuAdded", () => {
    fetchMenus();
  });
});
</script>

<template>
  <section
    class="main-section max-w-full flex flex-col md:w-full xl:w-full md:mt-0 xl:mt-0"
  >
    <h2 class="capitalize font-bold">Tambah harga menu</h2>
    <div class="flex flex-col">
      <!-- Select Menu -->
      <div class="field">
        <label for="menu">Menu</label>
        <Select
          v-model="selectedMenu"
          :options="menus"
          optionLabel="name"
          optionValue="id"
          placeholder="Pilih Menu"
          class="custom-select w-full p-3"
        />
      </div>

      <!-- Dynamic Variant and Price Fields -->
      <div
        v-for="(detail, index) in variantDetails"
        :key="index"
        class="field-group"
      >
        <div class="field">
          <label for="variant">Variant</label>
          <Select
            v-model="detail.variant_id"
            :options="variants"
            optionLabel="name"
            optionValue="id"
            placeholder="Pilih Varian"
            class="custom-select w-full p-3"
          />
        </div>

        <div class="field">
          <label for="price">Price</label>
          <InputNumber
            v-model="detail.price"
            placeholder="Masukkan Harga"
            class="custom-price w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            fluid
            :min="0"
            :max="100000"
          />
        </div>

        <!-- Remove Variant Field -->
        <Button
          v-if="variantDetails.length > 1"
          class="remove-btn btn btn-danger mt-2"
          @click="removeVariantField(index)"
        >
          Remove Variant
        </Button>
      </div>

      <!-- Add Another Variant Field -->
      <Button
        class="custom-button btn btn-secondary mt-4 p-4 w-full"
        @click="addVariantField"
      >
        Tambah Variant Lainnya
      </Button>

      <!-- Submit Button -->
      <Button
        class="custom-button btn btn-primary mt-4 w-full"
        @click="insertMenuDetail"
      >
        <i class="fa-solid fa-floppy-disk"></i>
        Simpan Detail Menu
      </Button>
    </div>
  </section>
</template>

<style scoped>
.main-section {
  padding: 1rem;
}
.field {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field-group {
  margin-bottom: 1rem;
  border-radius: 4px;
}
</style>
