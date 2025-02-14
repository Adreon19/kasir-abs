<script setup>
import { ref, reactive, onMounted } from "vue";
import { useToast, Toast, InputNumber } from "primevue";
import { useRouter, useRoute } from "vue-router";
import { supabase } from "../../../../supabase"; // Replace with your actual Supabase config

const router = useRouter();
const route = useRoute();
const toast = useToast();
const menuDetails = ref([]);
const menu = ref([]);
const isLoading = ref(false);

const updatedMenu = reactive({});
const updatedMenuDetails = reactive({});
const imageFiles = reactive({});
const imagePreviews = reactive({});
const menuId = route.params.id;

const fetchMenuDetails = async () => {
  try {
    isLoading.value = true;
    let { data: menu_detail, error } = await supabase
      .from("menu_detail")
      .select(
        `
        id,
        price,
        variant_id(
          id,
          name
        )`
      )
      .eq("menu_id", menuId);
    if (error) throw error;
    menuDetails.value = menu_detail;
  } catch (error) {
    showToast("error", "Failed to fetch menu details");
  } finally {
    isLoading.value = false;
  }
};

const fetchMenu = async () => {
  try {
    isLoading.value = true;
    let { data: menu_list, error } = await supabase
      .from("menu_list")
      .select("*")
      .eq("id", menuId);
    if (error) throw error;
    menu.value = menu_list;
  } catch (error) {
    showToast("error", "Failed to fetch menu");
  } finally {
    isLoading.value = false;
  }
};

const handleInputChange = (menuItem, field, value) => {
  if (!updatedMenu[menuItem.id]) {
    updatedMenu[menuItem.id] = { ...menuItem };
  }
  updatedMenu[menuItem.id][field] = value;
};

const handleDetailChange = (menuDetail, value) => {
  updatedMenuDetails[menuDetail.id] = { ...menuDetail, price: value };
};

const handleFileSelect = (menuItem, file) => {
  if (file) {
    imageFiles[menuItem.id] = file;
    imagePreviews[menuItem.id] = URL.createObjectURL(file); // Generate preview URL
  }
};

const saveChanges = async () => {
  try {
    // Save updated menu
    for (const id in updatedMenu) {
      const menuItem = updatedMenu[id];
      const { error } = await supabase
        .from("menu_list")
        .update(menuItem)
        .eq("id", id);
      if (error) throw error;
    }

    // Save updated menu details
    for (const id in updatedMenuDetails) {
      const menuDetailItem = updatedMenuDetails[id];
      const { error } = await supabase
        .from("menu_detail")
        .update({ price: menuDetailItem.price })
        .eq("id", id);
      if (error) throw error;
    }

    // Upload and update images
    for (const id in imageFiles) {
      const file = imageFiles[id];
      const fileName = `menu/${id}/${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("menu")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (uploadError) throw uploadError;

      // Retrieve public URL
      const { data: publicUrlData, error: urlError } = supabase.storage
        .from("menu")
        .getPublicUrl(fileName);
      if (urlError) throw urlError;

      // Update the database with the public URL
      const { error: updateError } = await supabase
        .from("menu_list")
        .update({ image: publicUrlData.publicUrl })
        .eq("id", id);
      if (updateError) throw updateError;
    }

    showToast("success", "Changes saved successfully!");
    updatedMenu.value = {};
    updatedMenuDetails.value = {};
    imageFiles.value = {};
    imagePreviews.value = {};
    await fetchMenu(); // Refresh data
    await fetchMenuDetails();
    router.push("/add");
  } catch (error) {
    console.error(error);
    showToast("error", "Failed to save changes");
  }
};

const showToast = (severity, detail) => {
  toast.add({
    severity,
    summary: severity === "error" ? "Error" : "Success",
    detail,
    life: 3000,
  });
};

onMounted(() => {
  fetchMenuDetails();
  fetchMenu();
});
</script>

<template>
  <div class="button-container p-6">
    <Button
      as="router-link"
      label="Kembali"
      icon="fa-solid fa-arrow-left"
      class="custom-button maw-w-fit"
      to="/add"
    />
  </div>
  <div class="p-6">
    <h2 class="text-[var(--text-secondary)]">Menu Editor</h2>
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="main-section">
        <div v-for="menuItem in menu" :key="menuItem.id" class="flex">
          <div class="flex-shrink-0 m-auto">
            <img
              :src="imagePreviews[menuItem.id] || menuItem.image"
              alt="Menu Image"
              class="img-menu shadow-md max-w-64 rounded-xl z-10 h-64"
            />
            <FileUpload
              class="mt-4"
              mode="basic"
              accept="image/*"
              :maxFileSize="9000000"
              auto
              @select="(e) => handleFileSelect(menuItem, e.files[0])"
            />
          </div>
          <div class="ml-4 flex-grow">
            <div class="form grid grid-cols-1 gap-4">
              <div>
                <h2 for="name">Nama Menu</h2>
                <InputText
                  v-model="menuItem.name"
                  id="name"
                  placeholder="Enter name"
                  class="custom-textarea w-full"
                  @input="
                    (e) => handleInputChange(menuItem, 'name', e.target.value)
                  "
                />
              </div>
              <div>
                <h2>Deskripsi Menu</h2>
                <TextArea
                  v-model="menuItem.description"
                  rows="5"
                  cols="30"
                  class="custom-textarea w-full resize-none"
                  @input="
                    (e) =>
                      handleInputChange(menuItem, 'description', e.target.value)
                  "
                />
              </div>
              <div>
                <h2>Harga Menu</h2>
                <div v-for="menuDetail in menuDetails" :key="menuDetail.id">
                  <div class="flex flex-col gap-2">
                    <label for="price">{{ menuDetail.variant_id.name }}</label>
                    <InputNumber
                      v-model="menuDetail.price"
                      id="price"
                      placeholder="Enter price"
                      class="w-full"
                      :min="0"
                      mode="currency"
                      currency="IDR"
                      @input="
                        (e) => handleDetailChange(menuDetail, e.target.value)
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Button
        label="Save"
        icon="fa-solid fa-save"
        class="p-button-success mt-4 float-end"
        @click="saveChanges"
      />
    </div>
  </div>
  <Toast />
</template>
<style scoped>
.img-menu {
  border: 2px solid;
}
</style>
