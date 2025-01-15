<script setup>
import Add from "../components/items/menu/AddMenu.vue";
import AddCategory from "../components/items/menu/AddCategory.vue";
import ListCategory from "../components/items/menu/ListCategory.vue";
import ListMenu from "../components/items/menu/ListMenu.vue";
import AddPrice from "../components/items/menu/AddPrice.vue";
</script>
<template>
  <div class="flex flex-col gap-4 max-w-screen-2xl mx-auto p-4">
    <Add />
    <AddPrice />
    <AddCategory />
    <ListCategory />
    <ListMenu />
  </div>
  <Toast />
</template>
