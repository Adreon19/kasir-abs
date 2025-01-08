<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-white text-black">
      <h1>kasih side bar</h1>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-gray-800 text-white text-center p-4">
      <p>&copy; Nanti rapihin footer nya ya atau mau dihapus juga gapapa</p>
    </footer>
  </div>
</template>

<style scoped>
footer {
  background-color: #ffffff1b;
}
</style>
