<script setup>
import { ref, onMounted } from "vue";
import { useToast, Card } from "primevue";
import { supabase } from "../../supabase";
import { formatCurrency } from "../../utils/formatter/currency";

const toast = useToast();
const isLoading = ref(false);
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
        ),
        timestamp
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
const openDialog = menu => {
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
      detail: "Tolong pilih salah satu menu atau varian.",
      life: 3000,
    });
    return;
  }

  try {
    isLoading.value = true;
    let customerId = null;

    if (customerName.value.trim() !== "") {
      const { data: newCustomer, error: insertError } = await supabase
        .from("customer")
        .insert([{ customer: customerName.value }])
        .select();

      // Check for insertion error
      if (insertError) {
        console.error("Error inserting new customer:", insertError);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: `Gagal memasukkan pelanggan baru: ${insertError.message}`,
          life: 3000,
        });
        return;
      }

      // Get the new customer ID
      customerId = newCustomer[0].id;
    } else if (selectedCustomer.value) {
      customerId = selectedCustomer.value.id;
    } else {
      // Kirim peringatan kalau tidak ada pelanggan
      toast.add({
        severity: "warn",
        summary: "Warning",
        detail: "Tolong pilih atau masukkan nama pelanggan.",
        life: 3000,
      });
      return;
    }

    const timestamp = new Date().toISOString();

    // Prepare the payload for the cart insertion
    const payload = {
      menu_detail_id: selectedVariant.value.id,
      quantity: quantity.value,
      note: note.value.trim(),
      customer_id: customerId,
      timestamp,
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
      return;
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Pesanan berhasil dimasukkan ke keranjang!",
      life: 3000,
    });

    // Refresh cart data
    await fetchCart();
    customerName.value = null;
    selectedCustomer.value = null;
    visible.value = false;
    isLoading.value = false;
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
        class="menu flex flex-col p-0 rounded-lg drop-shadow-xl h-full"
      >
        <template #header>
          <div
            class="grid grid-cols-[auto_1fr] gap-4 items-start md:hidden p-3"
          >
            <img
              :alt="menu.name || 'Menu Image'"
              :src="menu.image || 'placeholder.jpg'"
              class="w-24 h-24 object-cover rounded-md"
            />

            <div class="flex flex-col justify-between">
              <h3
                class="text-base font-bold capitalize text-[var(--text-primary)]"
              >
                {{ menu.name || "No Name" }}
              </h3>
              <div
                v-if="menu.menu_detail.length"
                class="flex flex-col gap-1 text-sm text-gray-500 mt-2"
              >
                <div
                  v-for="detail in menu.menu_detail"
                  :key="detail.id"
                  class="text-sm"
                >
                  {{ detail.menu_variants?.name || "No Variant" }}:
                  {{ formatCurrency(detail.price) || "N/A" }}
                </div>
              </div>
            </div>
          </div>

          <div class="hidden md:block">
            <img
              :alt="menu.name || 'Menu Image'"
              :src="menu.image || 'placeholder.jpg'"
              class="w-full h-48 object-cover rounded-t-lg"
            />
          </div>
        </template>

        <template #content>
          <div class="md:hidden px-3 pb-2">
            <p class="text-sm text-white">
              {{ menu.description || "Tidak ada deskripsi." }}
            </p>
          </div>
          <div class="hidden md:flex flex-col justify-between flex-1 p-4">
            <div>
              <h3
                class="text-xl font-bold capitalize text-[var(--text-primary)]"
              >
                {{ menu.name || "No Name" }}
              </h3>
              <div
                v-if="menu.menu_detail.length"
                class="flex flex-col gap-1 text-sm text-gray-600 mt-2"
              >
                <div
                  v-for="detail in menu.menu_detail"
                  :key="detail.id"
                  class="text-sm"
                >
                  {{ detail.menu_variants?.name || "No Variant" }}:
                  {{ formatCurrency(detail.price) || "N/A" }}
                </div>
              </div>
            </div>

            <p class="text-sm text-white mt-4">
              {{ menu.description || "Tidak ada deskripsi." }}
            </p>
          </div>
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

  <Dialog
    v-model:visible="visible"
    modal
    :header="`Pesan ${selectedMenu?.name}`"
    :style="{ width: '25rem' }"
  >
    <div v-if="isLoading">
      <ProgressSpinner />
    </div>
    <div v-else class="flex flex-col gap-4">
      <InputText
        v-model="customerName"
        placeholder="Masukkan nama pelanggan baru"
        class="text-[var(--text-primary)] bg-[var(--input-primary)]"
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
        class="custom-select text-[var(--text-primary)]"
        optionLabel="menu_variants.name"
        placeholder="Pilih varian"
      />
      <InputNumber
        v-model="quantity"
        :min="1"
        :max="500"
        placeholder="Quantity"
        label="Quantity"
        class="text-[var(--text-primary)]"
      />
      <Textarea
        v-model="note"
        rows="3"
        cols="30"
        placeholder="Tambahkan catatan"
        class="custom-textarea text-[var(--text-primary)]"
      />
      <div class="flex justify-end mt-4 gap-2">
        <Button
          type="button"
          variant="outlined"
          label="Cancel"
          icon="fa-solid fa-xmark"
          severity="secondary"
          @click="visible = false"
        />
        <Button
          type="button"
          label="Simpan"
          icon="fa-solid fa-check"
          severity="success"
          @click="saveOrder"
        />
      </div>
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
