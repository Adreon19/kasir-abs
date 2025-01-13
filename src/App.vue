<script setup>
import Layout from "./components/layout/Layout.vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div>
    <Layout v-if="route.meta.layout">
      <router-view />
    </Layout>
    <router-view v-else />
  </div>
</template>

<style scoped></style>
