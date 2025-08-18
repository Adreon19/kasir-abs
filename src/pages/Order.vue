<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";
import { Card, ProgressSpinner } from "primevue";
import Burger from "../components/header.vue";

const customers = ref([]);
const router = useRouter();
const isLoading = ref(false);

const fetchCustomers = async () => {
  try {
    isLoading.value = true;
    const { data, error } = await supabase
      .from("customer")
      .select("id, customer");
    if (error) throw error;
    customers.value = data;
  } catch (error) {
    console.error("Error fetching customers:", error.message);
  } finally {
    isLoading.value = false;
  }
};

const selectCustomer = customerId => {
  router.push({ name: "Cart", query: { customerId } });
};

onMounted(fetchCustomers);
</script>
<template>
  <Burger>
    <slot>
      <h1 class="text text-xl font-bold md:ml-0 xl:ml-0">Pilih pelanggan</h1>
    </slot>
  </Burger>
  <section class="min-h-screen p-5">
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else>
      <div v-if="customers.length === 0" class="text text-center">
        <p>Belum ada yang memesan, silahkan pesan</p>
        <RouterLink to="/">
          <Button label="Pesan di sini" class="mt-4 text-" />
        </RouterLink>
      </div>
      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-9 md:mt-6 xl:mt-6"
      >
        <Card
          v-for="customer in customers"
          :key="customer.id"
          class="cursor-pointer border flex items-center"
          @click="selectCustomer(customer.id)"
        >
          <template #title>{{ customer.customer }}</template>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  transition: transform 0.2s;
}
.text {
  color: var(--text-secondary);
}
.card:hover {
  transform: scale(1.05);
}
</style>
