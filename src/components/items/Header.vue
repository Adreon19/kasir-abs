<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../supabase";

const categories = ref([]);
const selectedCategories = ref([]);

const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("kategori_menu")
      .select("kategori");

    if (error) {
      throw error;
    }

    categories.value = data;
    console.log("Fetched categories:", categories.value);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
};
onMounted(fetchCategories);
</script>

<template>
  <div
    class="searchBar m-5"
    style="display: flex; justify-content: space-between"
  >
    <h1 style="font-size: 30px" class="text-white font-bold">Menu</h1>
    <div class="search flex relative">
      <InputText
        style="width: 400px; border-radius: 10px 0 0 10px"
        placeholder="Search..."
        class="search p-3 bg-white text-black font-bold rounded-none focus:outline-none"
      /><Button
        style="border-radius: 0 10px 10px 0"
        icon="fas fa-search"
        iconPos="top"
        class="button-search hover:border-none text-black bg-white rounded-none"
      />
    </div>
    <Select
      v-model="selectedCategories"
      :options="categories"
      optionLabel="kategori"
      placeholder="Select Categories"
      class="w-full md:w-56 bg-white text-black font-bold"
    />
  </div>
</template>

<style scopped>
Button:hover {
  border-color: transparent;
}
</style>
