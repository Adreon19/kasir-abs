<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "../../../supabase";
import { useToast } from "primevue/usetoast";
import { Cropper } from "vue-advanced-cropper";
import { emitEvent } from "../../../utils/BusEvent";
import "vue-advanced-cropper/dist/style.css";

const isLoading = ref(false);
const menuName = ref("");
const img = ref(null); // Gambar yang akan di-crop
const selectedFile = ref(null);
const toast = useToast();
const selectedCategory = ref([]);
const categories = ref([]);
const descriptionForm = ref("");
const croppedResult = ref(null); // Hasil crop
const showCropper = ref(false); // Tampilkan/sembunyikan cropper
const croppedImage = ref(null); // Gambar hasil crop

const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("kategori_menu")
      .select("id, kategori");

    if (error) {
      throw error;
    }
    categories.value = data;
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
};

function onFileSelect(event) {
  const file = event.files[0];
  selectedFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    img.value = e.target.result; // Set gambar ke cropper
    showCropper.value = true; // Tampilkan cropper
  };
  reader.readAsDataURL(file);
}

function change({ coordinates, canvas }) {
  // Simpan hasil crop ke croppedResult
  canvas.toBlob((blob) => {
    const fileName = `cropped_${Date.now()}.png`;
    selectedFile.value = new File([blob], fileName, { type: "image/png" });

    const reader = new FileReader();
    reader.onload = (e) => {
      croppedResult.value = e.target.result;
    };
    reader.readAsDataURL(blob);
  });
}

function cropImage() {
  if (croppedResult.value) {
    croppedImage.value = croppedResult.value; // Set hasil crop ke croppedImage
    showCropper.value = false; // Sembunyikan cropper
  }
}

const uploadImageAndSaveMenu = async () => {
  if (!menuName.value || !selectedFile.value) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Please provide menu name and cropped image!",
      life: 3000,
    });
    return;
  }

  try {
    isLoading.value = true;

    // Upload cropped image
    const filePath = `menu/${Date.now()}_${selectedFile.value.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("menu")
      .upload(filePath, selectedFile.value);

    if (uploadError) {
      throw uploadError;
    }

    const imageUrl = supabase.storage.from("menu").getPublicUrl(filePath)
      .data.publicUrl;

    // Save menu details to the database
    const { data: menuData, error: menuError } = await supabase
      .from("menu_list")
      .insert([
        {
          name: menuName.value,
          image: imageUrl,
          kategori_id: selectedCategory.value,
          description: descriptionForm.value,
        },
      ])
      .select();

    emitEvent("menuAdded", { id: menuData[0].id, name: menuName.value });
    if (menuError) {
      throw menuError;
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Menu berhasil ditambah!",
      life: 5000,
    });

    // Reset form setelah upload
    menuName.value = "";
    selectedFile.value = null;
    croppedImage.value = null;
    descriptionForm.value = "";
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

onMounted(fetchCategories);
</script>

<template>
  <section class="main-section">
    <h2 class="font-bold text-2xl capitalize">Tambah nama menu</h2>
    <div
      class="flex flex-col md:flex-row gap-5 mt-5 items-center bg-[var(--section-bg)] rounded-xl"
    >
      <div class="flex flex-col md:flex-row items-center gap-5">
        <FileUpload
          mode="basic"
          @select="onFileSelect"
          customUpload
          auto
          accept="image/*"
          :maxFileSize="150000"
          severity="secondary"
          class="rounded-xl bg-[var(--input-primary)] text-[var(--text-secondary)] border border-white p-button-outlined p-10 z-0 m-5 ml-20"
        />
        <img
          v-if="croppedImage"
          :src="croppedImage"
          alt="Cropped Image"
          class="cropped-img m-5 box-shadow: 0 0 #ffff;"
        />

        <!-- Overlay -->
        <div v-if="showCropper" class="overlay"></div>

        <!-- Cropper Modal -->
        <div v-if="showCropper" class="cropper-modal">
          <Cropper
            :src="img"
            @change="change"
            :stencil-props="{
              aspectRatio: 234 / 234,
            }"
          />
          <div class="button-group">
            <button @click="cropImage">Crop</button>
            <button @click="showCropper = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col md:flex-row gap-5 mt-8">
      <FloatLabel class="w-full md:w-auto">
        <InputText
          id="menu-name"
          v-model="menuName"
          class="custom-input p-6 md:w-auto"
        />
        <label for="menu-name" class="custom-label">Nama menu</label>
      </FloatLabel>
      <Select
        v-model="selectedCategory"
        :options="categories"
        optionLabel="kategori"
        optionValue="id"
        placeholder="Pilih Kategori"
        class="custom-select w-full md:w-auto p-4"
      />
      <Textarea
        v-model="descriptionForm"
        rows="1"
        cols="30"
        placeholder="Masukkan Deskripsi menu"
        style="resize: none"
        class="custom-textarea p-2 w-full"
      />
    </div>
    <div>
      <Button
        label="Save"
        icon="fa fa-check"
        iconPos="left"
        @click="uploadImageAndSaveMenu"
        :loading="isLoading"
        class="custom-button p-4 mt-4 w-full"
      />
    </div>

    <!-- Form lainnya -->
  </section>
</template>
<style>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Latar belakang semi-transparan */
  z-index: 999; /* Pastikan lebih rendah dari cropper */
}

.cropper-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(
    255,
    255,
    255,
    0.9
  ); /* Latar belakang putih semi-transparan */
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1000; /* Pastikan lebih tinggi dari overlay */
  width: 90%;
  max-width: 600px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cropper-modal .button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  width: 100%;
}

.cropper-modal button {
  background-color: #ff5722;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.cropper-modal button:hover {
  background-color: #e64a19;
}

.cropped-img {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  margin-top: 10px;
}
</style>
