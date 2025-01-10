<script setup>
import { ref } from "vue";

const selectedCategories = ref();
const categories = ref([
    { name: 'KOPI', code: 'NY' },
    { name: 'TEH', code: 'RM' },
    { name: 'MOCKTAIL', code: 'LDN' },
    { name: 'COCKTAIL', code: 'IST' },
    { name: 'VODKA', code: 'PRS' }
]);
</script>


<template>
    <div class="searchBar m-5" style="display: flex; justify-content: space-between;">
        <h1 style="font-size: 30px;">Home Page</h1>
        <div class="flex gap-2">
            <InputText style="width: 250px;" placeholder="Search..." class="p-3 "/><Button icon="fas fa-search" iconPos="top" class="" />   
        </div>
        <Select v-model="selectedCategories" :options="categories" optionLabel="name" placeholder="Select Categories" checkmark :highlightOnSelect="false" class="w-full md:w-56" />
    </div>
</template>

