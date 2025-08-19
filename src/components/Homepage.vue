<script setup>
import Card from "./items/Card.vue";
import { ref, watch, onMounted } from "vue";
import { supabase } from "../supabase";
import Burger from "../components/header.vue";

const menuList = ref([]);
const categories = ref([]);
const selectedCategory = ref(null);
const isLoading = ref(true);
const filteredMenuList = ref([]);
const originalMenuList = ref([]);
const searchQuery = ref("");

// fetch kategori
const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("kategori_menu")
      .select("id, kategori");

    if (error) throw error;

    categories.value = [{ id: null, kategori: "All Categories" }, ...data];
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
};

// filter kategori
watch(selectedCategory, async newCategory => {
  isLoading.value = true;
  menuList.value = await fetchMenuList(newCategory);
  isLoading.value = false;
});

// reset pencarian
watch(searchQuery, async (newQuery, oldQuery) => {
  if (oldQuery.trim() !== "" && newQuery.trim() === "") {
    menuList.value = [...originalMenuList.value];
  }
});

// handle search
const handleSearch = async () => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase();

  if (normalizedQuery === "") {
    menuList.value = [...originalMenuList.value];
  } else {
    menuList.value = originalMenuList.value.filter(menu =>
      menu.name.toLowerCase().includes(normalizedQuery)
    );
  }
};

// fetch data awal
const fetchInitialData = async () => {
  originalMenuList.value = await fetchMenuList(selectedCategory.value);
  menuList.value = [...originalMenuList.value];
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
    <!-- HEADER -->
    <div
      class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <!-- Kiri: Burger + Title -->
      <div class="flex items-center gap-3">
        <Burger />
        <h1
          style="font-size: 30px"
          class="text-[var(--text-secondary)] font-bold"
        >
          MENU
        </h1>
      </div>

      <!-- Kanan: Search + Filter (hanya muncul di tablet/desktop) -->
      <div class="flex flex-row gap-4 md:flex-row md:items-center">
        <!-- Search -->
        <div class="flex">
          <InputText
            v-model="searchQuery"
            style="border-radius: 10px 0 0 10px"
            class="custom-search w-36 md:w-56 lg:w-80 font-bold rounded-none focus:outline-none"
            placeholder="Cari..."
            @keydown.enter="handleSearch"
          />
          <Button
            style="border-radius: 0 10px 10px 0"
            icon="fas fa-search"
            class="button-search bg-[var(--btn-secondary)] text-white rounded-none"
            @click="handleSearch"
          />
        </div>

        <!-- Filter kategori -->
        <Select
          v-model="selectedCategory"
          :options="categories"
          option-value="id"
          option-label="kategori"
          placeholder="Pilih Kategori"
          class="p-select flex-none w-28 sm:w-36 md:w-56 lg:w-64 bg-[var(--input-search)]"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center mt-8">
      <ProgressSpinner />
    </div>

    <!-- Konten -->
    <div v-else class="mt-6">
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
