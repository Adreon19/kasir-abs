<script setup>
import InputText from "primevue/inputtext";
</script>

<template>
  <!-- <div class="m-5">
    <h1 style="font-size: 30px">Add Menu</h1>
  </div> -->
  <div class="container">
    <h1 class="title">ADD MENU</h1>
    <div class="form-container">
      <div class="image-upload">
        <button class="add-image">Add Image</button>
      </div>
      <div class="form">
        <label for="menu-name">Nama Menu</label>
        <InputText type="text" id="menu-name" v-model="value" class="p-3" />

        <label for="menu-category">Kategori Menu</label>
        <InputText
          type="text"
          id="menu-catergory"
          v-model="value"
          class="p-3"
        />

        <label for="menu-price">Harga</label>
        <InputText type="text" id="menu-price" v-model="value" class="p-3" />
      </div>
    </div>
    <button class="submit-btn">Add Menu</button>
  </div>
</template>

<style>
.container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 4rem;
  background: transparent;
  padding: 2rem;
}

.title {
  text-align: left;
  font-size: 1.5rem;
  font-weight: bold;
}

.form-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  align-items: start;
}

.image-upload {
  display: flex;
  justify-content: center;
  background: #d4a037;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  text-align: center;
}

.add-image {
  background: none;
  border: none;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}

.form {
  display: grid;
  gap: 0.5rem;
}

.form-fields label {
  font-size: 0.9rem;
}

.form-fields input {
  padding: 0.5rem;
  border: none;
  border-radius: 5px;
  background: #d4a037;
  color: #fff;
}

.submit-btn {
  background: #d4a037;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  justify-self: end;
}
</style>
