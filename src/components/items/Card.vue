<script setup>
import { Card } from "primevue";
import { formatCurrency } from "../../utils/formatter/currency";

const { menuList } = defineProps(["menuList"]);
</script>

<template>
  <section class="flex flex-col m-4">
    <div class="grid grid-cols-4 gap-4">
      <Card
        v-for="menu in menuList"
        :key="menu.name"
        class="menu flex flex-col h-full p-0 rounded-lg"
      >
        <template #header>
          <img
            :alt="menu.name"
            :src="menu.image"
            class="img-menu object-cover h-48 w-full"
          />
        </template>

        <template #title>
          <h3 class="text-xl capitalize font-bold">{{ menu.name }}</h3>
        </template>
        <template #content class="flex-1">
          <template v-for="detail in menu.menu_detail">
            <h4 class="mb-2 text-sm text-slate-400">
              {{ detail.menu_variants.name }}:
              {{ formatCurrency(detail.price) }}
            </h4>
          </template>

          <div class="text-sm text-slate-400 mt-2">
            <p class="text-white">{{ menu.description }}</p>
          </div>
        </template>

        <template #footer>
          <div class="flex gap-4 mt-auto">
            <Button label="Pesan" class="button w-full" />
          </div>
        </template>
      </Card>
    </div>
  </section>
</template>

<style scoped>
.menu {
  background: var(--bg-card);
  padding: 0;
  max-width: 250px;
}

.img-menu {
  border-radius: 8px 8px 0 0;
}

.button {
  background-color: transparent;
  border: 2px solid var(--sidebar-color);
  color: var(--sidebar-color);
}

.button:hover {
  background-color: var(--sidebar-color);
  color: var(--primary-text);
  border-color: transparent;
  transition: 0.5s;
}
</style>
