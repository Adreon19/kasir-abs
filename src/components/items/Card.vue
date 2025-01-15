<script setup>
import { Card } from "primevue";
import { ref, onMounted } from "vue";
import { supabase } from "../../supabase";
import { formatCurrency } from "../../utils/formatter/currency";

const menuList = ref([]);

const fetchMenuList = async () => {
  try {
    const { data, error } = await supabase.from("menu_detail").select(`
        price,
        hot_price,
        cold_price,
        menu_id (
          name,
          image
        )
      `);

    if (error) throw error;

    menuList.value = data.map((menu) => ({
      price: menu.price || null,
      hotWater: menu.hot_price || false,
      coldWater: menu.cold_price || false,
      name: menu.menu_id?.name || "Unnamed",
      image: menu.menu_id?.image || "placeholder.jpg",
    }));
  } catch (err) {
    console.error("Error fetching menu list:", err.message);
  }
};

const initializeData = async () => {
  try {
    await fetchMenuList();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  }
};

onMounted(initializeData);
</script>

<template>
  <section class="grid grid-cols-4 gap-4 m-4">
    <Card
      v-for="menu in menuList"
      :key="menu.name"
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
      <template #content>
        <h4 v-if="menu.price !== null">
          Price: {{ formatCurrency(menu.price) }}
        </h4>
        <div v-if="menu.hotWater || menu.coldWater" class="text-sm mt-2">
          <p v-if="menu.hotWater">✔ Hot Water Available</p>
          <p v-if="menu.coldWater">✔ Cold Water Available</p>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-4 mt-1">
          <Button label="Pesan" class="w-full" />
        </div>
      </template>
    </Card>
  </section>
</template>
