<script setup>
import Add from "../components/items/menu/AddMenu.vue";
import AddCategory from "../components/items/menu/AddCategory.vue";
import ListCategory from "../components/items/menu/ListCategory.vue";
import ListMenu from "../components/items/menu/ListMenu.vue";
import AddPrice from "../components/items/menu/AddPrice.vue";
</script>
<template>
  <div class="flex flex-col gap-4 p-4 max-w-full min-w-96 container">
    <Add />
    <AddPrice />
    <AddCategory />
    <ListMenu />
    <ListCategory />
  </div>
  <Toast />
</template>
