<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { supabase } from "../../../../supabase"; // Replace with your actual Supabase config

const toast = useToast();
const menuDetails = ref([]);
const menu = ref([]);

const fetchMenuDetails = async () => {
  try {
    let { data: menu_detail, error } = await supabase.from("menu_detail")
      .select(`
      id, 
      price,
       variant_id(
       id,
       name
       )`);

    if (error) throw error;

    menuDetails.value = menu_detail;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to fetch menu details",
      life: 3000,
    });
    console.error("Error fetching menu details:", error);
  }
};

const fetchMenu = async () => {
  try {
    let { data: menu_list, error } = await supabase
      .from("menu_list")
      .select(`*`);

    if (error) throw error;
    menu.value = menu_list;
  } catch {}
};

onMounted(() => {
  fetchMenuDetails();
  fetchMenu();
});
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <h2>Menu Editor</h2>

    <section class="main-section">
      <div v-for="menu in menu" :key="menu.id">
        <div class="flex flex-col">
          <label for="name">Name</label>
          <InputText
            v-model="menu.name"
            id="name"
            placeholder="Enter name"
            class="max-w-fit"
          />
        </div>
        <div class="flex flex-col">
          <label>Current Image</label>
          <img
            :src="menu.image"
            alt="Menu Image"
            class="img-menu shadow-md max-w-64 rounded-xl z-10"
          />
          <FileUpload mode="basic" accept="image/*" :maxFileSize="10" auto />
          <div class="flex flex-col">
            <TextArea
              v-model="menu.description"
              rows="5"
              cols="30"
              class="max-w-fit"
            />
          </div>
        </div>
      </div>
    </section>

    <h2>Menu Detail</h2>
    <section class="main-section">
      <div v-for="menuDetail in menuDetails" :key="menuDetail.id">
        <div class="flex flex-col gap-2">
          <label for="price">{{ menuDetail.variant_id.name }}</label>
          <InputText
            v-model="menuDetail.price"
            id="price"
            placeholder="Enter price"
            class="max-w-fit"
          />
        </div>
      </div>
    </section>

    <!-- Save Button -->
    <!-- <Button
        label="Save"
        icon="pi pi-save"
        class="p-button-success mt-2"
        @click="saveMenuDetail(menuDetail)"
      /> -->
  </div>
</template>
<style scoped>
.img-menu {
  border: 2px solid;
}
</style>
