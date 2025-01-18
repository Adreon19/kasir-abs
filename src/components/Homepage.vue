<script setup>
import Card from "./items/Card.vue";
import { ref, watch, onMounted } from "vue";
import { supabase } from "../supabase";

const menuList = ref([]);
const categories = ref([]);
const selectedCategory = ref(null);
const isLoading = ref(true);

const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("kategori_menu")
      .select("id, kategori");

    if (error) {
      throw error;
    }

    // Add an "All Categories" option
    categories.value = [{ id: null, kategori: "All Categories" }, ...data];
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
};

watch(selectedCategory, async (newCategory) => {
  isLoading.value = true;
  menuList.value = await fetchMenuList(newCategory);
  isLoading.value = false;
});

const fetchMenuList = async (categoryId = null) => {
  try {
    let query = supabase.from("menu_list").select(`
          name,
          image,
          description,
          kategori_id,
          menu_detail (
            price,
            variant_id,
            menu_variants(name)
          )
      `);

    if (categoryId !== null) {
      query = query.eq("kategori_id", categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("Error fetching menu list:", err.message);
  }
};

const initializeData = async () => {
  try {
    menuList.value = await fetchMenuList();
    await fetchCategories();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeData);
</script>

<template>
  <div>
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
        />
        <Button
          style="border-radius: 0 10px 10px 0"
          icon="fas fa-search"
          iconPos="top"
          class="button-search hover:border-none text-black bg-white rounded-none"
        />
      </div>
      <Select
        v-model="selectedCategory"
        :options="categories"
        option-value="id"
        option-label="kategori"
        placeholder="Select Categories"
        class="p-select w-full md:w-56 font-bold"
      />
    </div>
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <div v-if="menuList.length === 0" class="text-white text-center">
        Tidak ada menu
      </div>
      <div v-else>
        <Card :menu-list="menuList" />
      </div>
    </div>
  </div>
</template>
