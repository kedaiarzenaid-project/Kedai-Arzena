const fs = require('fs');
let c = fs.readFileSync('src/views/pembeli/HomeView.vue', 'utf8');

// Add SearchIcon and XIcon to imports
c = c.replace(
  /import \{ ShoppingCartIcon, UserIcon \} from 'lucide-vue-next'/,
  "import { ShoppingCartIcon, UserIcon, SearchIcon, XIcon } from 'lucide-vue-next'"
);

// Add refs for searching
const refsAdd = `const activeCategory = ref(null)
const isSearching = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)

function toggleSearch() {
  isSearching.value = !isSearching.value
  if (!isSearching.value) {
    searchQuery.value = ''
  } else {
    setTimeout(() => { if (searchInputRef.value) searchInputRef.value.focus() }, 100)
  }
}`;
c = c.replace("const activeCategory = ref(null)", refsAdd);

// Modify filteredProducts computed
const oldFiltered = `const filteredProducts = computed(() => {
  if (activeCategory.value === null) return products.value
  return products.value.filter(p => p.category_id === activeCategory.value)
})`;
const newFiltered = `const filteredProducts = computed(() => {
  let result = products.value
  if (activeCategory.value !== null) {
    result = result.filter(p => p.category_id === activeCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q))
  }
  return result
})`;
c = c.replace(oldFiltered, newFiltered);

// Replace Filter Kategori template section
const oldFilterRegex = /<!-- Kategori Filter -->.*?<\/div>/s;
const newFilter = `<!-- Kategori Filter & Search -->
    <div class='px-4 py-3 bg-white shadow-sm mb-4 sticky top-14 z-30 flex items-center relative h-[56px] overflow-hidden'>
      
      <!-- Category Buttons Container -->
      <div 
        class='flex gap-2 overflow-x-auto whitespace-nowrap flex-1 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] w-full no-scrollbar'
        :class='isSearching ? "-translate-x-full opacity-0 pointer-events-none absolute" : "translate-x-0 opacity-100"'
        style='padding-right: 50px;'
      >
        <button 
          @click='activeCategory = null' 
          :class='activeCategory === null ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"'
          class='px-3 py-1 rounded-full text-sm font-bold border transition-colors flex-shrink-0'>
          Semua
        </button>
        <button 
          v-for='cat in categories' :key='cat.id'
          @click='activeCategory = cat.id'
          :class='activeCategory === cat.id ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"'
          class='px-3 py-1 rounded-full text-sm font-bold border transition-colors flex-shrink-0'>
          {{ cat.name }}
        </button>
      </div>

      <!-- Search Input & Icon -->
      <div 
        class='absolute right-4 flex items-center justify-end transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]'
        :class='isSearching ? "w-[calc(100%-32px)]" : "w-8"'
      >
        <div 
          class='flex items-center bg-gray-50 rounded-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] w-full border'
          :class='isSearching ? "border-green-400 shadow-inner" : "border-gray-200"'
        >
          <input 
            ref='searchInputRef'
            v-model='searchQuery'
            type='text' 
            placeholder='Cari nama menu...' 
            class='bg-transparent outline-none text-sm py-1.5 w-full transition-all duration-700 ease-in-out'
            :class='isSearching ? "opacity-100 px-4" : "opacity-0 px-0 w-0"'
          >
          <button @click='toggleSearch' class='p-1.5 flex-shrink-0 text-gray-500 hover:text-green-600 focus:outline-none bg-gray-50 rounded-full transition-colors'>
            <SearchIcon v-if='!isSearching' class='w-5 h-5' />
            <XIcon v-else class='w-5 h-5 text-red-500' />
          </button>
        </div>
      </div>
    </div>`;

c = c.replace(oldFilterRegex, newFilter);

// Add custom style for no-scrollbar
if (!c.includes('.no-scrollbar')) {
  c += `
<style>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>`;
}

fs.writeFileSync('src/views/pembeli/HomeView.vue', c, 'utf8');
