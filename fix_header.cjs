const fs = require('fs');
let c = fs.readFileSync('src/views/pembeli/CheckoutView.vue', 'utf8');

// Update imports
c = c.replace(/import \{ TrashIcon \} from 'lucide-vue-next'/, "import { TrashIcon, ArrowLeftIcon } from 'lucide-vue-next'");

// Update header
const oldHeader = `<header class='bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-40'>
      <button @click='router.back()' class='text-gray-600 font-bold'>&larr; Kembali</button>
      <h1 class='text-lg font-bold'>Checkout Pesanan</h1>
    </header>`;

const newHeader = `<header class='bg-white p-4 shadow-sm flex items-center justify-center sticky top-0 z-40 relative h-16'>
      <button @click='router.back()' class='absolute left-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-90 transition-transform shadow-sm'>
        <ArrowLeftIcon class='w-5 h-5' />
      </button>
      <h1 class='text-lg font-bold tracking-widest'>PESANAN</h1>
    </header>`;

c = c.replace(oldHeader, newHeader);

fs.writeFileSync('src/views/pembeli/CheckoutView.vue', c, 'utf8');
