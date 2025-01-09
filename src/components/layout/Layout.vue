<template>
  <div class="flex flex-row min-h-screen">
    <aside class="sidebar bg-white text-black">
      <div class="logo flex items-center p-4">
        <img src="" alt="ABS Logo" class="w-8 h-8 mr-4" />
        <strong>Aritisan Beverage Studio</strong>
      </div>
      <ul class="m-5">
        <RouterLink to="/"
          ><li><i class="fa-solid fa-house"></i> Home Page</li></RouterLink
        >
        <RouterLink to="/history"
          ><li><i class="fa-solid fa-scroll"></i> History Menu</li></RouterLink
        >
        <RouterLink to="/order">
          <li><i class="fa-solid fa-cart-shopping"></i> Order</li></RouterLink
        >
        <RouterLink to="/add"
          ><li><i class="fa-solid fa-square-plus"></i> Add Menu</li></RouterLink
        >
      </ul>
    </aside>

    <div class="flex-grow flex flex-col">
      <main class="flex-grow">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 350px;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar li {
  padding: 10px;
  font-size: 20px;
}

.sidebar li:hover {
  color: #fff;
  background: #000;
  width: calc(100% - 10px);
}

.sidebar i {
  margin-right: 15px;
}
</style>
