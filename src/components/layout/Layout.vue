<template>
  <div class="flex flex-row min-h-screen">
    <aside class="sidebar bg-white text-black">
      <div class="m-4">
        <div class="logo flex items-center">
          <img src="/images/logoABS.png" alt="ABS Logo" class="w-8 h-8 mr-4" />
          <strong>Artisan Beverage Studio</strong>
        </div>
      </div>

      <ul class="flex flex-col justify-center">
        <RouterLink to="/"
          ><li>
            <i class="fa-solid fa-house ease-in duration-300"></i> Home Page
          </li></RouterLink
        >
        <RouterLink to="/history"
          ><li>
            <i class="fa-solid fa-scroll ease-in duration-300"></i> History Menu
          </li></RouterLink
        >
        <RouterLink to="/order">
          <li>
            <i class="fa-solid fa-cart-shopping ease-in duration-300"></i>
            Order
          </li></RouterLink
        >
        <RouterLink to="/add"
          ><li>
            <i class="fa-solid fa-square-plus ease-in duration-300"></i> Add
            Menu
          </li></RouterLink
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
  padding: 1rem;
  font-size: 20px;
}

.sidebar li:hover {
  color: #fff;
  background: #000;
  width: 100%;
  transition: 0.5s;
}

.sidebar i {
  margin-right: 15px;
}
</style>
