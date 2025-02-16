<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";
import { formatCurrency } from "../utils/formatter/currency";
import jsPDF from "jspdf";

const expandedRows = ref([]);
const order = ref([]);
const isLoading = ref(false);
const filteredOrders = ref([]);
const selectedDateFilter = ref(null);

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
          category: category, // Add category to details
        });
      } else {
        acc.push({
          id: item.order_id.id,
          customer_name: item.order_id.customer_name,
          paid: item.order_id.paid,
          payment_method: item.order_id.payment.name,
          details: [
            {
              menu_name: menuName,
              menu_price: menuPrice,
              quantity: item.quantity,
              total_price: totalPrice,
              created_at: item.order_id.created_at,
              category: category, // Add category to details
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
    filteredOrders.value = order.value;
  }
};

const filterOrders = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  if (selectedDateFilter.value === "today") {
    filteredOrders.value = order.value.filter((order) => {
      const orderDate = new Date(order.details[0].created_at);
      return orderDate.toDateString() === today.toDateString();
    });
  } else if (selectedDateFilter.value === "last7days") {
    filteredOrders.value = order.value.filter((order) => {
      const orderDate = new Date(order.details[0].created_at);
      return orderDate >= sevenDaysAgo && orderDate <= today;
    });
  } else if (selectedDateFilter.value === "thisMonth") {
    filteredOrders.value = order.value.filter((order) => {
      const orderDate = new Date(order.details[0].created_at);
      return orderDate >= firstDayOfMonth && orderDate <= today;
    });
  } else {
    filteredOrders.value = order.value;
  }
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
  expandedRows.value = order.value.reduce(
    (acc, p) => (acc[p.id] = true) && acc,
    {}
  );
};

const collapseAll = () => {
  expandedRows.value = [];
};

// Download Struk
const downloadPDF = () => {
  const pageWidth = 58;
  const marginLeft = 5;
  let currentY = 8;
  let estimatedHeight = 100;

  filteredOrders.value.forEach((order) => {
    order.details.forEach((detail) => {
      estimatedHeight += 6;
      if (detail.note && detail.note.trim()) {
        estimatedHeight += 3;
      }
    });
  });

  const doc = new jsPDF({
    unit: "mm",
    format: [pageWidth, estimatedHeight],
  });

  const centerX = pageWidth / 2;

  // Title
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const title = "Artisan Beverage Studio";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, currentY);
  currentY += 3;

  // Address
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  const addressText =
    "Jl. Kota Taman Metropolitan, Cileungsi Kidul, Kec. Cileungsi, Kabupaten Bogor, Jawa Barat 16820";
  const addressLines = doc.splitTextToSize(
    addressText,
    pageWidth - marginLeft * 2
  );
  doc.text(addressLines, centerX, currentY, { align: "center" });
  currentY += addressLines.length * 2;

  // Separator line
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
  currentY += 4;

  // Customer details
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(now);

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${formattedDate}`, marginLeft, currentY);
  currentY += 8;

  // Table Header
  doc.setFont("helvetica", "bold");
  doc.text("Name", marginLeft, currentY);
  doc.text("Menu", marginLeft + 10, currentY);
  doc.text("Price", marginLeft + 30, currentY);
  doc.text("Qty", marginLeft + 45, currentY, { align: "right" });
  currentY += 5;

  // Total sold by category
  const totalSoldByCategory = {};
  const totalSoldByMenu = {};

  // Table Body
  filteredOrders.value.forEach((order) => {
    order.details.forEach((detail) => {
      const categoryName = detail.category;

      // Update total sold by category
      totalSoldByCategory[categoryName] =
        (totalSoldByCategory[categoryName] || 0) + detail.quantity;

      const menuName = detail.menu_name;

      totalSoldByMenu[menuName] =
        (totalSoldByMenu[menuName] || 0) + detail.quantity;

      doc.setFont("helvetica", "normal");
      doc.text(order.customer_name || "Unknown", marginLeft, currentY);
      doc.setFontSize(5);
      doc.text(detail.menu_name || "Unknown", marginLeft + 10, currentY);
      doc.setFontSize(6);
      doc.text(
        formatCurrency(detail.menu_price) || "0",
        marginLeft + 30,
        currentY
      );
      doc.text(detail.quantity.toString() || "0", marginLeft + 45, currentY, {
        align: "right",
      });
      currentY += 4;

      // Note
      if (detail.note && detail.note.trim()) {
        doc.setFontSize(5);
        doc.setFont("helvetica", "italic");
        doc.text(`*${detail.note}`, marginLeft + 10, currentY);
        currentY += 3;
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
      }
    });
  });

  // Separator line
  currentY += 4;
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
  currentY += 6;

  // Total amount
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  const totalAmount = filteredOrders.value.reduce((sum, order) => {
    return (
      sum +
      order.details.reduce((subSum, detail) => subSum + detail.total_price, 0)
    );
  }, 0);
  doc.text(`Total: ${formatCurrency(totalAmount)}`, marginLeft, currentY);
  currentY += 4;

  // Total Category yang di pesan
  doc.setFont("helvetica", "normal");
  for (const [category, quantity] of Object.entries(totalSoldByCategory)) {
    doc.text(`Total ${category} sold: ${quantity}`, marginLeft, currentY);
    currentY += 4;
  }
  currentY += 4;
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
  currentY += 4;

  // Total Category yang di pesan
  doc.setFont("helvetica", "normal");
  for (const [menu, quantity] of Object.entries(totalSoldByMenu)) {
    doc.text(`Total ${menu} sold: ${quantity}`, marginLeft, currentY);
    currentY += 4;
  }

  // Download PDF
  doc.save(`order_${Date.now()}.pdf`);
};

onMounted(fetchOrder);
</script>

<template>
  <div class="p-6 flex flex-col gap-6 max-w-full container">
    <h1 class="text-[var(--text-secondary)] font-bold" style="font-size: 30px">
      Riwayat Pesanan
    </h1>
    <div v-if="isLoading" class="flex justify-center">
      <progressSpinner />
    </div>

    <div v-else>
      <section class="main-section overflow-x-auto">
        <div class="flex justify-between mb-4">
          <Select
            v-model="selectedDateFilter"
            :options="dateFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Date Filter"
            class="custom-select"
            @change="filterOrders"
          />

          <Button
            label="Download PDF"
            class="text-[--text-secondary]"
            @click="downloadPDF"
          />
        </div>

        <DataTable
          :value="filteredOrders"
          :expandedRows="expandedRows"
          paginator
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          @update:expandedRows="expandedRows = $event"
          dataKey="id"
          stripedRows
        >
          <!-- Row Expander -->

          <template #header>
            <div class="flex flex-wrap justify-content-end gap-2">
              <Button
                text
                icon="pi pi-plus"
                label="Expand All"
                class="text-[var(--text-secondary)]"
                @click="expandAll"
              />

              <Button
                text
                icon="pi pi-minus"
                label="Collapse All"
                class="text-[var(--text-secondary)]"
                @click="collapseAll"
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

          <!-- Expanded Content -->
          <template #expansion="slotProps">
            <div>
              <p>An order from {{ slotProps.data.customer_name }}</p>
              <DataTable :value="slotProps.data.details">
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
                <Column field="created_at" header="Order Date">
                  <template #body="detailsSlotProps">
                    {{ formatDate(detailsSlotProps.data.created_at) }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
          <template #empty> Tidak ada Riwayat pesanan! </template>
        </DataTable>
      </section>
    </div>
  </div>
</template>
