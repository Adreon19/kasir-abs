<script setup></script>

<template>
  <div class="m-5">
    <h1 style="font-size: 30px">List Order</h1>
  </div>
  <section class="main-section m-5 flex flex-col gap-4">
    <DataTable :value="products" class="">
      <Column field="name" header="Name"></Column>
      <Column field="variant" header="Variant"></Column>
      <Column field="quantity" header="Quantity"></Column>
    </DataTable>

    <div class="flex justify-between font-extrabold text-2xl border-t-4">
      <span>Total</span>
      <Button
        label="Catatan"
        class="bg-black text-white border-white relative right-4"
        @click="visible = true"
      />
      <Dialog
        v-model:visible="visible"
        modal
        header="Edit Profile"
        :style="{ width: '25rem' }"
      >
        <span class="text-surface-500 dark:text-surface-400 block mb-8"
          >Update your information.</span
        >
        <Textarea v-model="value" rows="5" cols="30" />
        <div class="flex justify-end gap-2">
          <Button
            type="button"
            label="cancel"
            severity="secondary"
            @click="visible = false"
          ></Button>
          <Button type="button" label="Save" @click="visible = false"></Button>
        </div>
      </Dialog>
      <span>Nominal</span>
    </div>
  </section>
  <Select
    v-model="selectedCategory"
    :options="categories"
    option-value="id"
    option-label="kategori"
    placeholder="Payment Method"
    class="p-select w-full md:w-56 font-bold mt-5 ml-5"
  />
</template>

<style>
.p-datatable-column-header-content {
  justify-content: center;
}
</style>
