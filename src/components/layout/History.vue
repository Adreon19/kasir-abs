<script setup>
// import { ref, onMounted } from "vue";
// import { ProductService } from "@/service/ProductService";

// onMounted(() => {
//   ProductService.getProductsMini().then((data) => (products.value = data));
// });

// const products = ref();
// const columns = [
//   { field: "code", header: "Code" },
//   { field: "name", header: "Name" },
//   { field: "category", header: "Category" },
//   { field: "quantity", header: "Quantity" },
// ];
</script>

<template>
  <div class="m-5">
    <h1 style="font-size: 30px">History Menu</h1>
  </div>

  <div class="">
    <DataTable :value="products" tableStyle="min-width: 50rem">
      <Column field="code" header="Code"></Column>
      <Column field="name" header="Name"></Column>
      <Column field="category" header="Category"></Column>
      <Column field="quantity" header="Quantity"></Column>
    </DataTable>
  </div>
</template>
