<script setup>
import { useRoute } from "vue-router";
import Layout from "./components/layout/Layout.vue";

const route = useRoute();
</script>

<template>
  <div>
    <Layout v-if="!['/login', '/register'].includes(route.path)">
      <router-view />
    </Layout>
    <router-view v-else />
  </div>
</template>

<style scoped></style>
