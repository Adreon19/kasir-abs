<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "../supabase";
import { formatCurrency } from "../utils/formatter/currency";
import { DataTable, Toast, useToast } from "primevue";

const toast = useToast();
const isLoading = ref(false);
const finance = ref([]);
const outcomeData = ref([]);
const outcomeDetail = ref("");
const detail = ref("");

const fetchFinance = async () => {
  try {
    isLoading.value = true;
    let { data: order_detail, error } = await supabase.from("order").select(`
      id,
      paid,
      total_price,
      change
      `);
    if (error) throw error;
    finance.value = order_detail;
  } catch (error) {
    console.log("error fetching order:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchOutcome = async () => {
  try {
    isLoading.value = true;
    let { data: outcome, error } = await supabase.from("outcome").select(`
    pengeluaran,
    catatan
    `);
    if (error) throw error;
    outcomeData.value = outcome;
  } catch (error) {
    console.log("Error fetching outcome data:", error);
  } finally {
    isLoading.value = false;
  }
};

const insertOutcome = async () => {
  try {
    let { data: outcome, error } = await supabase.from("outcome").insert([
      {
        pengeluaran: outcomeDetail.value,
        catatan: detail.value,
      },
    ]);
    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Pengeluaran berhasil dicatat!",
      life: 3000,
    });
    outcomeDetail.value = "";
    await fetchOutcome();
    outcomeDetail.value = "";
    detail.value = "";
  } catch (error) {
    console.log("error inserting outcome data:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error mencatat pengeluaran!",
      life: 3000,
    });
  }
};

const totalFinance = computed(() => {
  const totalPaid = finance.value.reduce(
    (sum, item) => sum + (item.paid || 0),
    0
  );
  const totalChange = finance.value.reduce(
    (sum, item) => sum + (item.change || 0),
    0
  );
  const totalOutcome = outcomeData.value.reduce(
    (sum, item) => sum + (item.pengeluaran || 0),
    0
  );
  return totalPaid - (totalChange + totalOutcome);
});

const initializeData = async () => {
  try {
    await fetchFinance();
    await fetchOutcome();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeData);
</script>

<template>
  <div class="p-6 flex flex-col gap-6 max-w-full container">
    <h1 class="text-[var(--text-primary)] font-bold" style="font-size: 30px">
      Riwayat Keuangan
    </h1>
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else class="flex flex-col gap-6">
      <section class="main-section">
        <h1 class="text-4xl">
          Total keuangan: {{ formatCurrency(totalFinance) }}
        </h1>
      </section>
      <section class="main-section">
        <div class="container flex flex-col gap-4">
          <DataTable :value="finance" stripedRows>
            <Column header="Total Masuk">
              <template #body="slotProps">
                <div class="text-[var(--text-secondary)]">
                  {{ formatCurrency(slotProps.data.paid) }}
                </div>
              </template>
            </Column>
            <Column header="Kembalian">
              <template #body="slotProps">
                <div class="text-[var(--text-secondary)]">
                  {{ formatCurrency(slotProps.data.change) }}
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </section>

      <section class="main-section flex flex-col gap-10">
        <div
          class="flex flex-col bg-[var(--striped-row)] justify-between item-center gap-3 p-5"
        >
          <div class="flex flex-col gap-3">
            <label for="outcome"> Pengeluaran </label>
            <InputNumber
              v-model="outcomeDetail"
              id="outcome"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              class="text-l w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="detail"> Detail </label>
            <TextArea
              v-model="detail"
              row="5"
              cols="30"
              class="custom-textarea"
              placeholder="Masukkan detail pengeluaranmu!"
            />
          </div>
          <div class="flex justify-center items-center">
            <Button
              label="Save"
              icon="fa fa-check"
              iconPos="left"
              @click="insertOutcome"
              :loading="isLoading"
              class="custom-button w-full h-fit p-4 mt-4"
            />
          </div>
        </div>
        <div class="border-b-2"></div>
        <div class="container flex flex-col gap-4">
          <DataTable :value="outcomeData" stripedRows>
            <Column header="Pengeluaran">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.pengeluaran) }}
              </template>
            </Column>
            <Column field="catatan" header="Detail Pengeluaran" />
          </DataTable>
        </div>
      </section>
    </div>
  </div>
  <Toast />
</template>
