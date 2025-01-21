<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "../supabase";
import { formatCurrency } from "../utils/formatter/currency";

const finance = ref([]);

const fetchFinance = async () => {
  try {
    let { data: order_detail, error } = await supabase.from("order").select(`
      id, 
      paid,
      total_price,
      change
      `);
    if (error) throw error;
    finance.value = order_detail;
  } catch (error) {
    console.log("error fetching order:", error);
  }
};

const totalFinance = computed(() => {
  const totalPaid = finance.value.reduce(
    (sum, item) => sum + (item.paid || 0),
    0
  );
  const totalChange = finance.value.reduce(
    (sum, item) => sum + (item.change || 0),
    0
  );
  return totalPaid - totalChange;
});

onMounted(fetchFinance);
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <h1 style="font-size: 30px">Riwayat Keuangan</h1>
    <section class="main-section">
      <h1 class="text-4xl">
        Total keuangan: {{ formatCurrency(totalFinance) }}
      </h1>
    </section>
    <section class="main-section">
      <div class="container flex flex-col gap-4">
        <DataTable :value="finance" stripedRows tableStyle="min-width: 50rem">
          <Column header="Total Masuk">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.paid) }}
            </template>
          </Column>
          <Column header="Kembalian">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.change) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </section>
  </div>
</template>
