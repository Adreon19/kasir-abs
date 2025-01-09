<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-white text-black">
      <div class="sidebar">
        <div class="logo flex">
          <img src="" alt="ABS Logo">
          <strong style="width: 800px;">Aritisan Beverage Studio</strong>
        </div>
        <ul class="m-5">
          <li><RouterLink :to="{name: ''}"><i class="fa-solid fa-house"></i>Home Page</RouterLink></li>
          <li><RouterLink :to="{name: ''}"><i class="fa-solid fa-scroll"></i>History Menu</RouterLink></li>
          <li><RouterLink :to="{name: ''}"><i class="fa-solid fa-cart-shopping"></i>Order</RouterLink></li>
          <li><RouterLink :to="{name: ''}"><i class="fa-solid fa-square-plus"></i>Add Menu</RouterLink></li>
        </ul>
      </div>
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
header {
  position: fixed;
  top: 0;
  right: 10px;
  width: 350px;
  height: 100%;
}

.sidebar li{
  padding: 10px;
  font-size: 20px;
}

.sidebar li:hover{
  color: #fff;
  background: #000;
  width: 100%;
}

.sidebar i{
  margin-right: 15px;
}

footer {
  background-color: #ffffff1b;
}
</style>
