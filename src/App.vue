<script setup>
import Layout from "./components/layout/Layout.vue";
// import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { supabase } from "./supabase";
import { useRoute } from "vue-router";
const route = useRoute();
const router = useRouter();

supabase.auth.onAuthStateChange((event, session) => {
  if (!session && route.meta.requiresAuth) {
    router.push("/login");
  }
});
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
