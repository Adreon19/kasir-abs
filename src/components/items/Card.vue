<script setup>
import { ref, onMounted } from "vue";
import { useToast, Card } from "primevue";
import { supabase } from "../../supabase";
import { formatCurrency } from "../../utils/formatter/currency";
import { RouterLink } from "vue-router";

const toast = useToast();
const visible = ref(false);
const drawerVisible = ref(false);
const addVariantDialogVisible = ref(false);
const selectedMenu = ref(null);
const quantity = ref(1);
const selectedvariant = ref(null);
const note = ref("");
const orderedMenuIds = ref([]);
const cartItems = ref([]);
const { menuList } = defineProps(["menuList"]);

// Fetch cart details including related menu and variant information
const fetchCart = async () => {
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

    orderedMenuIds.value = data.map((item) => item.menu_detail_id); // Store menu_detail_id
    cartItems.value = data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error fetching cart:", error);
  }
};

// Buka Dialog
const openDialog = (menu) => {
  selectedMenu.value = menu;
  selectedvariant.value = null;
  quantity.value = 1;
  note.value = "";
  visible.value = true;
};

// Show dialog for adding another variant of the selected menu
const openAddVariantDialog = (menu) => {
  selectedMenu.value = menu; // Ensure selectedMenu is set
  addVariantDialogVisible.value = true;
  quantity.value = 1; // Reset quantity to 1 when adding a new variant
  selectedvariant.value = null; // Reset variant selection
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
    await fetchCart();
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

// Save order into the cart
const saveOrder = async () => {
  if (!selectedMenu.value || !selectedvariant.value) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Please select a menu and variant.",
      life: 3000,
    });
    return;
  }

  try {
    const payload = {
      menu_detail_id: selectedvariant.value.id, // Make sure this is the correct variant ID
      quantity: quantity.value,
      note: note.value.trim(),
    };

    const { error } = await supabase.from("cart").insert(payload);

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Order added to cart successfully!",
      life: 3000,
    });

    // Refresh cart data
    await fetchCart();
    visible.value = false;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error saving order:", error);
  }
};

// Close drawer and show add variant dialog
const closeDrawerAndOpenAddVariantDialog = (menu) => {
  drawerVisible.value = false; // Close the drawer
  setTimeout(() => {
    openAddVariantDialog(menu); // Open the add variant dialog after the drawer closes
  }, 300);
};

onMounted(() => {
  fetchCart();
});
</script>

<template>
  <section class="flex flex-col m-4">
    <div class="grid grid-cols-4 gap-4">
      <Card
        v-for="menu in menuList"
        :key="menu.name"
        class="menu flex flex-col p-0 rounded-lg drop-shadow-xl"
      >
        <template #header>
          <img
            :alt="menu.name || 'Menu Image'"
            :src="menu.image || 'placeholder.jpg'"
            class="img-menu object-cover w-full rounded-t-lg border-none"
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
            <p class="desc">
              {{ menu.description || "No description available." }}
            </p>
          </template>
        </template>
        <template #footer>
          <div class="flex items-center">
            <Button
              v-if="
                menu.menu_detail.some((detail) =>
                  orderedMenuIds.includes(detail.id)
                )
              "
              label="Lihat Pesanan"
              class="button w-full"
              @click="drawerVisible = true"
            />
            <Button
              v-else
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
      <Select
        v-model="selectedvariant"
        :options="selectedMenu?.menu_detail"
        optionLabel="menu_variants.name"
        placeholder="Choose a variant"
      />
      <InputNumber
        v-model="quantity"
        min="1"
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

  <!-- Drawer for Cart -->
  <Drawer
    v-model:visible="drawerVisible"
    position="right"
    header="Your Order"
    class="bg-[var(--bg-drawer)]"
    :style="{ 'min-width': '45vw' }"
  >
    <div v-if="cartItems.length" class="p-4">
      <ul>
        <li v-for="(item, index) in cartItems" :key="index" class="mb-2">
          <h3 class="text-xl capitalize font-bold">
            {{ item.menu_detail.menu_id.name }}
          </h3>
          <template v-if="item.menu_detail">
            <h4 class="mb-2 text-sm text-slate-400">
              {{ item.menu_detail.variant_id.name || "No Variant" }}:
              {{ formatCurrency(item.menu_detail.price) || "N/A" }}
            </h4>
          </template>

          <template v-else>
            <h4 class="mb-2 text-sm text-slate-400">No Variant: N/A</h4>
          </template>
          <div class="button-container flex justify-between gap-6">
            <p>Quantity : {{ item.quantity }}</p>
            <Button
              label="Delete"
              icon="fa-solid fa-trash"
              class="button"
              severity="danger"
              @click="deleteCartItem(item.id)"
            />
            <Button
              label="Add Another"
              icon="fa-solid fa-plus"
              class="button w-fit"
              @click="closeDrawerAndOpenAddVariantDialog(menuList[0])"
            />
          </div>
          <div class="mb-2">
            <p>Note : {{ item.note || "No note" }}</p>
          </div>
          <hr />
        </li>
      </ul>
    </div>

    <div v-else class="p-4 text-center text-gray-500">No orders yet.</div>
    <div class="button-container flex justify-end gap-8 mt-16">
      <RouterLink to="/order">
        <Button
          type="button"
          class="button w-fit"
          label="Check Out"
          severity="success"
        />
      </RouterLink>
    </div>
  </Drawer>

  <!-- Dialog to Add Another Variant -->
  <Dialog
    v-model:visible="addVariantDialogVisible"
    modal
    :header="`Add Another Variant for ${selectedMenu?.name}`"
    :style="{ width: '25rem' }"
  >
    <div class="flex flex-col gap-4">
      <Select
        v-model="selectedvariant"
        :options="selectedMenu?.menu_detail"
        optionLabel="menu_variants.name"
        placeholder="Choose a variant"
        style="Select"
      />
      <InputNumber
        v-model="quantity"
        min="1"
        placeholder="Quantity"
        label="Quantity"
        style="Input"
      />
    </div>

    <div class="button flex justify-end mt-4 gap-2">
      <Button
        type="button"
        label="Cancel"
        icon="fa-solid fa-x-mark"
        severity="secondary"
        @click="addVariantDialogVisible = false"
      />
      <Button
        type="button"
        label="Save Variant"
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
  border: 2px solid var(--btn-secondary);
  color: var(--btn-secondary);
  margin-top: 0;
}

.footer-buttons .button {
  min-height: 2.5rem;
  /* Menyamakan tinggi tombol */
}
</style>
