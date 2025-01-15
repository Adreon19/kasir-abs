<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue";

const toast = useToast();
const menus = ref([]);
const selectedMenu = ref([]);
const price = ref(null);
const coldPrice = ref(null);
const hotPrice = ref(null);

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

const insertMenuDetail = async () => {
  try {
    const { error } = await supabase.from("menu_detail").insert([
      {
        menu_id: selectedMenu.value,
        price: price.value,
        cold_price: coldPrice.value,
        hot_price: hotPrice.value,
      },
    ]);

    if (error) {
      throw error;
    }
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Menu saved successfully!",
      life: 3000,
    });
    alert("Menu detail added successfully!");
    selectedMenu.value = "";
    price.value = null;
    coldPrice.value = null;
    hotPrice.value = null;
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
          class="w-full p-3"
        />
      </div>

      <!-- Input Price -->
      <div class="field">
        <label for="price">Price</label>
        <InputNumber
          v-model="price"
          placeholder="Enter price"
          class="price w-full"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          fluid
        />
      </div>

      <div class="field">
        <label for="coldPrice">Cold Price</label>
        <InputNumber
          id="coldPrice"
          v-model="coldPrice"
          placeholder="Enter cold price"
          class="cold w-full"
          mode="currency"
          currency="IDR"
          locale="id-ID"
        />
      </div>

      <div class="field">
        <label for="hotPrice">Hot Price</label>
        <InputNumber
          id="hotPrice"
          v-model="hotPrice"
          placeholder="Enter hot price"
          class="hot w-full"
          mode="currency"
          currency="IDR"
          locale="id-ID"
        />
      </div>

      <Button class="btn btn-primary mt-4" @click="insertMenuDetail">
        Add Menu Detail
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
</style>
