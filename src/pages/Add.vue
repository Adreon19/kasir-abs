<script setup>
import Add from "../components/items/menu/AddMenu.vue";
import AddCategory from "../components/items/menu/AddCategory.vue";
import ListMenu from "../components/items/menu/ListMenu.vue";
import AddPrice from "../components/items/menu/AddPrice.vue";
import AddVariants from "../components/items/variants/Variants.vue";
</script>
<template>
  <div class="flex flex-col gap-4 p-4 max-w-full min-w-96 container">
    <Add />
    <AddPrice />
    <ListMenu />
    <AddCategory />
    <AddVariants />
  </div>
  <Toast />
</template>
