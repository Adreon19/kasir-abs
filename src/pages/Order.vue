<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { supabase } from "../supabase";
import { useToast } from "primevue";
import { formatCurrency } from "../utils/formatter/currency";

const toast = useToast();
const orderedMenuIds = ref([]);
const cartItems = ref([]);
const paymethod = ref([]);
const selectedPaymentMethod = ref(null);
const paidAmount = ref(0);
const customer = ref("");

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + item.quantity * item.menu_detail.price;
  }, 0);
});

const changeAmount = computed(() => {
  // Assuming that the ID for "Cash" is '1'. Replace it with the correct ID if needed.
  if (selectedPaymentMethod.value === 1) {
    // Adjust the ID for "Cash"
    return paidAmount.value - totalAmount.value;
  }
  return 0;
});

const fetchCarts = async () => {
  try {
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
  } catch (error) {
    console.error("Error fetching cart:", error);
  }
};

const fetchPay = async () => {
  try {
    const { data, error } = await supabase.from("payment_method").select("*");
    if (error) throw error;
    paymethod.value = data.map((method) => ({
      label: method.name,
      value: method.id,
    }));
  } catch (error) {
    console.error("Error fetching payment method:", error);
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

const finishOrder = async () => {
  try {
    const generatedOrderId = Date.now(); // Example of a unique numeric ID

    // Step 1: Insert a new order record into the 'order' table with the generated ID
    const { error: orderError } = await supabase.from("order").insert([
      {
        id: generatedOrderId, // Use the numeric ID here
        customer_name: customer.value,
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

    // Step 2: Insert order details for each cart item using the same generatedOrderId
    const orderDetails = cartItems.value.map((item) => ({
      order_id: generatedOrderId, // Use the same numeric ID
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

    // Step 3: Delete all cart items after successful order creation
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

    cartItems.value = [];
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

watch(selectedPaymentMethod, (newValue) => {
  if (newValue === 2) {
    paidAmount.value = totalAmount.value; // Set paidAmount to totalAmount for QRIS
  } else if (newValue !== 2) {
    paidAmount.value = 0;
  }
});

onMounted(() => {
  fetchCarts();
  fetchPay();
});
</script>

<template>
  <section class="p-5">
    <section class="main-section">
      <h1 class="text-xl font-bold text-white mb-4">Order Details</h1>
      <div class="flex flex-col gap-10">
        <InputText
          v-model="customer"
          placeholder="Nama Customer"
          class="max-w-fit"
        />
        <table class="w-full bg-white text-black rounded-lg overflow-hidden">
          <thead class="bg-gray-200">
            <tr>
              <th class="p-3">Menu</th>
              <th class="p-3">Variant</th>
              <th class="p-3">Price</th>
              <th class="p-3">Quantity</th>
              <th class="p-3">Note</th>
              <th class="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in cartItems" :key="index">
              <td class="p-3">{{ item.menu_detail.menu_id.name }}</td>
              <td class="p-3">{{ item.menu_detail.variant_id.name }}</td>
              <td class="p-3">{{ formatCurrency(item.menu_detail.price) }}</td>
              <td class="p-3">{{ item.quantity }}</td>
              <td class="p-3">{{ item.note || "-" }}</td>
              <td class="p-3 flex flex-row gap-2">
                <Button
                  label="Edit"
                  icon="fa-solid fa-pencil"
                  severity="edit"
                />
                <Button
                  label="Delete"
                  icon="fa-solid fa-trash"
                  severity="danger"
                  @click="deleteCartItem(item.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="container mt-2">
        <RouterLink to="/">
          <Button
            label="Tambah menu lainnya"
            icon="fa-solid fa-plus"
            class="button"
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
          />
          <div class="flex gap-2">
            <h2>Total:</h2>
            <h2 class="text-black">{{ formatCurrency(totalAmount) }}</h2>
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
            placeholder="Enter Paid Amount"
            :min="totalAmount"
            :value="selectedPaymentMethod === 2 ? totalAmount : paidAmount"
            :disabled="selectedPaymentMethod === 2"
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
        class="button"
        severity="save"
        @click="finishOrder"
      />
      <Toast />
    </div>
  </section>
</template>

<style scoped>
table {
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 8px;
}

th {
  background-color: #f4f4f4;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f1f1f1;
}
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
