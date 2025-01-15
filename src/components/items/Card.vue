<script setup>
import { Card } from "primevue";
import { ref, onMounted } from "vue";
import { supabase } from "../../supabase";
const categories = ref([]);
const menuList = ref([]);

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

const fetchMenuList = async () => {
  try {
    const { data, error } = await supabase.from("menu_list").select("*");
    if (error) throw error;
    menuList.value = data;
  } catch (err) {
    console.error("Error fetching menu list:", err.message);
  }
};

const initializeData = async () => {
  try {
    await fetchCategories();
    await fetchMenuList();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeData);
</script>

<template>
  <section class="grid grid-cols-4 gap-4 m-4">
    <Card
      v-for="menu in menuList"
      :key="menu.id"
      style="width: 18rem; overflow: hidden"
    >
      <template #header>
        <img
          :alt="menu.name"
          :src="menu.image"
          class="object-cover h-48 w-full"
        />
      </template>
      <template #title>{{ menu.name }}</template>
      <template #footer>
        <div class="flex gap-4 mt-1">
          <Button label="Pesan" class="w-full" />
        </div>
      </template>
    </Card>
  </section>
</template>
