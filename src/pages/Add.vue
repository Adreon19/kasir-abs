<script setup>
import Add from "../components/items/menu/AddMenu.vue";
import AddCategory from "../components/items/menu/AddCategory.vue";
import ListMenu from "../components/items/menu/ListMenu.vue";
import AddPrice from "../components/items/menu/AddPrice.vue";
import AddVariants from "../components/items/variants/Variants.vue";
// import Discount from "../components/items/discount/Discount.vue";
</script>
<template>
  <div class="p-5">
    <h1 class="text text-xl font-bold mb-4 ml-14 md:ml-0 xl:ml-0">
      Tambah Menu
    </h1>
  </div>
  <div class="flex flex-col gap-4">
    <Add />
    <AddPrice />
    <!-- <Discount /> -->
    <ListMenu />
    <AddCategory />
    <AddVariants />
  </div>
  <Toast />
</template>

<style scoped>
.text {
  color: var(--text-secondary);
}
</style>
