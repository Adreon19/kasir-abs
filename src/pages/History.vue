<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";
import { formatCurrency } from "../utils/formatter/currency";

const order = ref([]);

const fetchOrder = async () => {
  try {
    let { data: order_detail, error } = await supabase.from("order_detail")
      .select(`
      id, 
      order_id(
        id,
        customer_name,
        payment(
          id,
          name
        ),
        paid,
        total_price
      ), 
      menu_detail_id(
        menu_id(
          id,
          name
        )
      ),
      quantity,
      note
      `);
    if (error) throw error;
    order.value = order_detail;
  } catch (error) {
    console.log("error fetching order:", error);
  }
};

onMounted(fetchOrder);
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <h1 style="font-size: 30px">Riwayat Pesanan</h1>
    <section class="main-section">
      <DataTable :value="order" stripedRows tableStyle="min-width: 50rem">
        <Column field="order_id.customer_name" header="Customer Name" />
        <Column field="order_id.payment.name" header="Payment Method" />
        <Column field="menu_detail_id.menu_id.name" header="Menu Name" />
        <Column field="quantity" header="Quantity" />
        <Column field="note" header="Note" />
        <Column header="Total">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.order_id.total_price) }}
          </template>
        </Column>

        <!-- Custom rendering for Paid column -->
        <Column header="Paid">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.order_id.paid) }}
          </template>
        </Column>
      </DataTable>
    </section>
  </div>
</template>
