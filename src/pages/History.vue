<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";
import { formatCurrency } from "../utils/formatter/currency";
import { printReceiptHtml } from "../utils/print-history-receipt";

const expandedRows = ref([]);
const order = ref([]);
const unpaidOrders = ref([]);
const isLoading = ref(false);
const filteredOrders = ref([]);
const selectedDateFilter = ref(null);
const printFrame = ref(null);
const dt = ref();

const dateFilterOptions = [
  { label: "Current Date", value: "today" },
  { label: "Last 7 Days", value: "last7days" },
  { label: "This Month", value: "thisMonth" },
  { label: "All", value: "all" },
];

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
          total_price,
          created_at
        ),
        menu_detail_id(
          menu_id(
            id,
            name,
            kategori_id(
              kategori
            )
          ),
          price
        ),
        quantity
      `);
    if (error) throw error;

    order.value = order_detail.reduce((acc, item) => {
      const existingOrder = acc.find((o) => o.id === item.order_id.id);

      const menuName = item.menu_detail_id
        ? item.menu_detail_id.menu_id.name
        : "Menu sudah dihapus";

      const menuPrice = item.menu_detail_id ? item.menu_detail_id.price : 0;
      const category = item.menu_detail_id
        ? item.menu_detail_id.menu_id.kategori_id.kategori
        : "Unknown Category";
      const totalPrice = item.quantity * menuPrice;

      if (existingOrder) {
        existingOrder.details.push({
          menu_name: menuName,
          menu_price: menuPrice,
          quantity: item.quantity,
          total_price: totalPrice,
          created_at: item.order_id.created_at,
          category: category,
        });
      } else {
        acc.push({
          id: item.order_id.id,
          customer_name: item.order_id.customer_name,
          paid: item.order_id.paid,
          payment_method: item.order_id.payment.name,
          total_price: item.order_id.total_price,
          created_at: item.order_id.created_at,
          details: [
            {
              menu_name: menuName,
              menu_price: menuPrice,
              quantity: item.quantity,
              total_price: totalPrice,
              created_at: item.order_id.created_at,
              category: category,
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
    filterOrders();
  }
};

const fetchCarts = async () => {
  try {
    isLoading.value = true;
    let { data, error } = await supabase.from("cart").select(`
        id,
        quantity,
        note,
        menu_detail:menu_detail_id (
          id,
          price,
          menu_id (
            name,
            kategori_id (
              kategori
            )
          )
        ),
        customer:customer!cart_customer_id_fkey (
        id,
        customer
          ),
          timestamp
      `);
    if (error) throw error;

    const groupedCarts = data.reduce((acc, item) => {
      const customerName = item.customer?.customer || "Unknown Customer";
      const customerId = item.customer?.id || "unknown";

      if (!acc[customerId]) {
        acc[customerId] = {
          customer_id: customerId,
          customer_name: customerName,
          items: [],
          total_unpaid_amount: 0,
        };
      }

      const itemPrice = item.menu_detail?.price || 0;
      const subtotal = item.quantity * itemPrice;

      acc[customerId].items.push({
        cart_id: item.id,
        menu_name: item.menu_detail?.menu_id?.name || "Menu dihapus",
        quantity: item.quantity,
        subtotal: subtotal,
        note: item.note,
      });

      acc[customerId].total_unpaid_amount += subtotal;

      return acc;
    }, {});
    unpaidOrders.value = Object.values(groupedCarts);
  } catch (error) {
    console.log("error fetching cart items:", error);
  } finally {
    isLoading.value = false;
  }
};

const filterOrders = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  if (selectedDateFilter.value === "today") {
    filteredOrders.value = order.value.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate.toDateString() === today.toDateString();
    });
  } else if (selectedDateFilter.value === "last7days") {
    filteredOrders.value = order.value.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= sevenDaysAgo && orderDate <= today;
    });
  } else if (selectedDateFilter.value === "thisMonth") {
    filteredOrders.value = order.value.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= firstDayOfMonth && orderDate <= today;
    });
  } else {
    filteredOrders.value = order.value;
  }
  filteredOrders.value.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "Invalid Date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
  return formattedDate;
};

const expandAll = () => {
  if (filteredOrders.value.length === 0) {
    alert("Tidak ada data untuk diperluas!");
    return;
  }
  expandedRows.value = filteredOrders.value.reduce(
    (acc, p) => (acc[p.id] = true) && acc,
    {}
  );
};

const collapseAll = () => {
  if (filteredOrders.value.length === 0) {
    alert("Tidak ada data untuk dikecilkan!");
    return;
  }
  expandedRows.value = [];
};

const printFilteredOrders = async () => {
  if (filteredOrders.value.length === 0 && unpaidOrders.value.length === 0) {
    alert("Tidak ada data transaksi atau pesanan belum dibayar untuk dicetak.");
    return;
  }
  try {
    await printReceiptHtml(
      filteredOrders.value,
      printFrame,
      unpaidOrders.value
    );
  } catch (error) {
    console.error("Error printing filtered receipts:", error);
    alert(`Gagal mencetak struk: ${error.message}`);
  }
};

const exportCSV = () => {
  if (filteredOrders.value.length === 0) {
    alert("Tidak ada data untuk di-export!");
    return;
  }
  const exportData = [];

  exportData.push([
    "Customer Name",
    "Paid",
    "Payment Method",
    "Total Price",
    "Order Date",
    "Menu Name",
    "Unit Price",
    "Quantity",
    "Item Total Price",
    "Category",
  ]);

  filteredOrders.value.forEach((order) => {
    order.details.forEach((detail) => {
      exportData.push([
        order.customer_name,
        order.paid,
        order.payment_method,
        order.total_price,
        formatDate(order.created_at),
        detail.menu_name,
        detail.menu_price,
        detail.quantity,
        detail.total_price,
        detail.category,
      ]);
    });
  });

  let csvContent = "";
  exportData.forEach((row) => {
    csvContent +=
      row
        .map((e) => {
          const val = String(e);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "order_history.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

onMounted(() => {
  fetchOrder();
  fetchCarts();
  selectedDateFilter.value = "today";
});
</script>

<template>
  <div class="p-6 flex flex-col gap-6 max-w-full container">
    <h1 class="text-[var(--text-secondary)] font-bold" style="font-size: 30px">
      Riwayat Pesanan
    </h1>
    <div v-if="isLoading" class="flex justify-center">
      <progressSpinner />
    </div>

    <div v-else class="flex flex-col gap-3">
      <section class="main-section overflow-x-auto flex flex-col gap-2">
        <h2>Pesanan yang belum dibayar:</h2>
        <div v-if="unpaidOrders.length === 0" class="text-white">
          <p>Tidak ada yang belum dibayar!</p>
        </div>
        <div v-else>
          <DataTable
            :value="unpaidOrders"
            class="w-full text-white"
            stripedRows
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]"
          >
            <Column field="customer_name" header="Nama pelanggan" class="p-3" />
            <Column header="Pesanan">
              <template #body="slotProps">
                <ul>
                  <li v-for="item in slotProps.data.items" :key="item.cart_id">
                    {{ item.menu_name }} ({{ item.quantity }}x) -
                    {{ formatCurrency(item.subtotal) }}
                    <span v-if="item.note"> (Catatan: {{ item.note }})</span>
                  </li>
                </ul>
              </template>
            </Column>
            <Column header="Total">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.total_unpaid_amount) }}
              </template>
            </Column>
          </DataTable>
          <RouterLink to="/order" class="text-white hover:text-white">
            <Button label="Check di sini!" class="mt-4 text-" />
          </RouterLink>
        </div>
      </section>

      <section class="main-section overflow-x-auto">
        <div class="flex justify-between mb-4">
          <Select
            v-model="selectedDateFilter"
            :options="dateFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter Tanggal"
            class="custom-select"
            @change="filterOrders"
          />

          <Button
            label="Cetak Struk Sesuai Filter"
            class="text-[--text-secondary]"
            @click="printFilteredOrders"
          />
        </div>

        <DataTable
          :value="filteredOrders"
          :expandedRows="expandedRows"
          paginator
          ref="dt"
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          @update:expandedRows="expandedRows = $event"
          dataKey="id"
          stripedRows
        >
          <template #header>
            <div class="flex flex-wrap justify-content-end gap-2">
              <Button
                text
                icon="pi pi-plus"
                label="Lebarkan semua"
                class="text-[var(--text-secondary)]"
                @click="expandAll"
              />
              <Button
                text
                icon="pi pi-minus"
                label="Kecilkan semua"
                class="text-[var(--text-secondary)]"
                @click="collapseAll"
              />
              <Button
                icon="pi pi-external-link"
                label="Export"
                class="text-[var(--text-secondary)]"
                @click="exportCSV()"
              />
            </div>
          </template>

          <Column expander icon="pi pi-chevron-right" style="width: 5rem" />
          <Column field="customer_name" header="Customer Name" />
          <Column field="paid" header="Paid">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.paid) }}
            </template>
          </Column>

          <template #expansion="slotProps">
            <div>
              <p>Pesanan dari {{ slotProps.data.customer_name }}</p>
              <DataTable :value="slotProps.data.details">
                <Column field="menu_name" header="Menu Name" />
                <Column field="menu_price" header="Harga Satuan">
                  <template #body="detailsSlotProps">
                    {{ formatCurrency(detailsSlotProps.data.menu_price) }}
                  </template>
                </Column>
                <Column field="quantity" header="Jumlah" />
                <Column field="total_price" header="Total">
                  <template #body="detailsSlotProps">
                    {{ formatCurrency(detailsSlotProps.data.total_price) }}
                  </template>
                </Column>
                <Column field="created_at" header="Tanggal Pesan">
                  <template #body="detailsSlotProps">
                    {{ formatDate(detailsSlotProps.data.created_at) }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
          <template #empty> Tidak ada Riwayat pesanan! </template>
        </DataTable>
        <span>
          *Peringatan: untuk performa yang optimal, ketika data yang ada sudah
          menyentuh 40 hari, maka akan secara otomatis terhapus. HARAP EXPORT
          data melalui tombol yang sudah disediakan.
        </span>
        <p>*terdapat logo expander di sebelah kiri nama pemesan</p>
      </section>
    </div>
    <iframe ref="printFrame" style="display: none"></iframe>
  </div>
</template>

<style scoped>
.button {
  background-color: transparent;
  border: 2px solid var(--sidebar-color);
  color: var(--sidebar-color);
}

.button:hover {
  background-color: var(--sidebar-color);
  color: #fff;
  transition: 0.3s;
}
</style>
