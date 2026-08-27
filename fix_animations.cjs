const fs = require('fs');

// 1. Update App.vue
let app = fs.readFileSync('src/App.vue', 'utf8');
const oldRouterView = `<router-view></router-view>`;
const newRouterView = `<router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>`;
app = app.replace(oldRouterView, newRouterView);
fs.writeFileSync('src/App.vue', app, 'utf8');

// 2. Update style.css
let style = fs.readFileSync('src/style.css', 'utf8');
const transitionsCSS = `
/* Global Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}

/* Skeleton Loading Animation */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
.animate-shimmer {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(to right, #f6f7f8 4%, #edeef1 25%, #f6f7f8 36%);
  background-size: 1000px 100%;
}
`;
if (!style.includes('.page-enter-active')) {
  fs.appendFileSync('src/style.css', transitionsCSS, 'utf8');
}

// 3. Update HomeView.vue for Skeleton Loader
let home = fs.readFileSync('src/views/pembeli/HomeView.vue', 'utf8');

// Add isLoading ref
home = home.replace("const activeCategory = ref(null)", "const activeCategory = ref(null)\nconst isLoading = ref(true)");

// Fetch Data logic
home = home.replace("async function fetchData() {", "async function fetchData() {\n  isLoading.value = true");
home = home.replace("if (prodData) products.value = prodData\n}", "if (prodData) products.value = prodData\n  isLoading.value = false\n}");

// Template changes
const gridRegex = /<!-- Grid Produk -->.*?<div v-if='filteredProducts.length === 0'/s;

const newGrid = `<!-- Skeleton Loading -->
    <div v-if='isLoading' class='px-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
      <div v-for='i in 8' :key='i' class='bg-white rounded-xl shadow-sm overflow-hidden flex flex-col'>
        <div class='relative aspect-[4/3] w-full animate-shimmer'></div>
        <div class='p-3 flex-1 flex flex-col gap-2'>
          <div class='h-4 animate-shimmer rounded w-3/4'></div>
          <div class='h-4 animate-shimmer rounded w-1/2 mb-2'></div>
          <div class='mt-auto h-8 animate-shimmer rounded-lg w-full'></div>
        </div>
      </div>
    </div>

    <!-- Grid Produk (Beneran) -->
    <div v-else class='px-4 grid grid-cols-2 md:grid-cols-4 gap-4 relative'>
      <div :id="'prod-card-' + prod.id" v-for='prod in filteredProducts' :key='prod.id' class='bg-white transition-all duration-300 rounded-xl shadow-sm overflow-hidden flex flex-col'>
        <div class='relative aspect-[4/3] w-full bg-gray-50 overflow-hidden'>
          <img :id='"prod-img-" + prod.id' v-if='prod.image_url' :src='prod.image_url' :class='prod.stock === 0 ? "grayscale" : ""' class='w-full h-full object-cover'>
          <div v-else :id='"prod-img-" + prod.id' class='w-full h-full flex items-center justify-center text-gray-400 bg-gray-200'>No Image</div>
          <div v-if='prod.stock === 0' class='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
            <span class='text-white font-bold bg-red-600 px-3 py-1 rounded-lg transform -rotate-12'>HABIS</span>
          </div>
        </div>
        <div class='p-3 flex-1 flex flex-col'>
          <h3 class='text-sm font-bold text-gray-800 leading-tight mb-1'>{{ prod.name }}</h3>
          <p class='text-green-600 font-bold mb-2'>Rp {{ prod.price.toLocaleString('id-ID') }}</p>
          <div class='mt-auto'>
            <button 
              v-if='prod.stock > 0'
              @click='(e) => addToCartWithAnim(prod, e)'
              class='w-full bg-green-100 text-green-700 hover:bg-green-600 hover:text-white font-bold py-1.5 rounded-lg text-sm transition-colors'>
              + Keranjang
            </button>
            <button v-else disabled class='w-full bg-gray-100 text-gray-400 font-bold py-1.5 rounded-lg text-sm cursor-not-allowed'>
              Kosong
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if='!isLoading && filteredProducts.length === 0'`;

home = home.replace(gridRegex, newGrid);

fs.writeFileSync('src/views/pembeli/HomeView.vue', home, 'utf8');
