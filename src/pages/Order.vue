<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { supabase } from "../supabase";
import { ProgressSpinner, Textarea, useToast } from "primevue";
import { formatCurrency } from "../utils/formatter/currency";
import { jsPDF } from "jspdf";

const toast = useToast();
const orderedMenuIds = ref([]);
const cartItems = ref([]);
const paymethod = ref([]);
const selectedPaymentMethod = ref(null);
const paidAmount = ref();
const customer = ref("");
const isLoading = ref(false);
const isMessageVisible = ref(false);
const members = ref([]);
const selectedMember = ref(null);
const dialogVisible = ref(false);
const selectedMenu = ref({ id: null, quantity: "", note: "" });

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + item.quantity * item.menu_detail.price;
  }, 0);
});

const changeAmount = computed(() => {
  // Assuming that the ID for "Cash" is '1'. Replace it with the correct ID if needed.
  if (selectedPaymentMethod.value === 1) {
    // Adjust the ID for "Cash"
    return paidAmount.value - discountedTotalAmount.value;
  }
  return 0;
});

const fetchCarts = async () => {
  try {
    isLoading.value = true;
    const { data, error } = await supabase.from("cart").select(`
        id,
        menu_detail_id,
        quantity,
        note,
        menu_detail:menu_detail_id (
          id,
          menu_id (
            name,
            image,
            description
          ),
          variant_id (
            name
          ),
          price
        )
      `);

    if (error) throw error;

    orderedMenuIds.value = data.map((item) => item.menu_detail_id);
    cartItems.value = data;
    isLoading.value = false;
  } catch (error) {
    console.error("Error fetching cart:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchPay = async () => {
  try {
    isLoading.value = true;
    const { data, error } = await supabase.from("payment_method").select("*");
    if (error) throw error;
    paymethod.value = data.map((method) => ({
      label: method.name,
      value: method.id,
    }));
  } catch (error) {
    console.error("Error fetching payment method:", error);
  } finally {
    isLoading.value = false;
  }
};

const deleteCartItem = async (cartItemId) => {
  try {
    const { error } = await supabase.from("cart").delete().eq("id", cartItemId);

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Item deleted from cart successfully!",
      life: 3000,
    });

    // Refresh cart data
    await fetchCarts();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error deleting cart item:", error);
  }
};

watch(selectedMember, (newValue) => {
  if (newValue) {
    customer.value = newValue; // Update customer name when a member is selected
  } else {
    customer.value = ""; // Clear customer name if no member is selected
  }
});
const discountedTotalAmount = computed(() => {
  if (selectedMember.value) {
    return totalAmount.value * 0.9;
  }

  return totalAmount.value;
});

const finishOrder = async () => {
  try {
    if (!customer.value && !selectedMember.value) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Tolong masukkan nama pelanggan atau pilih member!",
        life: 9000,
      });
      return;
    }

    if (!discountedTotalAmount.value) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Tolong masukkan jumlah uang yang dibayar",
        life: 9000,
      });
      return;
    }
    if (paidAmount.value < discountedTotalAmount.value) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Uang pembayaran harus pas atau lebih dari total harga",
        life: 9000,
      });
      return;
    }

    const generatedOrderId = Date.now(); // Example of a unique numeric ID

    // Step 1: Insert a new order record into the 'order' table with the generated ID
    const { error: orderError } = await supabase.from("order").insert([
      {
        id: generatedOrderId, // Use the numeric ID here
        customer_name: customer.value || selectedMember.value || "Jane Doe",
        total_price: discountedTotalAmount.value,
        payment: selectedPaymentMethod.value,
        paid: paidAmount.value,
        change: changeAmount.value,
      },
    ]);

    if (orderError) {
      console.error("Error inserting order:", orderError);
      throw new Error(orderError.message);
    }

    console.log("Order inserted successfully with ID:", generatedOrderId);

    const orderDetails = cartItems.value.map((item) => ({
      order_id: generatedOrderId,
      menu_detail_id: item.menu_detail_id,
      quantity: item.quantity,
      note: item.note,
    }));

    const pageWidth = 80; // 80mm width
    const marginLeft = 8;
    let currentY = 8;
    let estimatedHeight = 100; // Initial height, adjust as needed

    cartItems.value.forEach((item) => {
      estimatedHeight += 6;
      if (item.note && item.note.trim()) {
        estimatedHeight += 3;
      }
    });

    estimatedHeight += 30;
    const doc = new jsPDF({
      unit: "mm",
      format: [pageWidth, estimatedHeight],
    });

    const centerX = pageWidth / 2;
    // Title
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Artisan Beverage Studio", centerX, currentY, {
      align: "center",
    });
    currentY += 3;
    doc.setFontSize(5);
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

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${customer.value}`, marginLeft, currentY);
    currentY += 4;
    doc.text(`Order ID: ${generatedOrderId}`, marginLeft, currentY);
    currentY += 4;
    doc.text(`Date: ${formattedDate}`, marginLeft, currentY);

    currentY += 8;

    doc.setFont("helvetica", "bold");
    doc.text("No", marginLeft, currentY);
    doc.text("Menu", marginLeft + 6, currentY);
    doc.text("Price", marginLeft + 40, currentY);
    doc.text("Qty", marginLeft + 62, currentY, { align: "right" });
    currentY += 5;

    cartItems.value.forEach((item, index) => {
      const subtotal = item.quantity * item.menu_detail.price;
      doc.setFont("helvetica", "normal");
      doc.text(`${index + 1}`, marginLeft, currentY);
      const menuName = item.menu_detail.menu_id.name;
      const wrappedMenuName = doc.splitTextToSize(
        menuName,
        pageWidth - marginLeft * 2 - 10
      ); // Adjust width as needed
      doc.setFontSize(7);
      doc.text(wrappedMenuName, marginLeft + 6, currentY);
      doc.setFontSize(8);
      doc.text(
        `${formatCurrency(item.menu_detail.price)}`,
        marginLeft + 40,
        currentY
      );
      doc.text(`${item.quantity}`, marginLeft + 62, currentY, {
        align: "right",
      });
      currentY += 4 + (wrappedMenuName.length - 1) * 4;

      // note pesanan
      if (item.note && item.note.trim()) {
        doc.setFontSize(6);
        doc.setFont("helvetica", "italic");
        doc.text(`*${item.note}`, marginLeft + 10, currentY);
        currentY += 3;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
      }
    });

    // Garis pembatas
    currentY += 4;
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
    currentY += 6;

    // Total amount and payment details
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total: ${formatCurrency(discountedTotalAmount.value)}`,
      marginLeft,
      currentY
    );
    currentY += 4;
    doc.text(
      `Payment Method: ${
        paymethod.value.find(
          (method) => method.value === selectedPaymentMethod.value
        )?.label || "Unknown"
      }`,
      marginLeft,
      currentY
    );
    currentY += 4;
    doc.text(`Paid: ${formatCurrency(paidAmount.value)}`, marginLeft, currentY);
    currentY += 4;
    doc.text(
      `Change: ${formatCurrency(changeAmount.value)}`,
      marginLeft,
      currentY
    );
    currentY += 8;

    // Footer
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Thank you for your purchase!  We truly appreciate your support",
      centerX,
      currentY,
      {
        align: "center",
      }
    );
    currentY += 4;
    doc.text(
      "We hope you enjoy your product and have a great experience!",
      centerX,
      currentY,
      {
        align: "center",
      }
    );
    currentY += 4;
    doc.text("Visit us again!", centerX, currentY, { align: "center" });

    //SAVE PDF
    doc.save(`order_${generatedOrderId}.pdf`);
    const { error: orderDetailsError } = await supabase
      .from("order_detail")
      .insert(orderDetails);

    if (orderDetailsError) {
      console.error("Error inserting order details:", orderDetailsError);
      throw new Error(orderDetailsError.message);
    }

    // Delete all cart items after successful order creation and PDF
    const { error: deleteError } = await supabase
      .from("cart")
      .delete()
      .in(
        "id",
        cartItems.value.map((item) => item.id)
      );

    if (deleteError) {
      console.error("Error deleting cart items:", deleteError);
      throw new Error(deleteError.message);
    }

    toast.add({
      severity: "success",
      summary: "Order Finished",
      detail: "Your order has been successfully placed!",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error finishing order:", error);
  }
};

const fetchMember = async () => {
  try {
    let { data: membership, error } = await supabase
      .from("membership")
      .select(`nama`);
    if (error) throw error;
    members.value = membership;
  } catch (error) {
    console.log("error fetching order:", error);
  }
};

const fetchMenuById = async (id) => {
  dialogVisible.value = true;
  try {
    isLoading.value = true;
    const { data, error } = await supabase
      .from("cart")
      .select("id, quantity, note")
      .eq("id", id)
      .single();

    if (error) throw error;

    selectedMenu.value = data;
  } catch (error) {
    console.error("Error fetching category:", error.message);
  } finally {
    isLoading.value = false;
  }
};

const updateMenu = async () => {
  try {
    const { id, note, quantity } = selectedMenu.value;

    if (!id) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ID Menu tidak valid",
        life: 5000,
      });
      return;
    }

    const trimmedNote = note.trim();

    if (
      quantity === null ||
      quantity === undefined ||
      isNaN(quantity) ||
      quantity <= 0
    ) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Kuantitas harus lebih dari 0",
        life: 5000,
      });
      return;
    }

    const { error } = await supabase
      .from("cart")
      .update({ quantity: quantity, note: trimmedNote })
      .eq("id", id);

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: "Pesanan berhasil diperbarui!",
      life: 5000,
    });

    await fetchCarts();
    dialogVisible.value = false;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error updating member:", error);
  }
};

watch(selectedPaymentMethod, (newValue) => {
  if (newValue === 2) {
    // QRIS
    paidAmount.value = discountedTotalAmount.value + 1000; // Pajak QRIS
  } else {
    paidAmount.value = "";
  }
});

onMounted(() => {
  fetchCarts();
  fetchPay();
  fetchMember();
});

const toggleMessage = () => {
  isMessageVisible.value = !isMessageVisible.value;
  if (!isMessageVisible.value) {
    selectedMember.value = null;
  }
};

const buttonLabel = computed(() => {
  return selectedMember.value ? "Belum Ada Member?" : " Ada Member?";
});
</script>

<template>
  <div v-if="isLoading">
    <ProgressSpinner />
  </div>
  <div v-else>
    <section class="p-5">
      <section class="main-section">
        <h1 class="text-xl font-bold text-white mb-4">Order Details</h1>
        <div class="flex flex-col gap-10">
          <div class="flex flex-row gap-5">
            <InputText
              v-if="!isMessageVisible"
              v-model="customer"
              placeholder="Nama Customer"
              class="custom-input max-w-fit"
            />

            <Button
              :label="buttonLabel"
              class="custom-button max-w-fit"
              @click="toggleMessage"
            />
            <Select
              v-show="isMessageVisible"
              v-model="selectedMember"
              filter
              :options="members"
              option-value="nama"
              option-label="nama"
              placeholder="Pilih Member"
              class="custom-select p-select w-full md:w-56 font-bold"
            />
          </div>

          <DataTable
            :value="cartItems"
            class="w-full text-white rounded-lg overflow-hidden"
            stripedRows
            showGridlines
          >
            <Column
              field="menu_detail.menu_id.name"
              header="Menu"
              class="p-3"
            />
            <Column
              field="menu_detail.variant_id.name"
              header="Variant"
              class="p-3"
            />
            <Column
              field="menu_detail.price"
              header="Price"
              class="p-3"
              :body="formatCurrency"
            />
            <Column field="quantity" header="Quantity" class="p-3" />
            <Column
              field="note"
              header="Note"
              class="p-3"
              :body="(item) => item.note || '-'"
            />
            <Column header="Action" class="p-3">
              <template #body="slotProps">
                <div class="flex flex-row gap-2">
                  <Button
                    label="Edit"
                    icon="fa-solid fa-pencil"
                    severity="edit"
                    @click="fetchMenuById(slotProps.data.id)"
                  />
                  <Button
                    label="Delete"
                    icon="fa-solid fa-trash"
                    severity="danger"
                    @click="deleteCartItem(slotProps.data.id)"
                  />
                </div>
              </template>
            </Column>
            <template #empty> Tidak ada Pesanan! Silahkan pesan </template>
          </DataTable>
        </div>
        <div class="container mt-2">
          <RouterLink to="/">
            <Button
              label="Tambah menu lainnya"
              icon="fa-solid fa-plus"
              class="custom-button"
              severity="save"
            />
          </RouterLink>
          <div class="flex gap-2 justify-between mt-2">
            <Select
              id="payment-method"
              v-model="selectedPaymentMethod"
              :options="paymethod"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Payment Method"
              class="custom-select"
            />
            <div class="flex gap-2">
              <h2>Total:</h2>
              <h2 class="text-white">
                {{ formatCurrency(discountedTotalAmount) }}
              </h2>
            </div>
          </div>
          <!-- Show input number and calculated change if 'Cash' is selected -->
          <div
            v-if="selectedPaymentMethod === 1 || selectedPaymentMethod === 2"
            class="mt-4 flex justify-between"
          >
            <!-- Show InputNumber for 'Cash' (selectedPaymentMethod === 1) and 'QRIS' (selectedPaymentMethod === 2) -->

            <InputNumber
              v-model="paidAmount"
              placeholder="Masukkan Nominal Uang"
              :value="paidAmount"
              :disabled="selectedPaymentMethod === 2"
              :min="0"
              mode="currency"
              currency="IDR"
            />

            <div v-if="paidAmount > 0 && selectedPaymentMethod === 1">
              <h2 class="text-black mt-2">
                Change: {{ formatCurrency(changeAmount) }}
              </h2>
            </div>

            <!-- No change for QRIS -->
            <div v-if="selectedPaymentMethod === 2">
              <h2 class="text-black mt-2">Change: {{ formatCurrency(0) }}</h2>
            </div>
          </div>
        </div>
      </section>
      <div class="flex justify-end mt-5">
        <Button
          label="Finish Order"
          icon="fa-solid fa-check"
          class="button33 custom-button"
          severity="save"
          @click="finishOrder"
        />
      </div>
    </section>
  </div>
  <Dialog
    v-model:visible="dialogVisible"
    header="Edit Pesanan"
    :modal="true"
    :closable="true"
    class="w-400px"
  >
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else>
      <div class="flex flex-col">
        <label for="editjumlah">Quantity</label>
        <InputNumber
          v-model="selectedMenu.quantity"
          :min="0"
          :max="500"
          id="editjumlah"
          class="custom-number"
          placeholder="Masukkan jumlah"
        />
      </div>
      <div class="mt-3 flex flex-col">
        <label for="editNoTelp">Note</label>
        <Textarea
          v-model="selectedMenu.note"
          id="editNoTelp"
          placeholder="Note"
        />
      </div>
      <div class="mt-4 flex justify-end">
        <Button
          label="Update"
          icon="fa fa-check"
          class="p-button-rounded p-button-success"
          @click="updateMenu(selectedMenu?.id)"
        />
      </div>
    </div>
  </Dialog>
  <Toast />
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
