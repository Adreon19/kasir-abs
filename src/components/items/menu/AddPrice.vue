<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue";

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
    const payload = variantDetails.value.map((detail) => ({
      menu_id: selectedMenu.value,
      variant_id: detail.variant_id,
      price: detail.price,
    }));

    const { error } = await supabase.from("menu_detail").insert(payload);

    if (error) {
      throw error;
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Menu details saved successfully!",
      life: 3000,
    });

    // Reset form
    selectedMenu.value = null;
    variantDetails.value = [{ variant_id: null, price: null }];
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error inserting menu detail:", error.message);
  }
};

onMounted(() => {
  fetchMenus();
  fetchVariants();
});
</script>

<template>
  <section class="main-section">
    <h2 class="capitalize font-bold">Tambah harga menu</h2>
    <div class="flex flex-col card">
      <!-- Select Menu -->
      <div class="field">
        <label for="menu">Menu</label>
        <Select
          v-model="selectedMenu"
          :options="menus"
          optionLabel="name"
          optionValue="id"
          placeholder="Select Menu"
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
            placeholder="Select Variant"
            class="custom-select w-full p-3"
          />
        </div>

        <div class="field">
          <label for="price">Price</label>
          <InputNumber
            v-model="detail.price"
            placeholder="Enter Price"
            class="price w-full"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            fluid
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
        class="custom-button btn btn-secondary mt-4 p-4"
        @click="addVariantField"
      >
        Tambah Variant Lainnya
      </Button>

      <!-- Submit Button -->
      <Button
        class="custom-button btn btn-primary mt-4 p-4"
        @click="insertMenuDetail"
      >
        Tambah Detail Menu
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
