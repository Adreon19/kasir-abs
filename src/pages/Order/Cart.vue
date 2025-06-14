<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../../supabase";
import { ProgressSpinner, Textarea, useToast } from "primevue";
import { formatCurrency } from "../../utils/formatter/currency";
import { printReceipt } from "../../utils/receiptPrinter"; // Import the new function

const toast = useToast();
const nama = ref("");
const cartItems = ref([]);
const paymethod = ref([]);
const selectedPaymentMethod = ref(null);
const paidAmount = ref(0);
const isLoading = ref(false);
const dialogVisible = ref(false);
const selectedMenu = ref({ id: null, quantity: "", note: "" });
const customerName = ref("");
const route = useRoute();
const router = useRouter();
const customerId = route.query.customerId;
const printFrame = ref(null);
const isPrinted = ref(false);

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + item.quantity * item.menu_detail.price;
  }, 0);
});
const changeAmount = computed(() => {
  if (selectedPaymentMethod.value === 1) {
    return paidAmount.value - totalAmount.value;
  }
  return 0;
});

const fetchCarts = async () => {
  try {
    isLoading.value = true;

    const { data, error } = await supabase
      .from("cart")
      .select(
        `
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
      `
      )
      .eq("customer_id", customerId);

    if (error) throw error;

    cartItems.value = data;

    const { data: customerData, error: customerError } = await supabase
      .from("customer")
      .select("customer")
      .eq("id", customerId)
      .single();

    if (customerError) throw customerError;

    customerName.value = customerData.customer;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
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

    await fetchCarts();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  }
};

const fetchUserData = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;

    if (user) {
      const { data, error: userError } = await supabase
        .from("user")
        .select("name")
        .eq("email", user.email)
        .single();

      if (userError) throw userError;

      if (data) {
        nama.value = data.name;
        console.log("Fetched name:", nama.value);
      } else {
        console.log("No user data found.");
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const handlePrintReceipt = async () => {
  const receiptData = cartItems.value.map((item) => ({
    name: item.menu_detail.menu_id.name,
    qty: item.quantity,
    price: item.menu_detail.price,
    note: item.note || "",
  }));

  const paymentMethodLabel =
    paymethod.value.find(
      (method) => method.value === selectedPaymentMethod.value
    )?.label || "Unknown";

  const receiptInfo = {
    cashier: nama.value,
    customer: customerName.value,
    total: totalAmount.value,
    paid: paidAmount.value || 0,
    change: changeAmount.value || 0,
    paymentMethodLabel: paymentMethodLabel,
    items: receiptData,
  };

  try {
    await printReceipt(receiptInfo, printFrame.value);
    isPrinted.value = true;
  } catch (error) {
    console.error("Error printing receipt:", error);
    toast.add({
      severity: "error",
      summary: "Error Printing",
      detail: "Failed to print receipt.",
      life: 3000,
    });
  }
};

const finishOrder = async () => {
  try {
    if (!selectedPaymentMethod.value) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Silakan pilih metode pembayaran terlebih dahulu.",
        life: 3000,
      });
      return;
    }

    if (paidAmount.value < totalAmount.value) {
      toast.add({
        severity: "warn",
        summary: "Warning",
        detail: "Uang yang dibayar harus lebih atau sama dari total harga",
        life: 9000,
      });
      return;
    }

    if (!isPrinted.value) {
      alert("Harap cetak struk terlebih dahulu!");
      return;
    }
    isLoading.value = true;
    const generatedOrderId = Date.now();

    const { error: orderError } = await supabase.from("order").insert([
      {
        id: generatedOrderId,
        customer_name: customerName.value,
        total_price: totalAmount.value,
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

    const { error: orderDetailsError } = await supabase
      .from("order_detail")
      .insert(orderDetails);

    if (orderDetailsError) {
      console.error("Error inserting order details:", orderDetailsError);
      throw new Error(orderDetailsError.message);
    }

    const { error: deleteError } = await supabase
      .from("cart")
      .delete()
      .in(
        "id",
        cartItems.value.map((item) => item.id)
      );

    cartItems.value = [];
    paidAmount.value = null;
    isLoading.value = true;

    if (deleteError) {
      console.error("Error deleting cart items:", deleteError);
      throw new Error(deleteError.message);
    }

    const { error: deleteCustomerError } = await supabase
      .from("customer")
      .delete()
      .eq("id", customerId);
    if (deleteCustomerError) {
      console.error("Error deleting customer:", deleteCustomerError);
      throw new Error(deleteCustomerError.message);
    }

    toast.add({
      severity: "success",
      summary: "Order Finished",
      detail: "Pesananmu sudah berhasil dipasang!",
      life: 3000,
    });
    router.push("/order");
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error finishing order:", error);
  } finally {
    isLoading.value = false; // Ensure loading state is reset
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
        detail: "Invalid Menu ID",
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
        summary: "Warning",
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
      summary: "Success",
      detail: "Pesana berhasil diupdate!",
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
    console.error("Error updating menu:", error);
  }
};

watch(selectedPaymentMethod, (newValue) => {
  if (newValue === 2) {
    // QRIS
    paidAmount.value = totalAmount.value + 1000;
  } else if (newValue === 3) {
    // TRANSFER
    paidAmount.value = totalAmount.value;
  } else {
    paidAmount.value = null;
  }
});

onMounted(() => {
  fetchCarts();
  fetchPay();
  fetchUserData();
});
</script>

<template>
  <div v-if="isLoading" class="flex justify-center">
    <ProgressSpinner />
  </div>
  <div v-else>
    <div class="main-section mt-24">
      <h1 class="text-xl font-bold text-white mb-4">Detail Pesanan</h1>
      <div class="flex flex-col md:gap-2 xl:gap-2">
        <label for="customer"> Nama Pembeli </label>
        <InputText
          v-model="customerName"
          placeholder="Nama Pembeli"
          class="custom-input max-w-fit"
          disabled
        />
      </div>
      <div
        class="w-full overflow-x-auto md:overflow-x-visible xl:overflow-x-visible"
      >
        <div class="max-w-[350px] md:max-w-full xl:max-w-full">
          <DataTable
            :value="cartItems"
            class="w-full text-white rounded-lg"
            stripedRows
          >
            <Column
              field="menu_detail.menu_id.name"
              header="Menu"
              class="p-3"
            />
            <Column
              field="menu_detail.variant_id.name"
              header="Varian"
              class="p-3"
            />
            <Column
              field="menu_detail.price"
              header="Harga"
              class="p-3"
              :body="formatCurrency"
            />
            <Column field="quantity" header="Kuantitas" class="p-3" />
            <Column
              field="note"
              header="Catatan"
              class="p-3"
              :body="(item) => item.note || '-'"
            />
            <Column header="Aksi" class="p-3">
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
            placeholder="Pilih Metode Pembayaran"
            class="custom-select text-[var(--text-secondary)]"
          />
          <div class="flex gap-2 items-center">
            <h2 class="text-sm md:text-xl xl:text-xl">Total:</h2>
            <h2 class="text-white text-sm md:text-xl xl:text-xl">
              {{ formatCurrency(totalAmount) }}
            </h2>
          </div>
        </div>
        <div
          v-if="
            selectedPaymentMethod === 1 ||
            selectedPaymentMethod === 2 ||
            selectedPaymentMethod === 3
          "
          class="mt-4 flex justify-between"
        >
          <InputNumber
            v-model="paidAmount"
            placeholder="Masukkan Nominal Uang"
            :value="paidAmount"
            :disabled="
              selectedPaymentMethod === 2 || selectedPaymentMethod === 3
            "
            :min="0"
            mode="currency"
            currency="IDR"
            class="text-[var(--text-secondary)]"
          />

          <div v-if="paidAmount > 0 && selectedPaymentMethod === 1">
            <h2 class="text-white mt-2 text-sm md:text-xl xl:text-xl">
              Change: {{ formatCurrency(changeAmount) }}
            </h2>
          </div>
          <div v-if="selectedPaymentMethod === 2">
            <h2 class="text-white mt-2">Change: {{ formatCurrency(0) }}</h2>
          </div>
        </div>
      </div>
      <div class="flex justify-start mt-5 gap-3">
        <Button
          label="Cetak Struk"
          icon="fa-solid fa-print"
          class="button33 custom-button"
          severity="save"
          @click="handlePrintReceipt"
        />
        <Button
          label="Tutup Pesanan"
          icon="fa-solid fa-check"
          class="button33 custom-button"
          severity="save"
          @click="finishOrder"
        />
      </div>
    </div>

    <iframe ref="printFrame" style="display: none"></iframe>

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
          <label for="editjumlah" class="text-[var(--text-primary)]"
            >Kuantitas</label
          >
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
          <label for="editNoTelp" class="text-[var(--text-primary)]"
            >Note</label
          >
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
