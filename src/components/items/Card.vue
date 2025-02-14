<script setup>
import { ref, onMounted } from "vue";
import { useToast, Card } from "primevue";
import { supabase } from "../../supabase";
import { formatCurrency } from "../../utils/formatter/currency";

const toast = useToast();
const visible = ref(false);
const selectedMenu = ref(null);
const quantity = ref(1);
const selectedVariant = ref(null);
const note = ref("");
const customerName = ref("");
const selectedCustomer = ref(null);
const customers = ref([]);
const cartItems = ref([]);
const { menuList } = defineProps(["menuList"]);

const fetchCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from("customer")
      .select("id, customer");
    if (error) throw error;
    customers.value = data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  }
};

const fetchCart = async () => {
  try {
    const { data, error } = await supabase.from("cart").select(`
        id,
        menu_detail_id,
        quantity,
        note,
        customer_id,
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

    cartItems.value = data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  }
};

// Open the dialog for ordering
const openDialog = (menu) => {
  selectedMenu.value = menu;
  selectedVariant.value = null;
  note.value = "";
  visible.value = true;
};

const saveOrder = async () => {
  if (!selectedMenu.value || !selectedVariant.value) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Please select a menu and variant.",
      life: 3000,
    });
    return;
  }

  try {
    let customerId = null;

    // Check if a new customer name is provided
    if (customerName.value.trim() !== "") {
      // Insert the new customer into the customer table
      const { data: newCustomer, error: insertError } = await supabase
        .from("customer")
        .insert([{ customer: customerName.value }])
        .select(); // Use .select() to return the inserted row

      // Check for insertion error
      if (insertError) {
        console.error("Error inserting new customer:", insertError);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: `Gagal memasukkan pelanggan baru: ${insertError.message}`,
          life: 3000,
        });
        return; // Exit the function if there's an error
      }

      // Get the new customer ID
      customerId = newCustomer[0].id; // Access the first element of the array
    } else if (selectedCustomer.value) {
      // Use the selected customer ID if no new name is provided
      customerId = selectedCustomer.value.id;
    } else {
      // If no customer is provided, show a warning
      toast.add({
        severity: "warn",
        summary: "Warning",
        detail: "Tolong pilih atau masukkan nama pelanggan.",
        life: 3000,
      });
      return;
    }

    // Prepare the payload for the cart insertion
    const payload = {
      menu_detail_id: selectedVariant.value.id,
      quantity: quantity.value,
      note: note.value.trim(),
      customer_id: customerId,
    };

    const { error } = await supabase.from("cart").insert(payload);

    if (error) {
      console.error("Error inserting into cart:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: `Gagal memasukkan ke keranjaang: ${error.message}`,
        life: 3000,
      });
      return; // Exit the function if there's an error
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Pesanan berhasil dimasukkan ke keranjang!",
      life: 3000,
    });

    // Refresh cart data
    await fetchCart();
    selectedCustomer.value = null;
    visible.value = false;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
  }
};
onMounted(() => {
  fetchCustomers();
  fetchCart();
});
</script>

<template>
  <section class="flex flex-col m-4">
    <div
      class="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
    >
      <Card
        v-for="menu in menuList"
        :key="menu.name"
        class="menu flex flex-col p-0 rounded-lg drop-shadow-xl"
      >
        <template #header>
          <img
            :alt="menu.name || 'Menu Image'"
            :src="menu.image || 'placeholder.jpg'"
            class="img-menu object-cover w-full h-48 rounded-t-lg border-none"
          />
        </template>
        <template #title>
          <h3 class="text-xl capitalize font-bold">
            {{ menu.name || "No Name" }}
          </h3>
        </template>
        <template #content>
          <template v-if="menu.menu_detail.length">
            <template v-for="detail in menu.menu_detail" :key="detail.id">
              <h4 class="mb-2 text-sm text-slate-400">
                {{ detail.menu_variants?.name || "No Variant" }}:
                {{ formatCurrency(detail.price) || "N/A" }}
              </h4>
            </template>
          </template>
          <p class="desc">
            {{ menu.description || "Tidak ada deskripsi." }}
          </p>
        </template>
        <template #footer>
          <div class="flex items-center">
            <Button
              label="Pesan"
              class="button w-full"
              @click="openDialog(menu)"
            />
          </div>
        </template>
      </Card>
    </div>
  </section>

  <!-- Dialog to Order -->
  <Dialog
    v-model:visible="visible"
    modal
    :header="`Order ${selectedMenu?.name}`"
    :style="{ width: '25rem' }"
  >
    <div class="flex flex-col gap-4">
      <InputText
        v-model="customerName"
        placeholder="Masukkan nama pelanggan baru"
        class="text-[var(--text-secondary)]"
        label="Customer Name"
      />
      <Select
        v-model="selectedCustomer"
        :options="customers"
        optionLabel="customer"
        placeholder="Pilih pelanggan yang sudah ada"
        class="custom-select"
      />
      <Select
        v-model="selectedVariant"
        :options="selectedMenu?.menu_detail"
        class="custom-select"
        optionLabel="menu_variants.name"
        placeholder="Choose a variant"
      />
      <InputNumber
        v-model="quantity"
        :min="1"
        :max="500"
        placeholder="Quantity"
        label="Quantity"
      />
      <Textarea v-model="note" rows="3" cols="30" placeholder="Add a note" />
    </div>

    <div class="flex justify-end mt-4 gap-2">
      <Button
        type="button"
        label="Cancel"
        icon="fa-solid fa-x-mark"
        severity="secondary"
        @click="visible = false"
      />
      <Button
        type="button"
        label="Save Order"
        icon="fa-solid fa-check"
        severity="success"
        @click="saveOrder"
      />
    </div>
  </Dialog>
</template>

<style scoped>
.button {
  background-color: transparent;
  border: 2px solid var(--btn-order);
  color: var(--btn-order);
  margin-top: 0;
}
</style>
