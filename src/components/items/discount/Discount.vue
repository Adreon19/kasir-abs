<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../../../supabase";
import { formatCurrency } from "../../../utils/formatter/currency";
import { DataTable, Toast } from "primevue";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const isLoading = ref(false);
const discount = ref([]);
const outcomeData = ref();
const discountDetail = ref();
const detail = ref("");

const fetchDiscount = async () => {
  try {
    isLoading.value = true;
    let { data: order_detail, error } = await supabase.from("discount").select(`
      id,
      Jumlah,
      Alasan
      `);
    if (error) throw error;
    discount.value = order_detail;
  } catch (error) {
    console.log("error fetching order:", error);
  } finally {
    isLoading.value = false;
  }
};

const insertDiscount = async () => {
  try {
    let { error } = await supabase.from("discount").insert([
      {
        Jumlah: discountDetail.value,
        Alasan: detail.value,
      },
    ]);
    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Diskon berhasil dicatat!",
      life: 3000,
    });
    discountDetail.value = "";
    detail.value = "";
    await fetchDiscount();
  } catch (error) {
    console.log("error inserting discount data:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error menambahkan diskon!",
      life: 3000,
    });
  }
};

const initializeData = async () => {
  try {
    await fetchDiscount();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  }
};

onMounted(initializeData);
</script>

<template>
  <div class="p-6 flex flex-col gap-6 max-w-full container">
    <div class="flex flex-col gap-6">
      <section class="main-section flex flex-col gap-10">
        <h2>Discount</h2>
        <div
          class="flex flex-row bg-[var(--striped-row)] justify-between item-center gap-3 p-5"
        >
          <div class="flex flex-col gap-3">
            <label for="outcome" class="text-[var(--text-secondary)]">
              Diskon
            </label>
            <InputNumber
              v-model="discountDetail"
              id="outcome"
              prefix="%"
              class="h-full text-lg max-w-fit"
              placeholder="Masukkan diskon"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="detail" class="text-[var(--text-secondary)]">
              Alasan
            </label>
            <TextArea
              v-model="detail"
              row="5"
              cols="30"
              class="custom-textarea w-fit"
              placeholder="Masukkan Alasan diskon!"
            />
          </div>
          <div class="flex justify-center items-center">
            <Button
              label="Save"
              icon="fa fa-check"
              iconPos="left"
              @click="insertDiscount"
              :loading="isLoading"
              class="custom-button w-full h-fit p-4 mt-4"
            />
          </div>
        </div>
        <div class="border-b-2"></div>
        <div class="container flex flex-col gap-4">
          <DataTable
            :value="discount"
            stripedRows
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            tableStyle="min-width: 50rem"
          >
            <Column header="Jumlah" field="Jumlah" />
            <Column field="Alasan" header="Alasan Diskon" />
            <template #empty> Tidak ada Diskon! </template>
          </DataTable>
        </div>
      </section>
    </div>
  </div>
  <Toast />
</template>
