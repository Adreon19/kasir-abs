<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";
import { formatCurrency } from "../utils/formatter/currency";

const expandedRows = ref([]);
const order = ref([]);
const isLoading = ref(false);

const fetchOrder = async () => {
  try {
    isLoading.value = true;
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
        ),
        price
      ),
      quantity
      `);
    if (error) throw error;
    order.value = order_detail.reduce((acc, item) => {
      const existingOrder = acc.find((o) => o.id === item.order_id.id);
      if (existingOrder) {
        existingOrder.details.push({
          menu_name: item.menu_detail_id.menu_id.name,
          menu_price: item.menu_detail_id.price,
          quantity: item.quantity,
          total_price: item.order_id.total_price,
        });
      } else {
        acc.push({
          id: item.order_id.id,
          customer_name: item.order_id.customer_name,
          paid: item.order_id.paid,
          payment_method: item.order_id.payment.name,
          details: [
            {
              menu_name: item.menu_detail_id.menu_id.name,
              menu_price: item.menu_detail_id.price,
              quantity: item.quantity,
              total_price: item.order_id.total_price,
            },
          ],
        });
      }
      return acc;
    }, []);
  } catch (error) {
    console.log("error fetching order:", error);
  } finally {
    isLoading.value = false;
  }
};

const expandAll = () => {
  expandedRows.value = order.value.reduce(
    (acc, p) => (acc[p.id] = true) && acc,
    {}
  );
};

// Collapse all rows
const collapseAll = () => {
  expandedRows.value = [];
};

onMounted(fetchOrder);
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <h1 style="font-size: 30px">Riwayat Pesanan</h1>
    <div v-if="isLoading" class="flex justify-center">
      <progressSpinner />
    </div>
    <div v-else>
      <section class="main-section">
        <DataTable
          :value="order"
          :expandedRows="expandedRows"
          @update:expandedRows="expandedRows = $event"
          dataKey="id"
          stripedRows
          tableStyle="min-width: 50rem"
        >
          <!-- Row Expander -->
          <template #header>
            <div class="flex flex-wrap justify-content-end gap-2">
              <Button
                text
                icon="pi pi-plus"
                label="Expand All"
                @click="expandAll"
              />
              <Button
                text
                icon="pi pi-minus"
                label="Collapse All"
                @click="collapseAll"
              />
            </div>
          </template>
          <Column expander icon="pi pi-chevron-right" style="width: 5rem" />

          <!-- Customer Name -->
          <Column field="customer_name" header="Customer Name" />

          <!-- Paid Amount -->
          <Column field="paid" header="Paid">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.paid) }}
            </template>
          </Column>

          <!-- Expanded Content -->
          <template #expansion="slotProps">
            <div>
              <p>An order from {{ slotProps.data.customer_name }}</p>
              <DataTable
                :value="slotProps.data.details"
                tableStyle="min-width: 50rem"
              >
                <Column field="menu_name" header="Menu Name" />
                <Column field="menu_price" header="Total">
                  <template #body="detailsSlotProps">
                    {{ formatCurrency(detailsSlotProps.data.menu_price) }}
                  </template>
                </Column>
                <Column field="quantity" header="Quantity" />
                <Column field="total_price" header="Total">
                  <template #body="detailsSlotProps">
                    {{ formatCurrency(detailsSlotProps.data.total_price) }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
        </DataTable>
      </section>
    </div>
  </div>
</template>
