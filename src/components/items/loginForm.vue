<script setup lang="ts">
import { Password } from "primevue";
</script>

<template>
  <section class="flex flex-col items-center gap-5 mt-6">
    <img src="/images/logoABS.png" alt="ABS Logo" class="w-36" />
    <h1>login</h1>
    <form class="flex flex-col">
      <div class="input flex flex-col gap-5">
        <InputText type="text" v-model="value" />
        <Password :feedback="false" />
        <div>
          <input type="checkbox" />
          <label>Ingat Akun Ini</label>
        </div>
      </div>
      <div class="btn-login flex justify-center">
        <Button type="submit" severity="secondary" label="login" />
      </div>
    </form>
  </section>
</template>

<style>
.input {
  background-color: rgba(202, 141, 27, 0.913);
  padding: 2rem 3rem 2rem 3rem;
  border-radius: 10px 10px 0 0;
}

.btn-login {
  background-color: blanchedalmond;
  border-radius: 0 0 10px 10px;
  padding: 1rem;
}
</style>
