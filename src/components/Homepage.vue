<script setup>
import Card from "./items/Card.vue";
import { ref, watch, onMounted } from "vue";
import { supabase } from "../supabase";

const menuList = ref([]);
const categories = ref([]);
const selectedCategory = ref(null);
const isLoading = ref(true);
const filteredMenuList = ref([]);
const originalMenuList = ref([]);
const searchQuery = ref("");

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

watch(searchQuery, async (newQuery, oldQuery) => {
  if (oldQuery.trim() !== "" && newQuery.trim() === "") {
    menuList.value = [...originalMenuList.value]; // Kembalikan ke data asli
  }
});

const handleSearch = async () => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase();

  if (normalizedQuery === "") {
    menuList.value = [...originalMenuList.value]; // Kembalikan ke data asli
  } else {
    menuList.value = originalMenuList.value.filter((menu) =>
      menu.name.toLowerCase().includes(normalizedQuery)
    );
  }
};

// Ambil data awal saat komponen dimuat
const fetchInitialData = async () => {
  originalMenuList.value = await fetchMenuList(selectedCategory.value);
  menuList.value = [...originalMenuList.value]; // Duplikat untuk pencarian
};

onMounted(fetchInitialData);

const fetchMenuList = async (categoryId = null) => {
  try {
    let query = supabase.from("menu_list").select(`
          name,
          image,
          description,
          kategori_id,
          menu_detail (
            id,
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
    console.log(menuList.value); // Log menuList untuk memverifikasi isinya
    filteredMenuList.value = menuList.value;
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
  <div class="relative min-h-screen">
    <div
      class="searchBar m-5 z-0"
      style="display: flex; justify-content: space-between"
    >
      <div class="flex items-center gap-2">
        <h1
          style="font-size: 30px"
          class="hidden xl:flex md:flex text-[var(--text-secondary)] font-bold"
        >
          MENU
        </h1>
      </div>
      <div class="flex flex-col gap-8 xl:flex-row md:flex-row xl:gap-5">
        <div class="search flex">
          <InputText
            v-model="searchQuery"
            style="border-radius: 10px 0 0 10px"
            class="custom-search w-48 p-3 font-bold rounded-none focus:outline-none lg:w-64 xl:w-96"
            placeholder="Cari..."
            @keydown.enter="handleSearch"
          />
          <Button
            style="border-radius: 0 10px 10px 0"
            icon="fas fa-search"
            iconPos="top"
            class="button-search color-white bg-[var(--btn-secondary)] rounded-none"
            @click="handleSearch"
          />
        </div>
        <div class="flex justify-between items-center">
          <h1
            style="font-size: 20px; margin-left: -110px"
            class="m-0 font-bold text-black md:hidden xl:hidden"
          >
            MENU
          </h1>
          <Select
            v-model="selectedCategory"
            :options="categories"
            option-value="id"
            option-label="kategori"
            placeholder="Pilih Kategori"
            class="p-select w-40 font-sm md:w-56 bg-[var(--input-search)] xl:w-full"
          />
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else>
      <div
        v-if="menuList.length === 0"
        class="text-[var(--text-secondary)] text-center"
      >
        Tidak ada menu
      </div>
      <div v-else>
        <Card :menu-list="menuList" />
      </div>
    </div>
  </div>
  <Toast />
</template>
