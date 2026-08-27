const fs = require('fs');
let c = fs.readFileSync('src/views/kasir/DashboardView.vue', 'utf8');

const oldHeader = `<div class='p-4 border-b flex justify-between items-center bg-gray-50'>
          <h2 class='font-bold text-lg'>Detail #{{ selectedOrder.order_number }}</h2>
          <button @click='selectedOrder = null' class='text-gray-400 hover:text-red-500'><XIcon class='w-6 h-6'/></button>
        </div>`;

const newHeader = `<div class='p-4 border-b flex justify-between items-center bg-gray-50'>
          <div class='flex items-center gap-2'>
            <h2 class='font-bold text-lg'>Detail #{{ selectedOrder.order_number }}</h2>
            <span :class='getStatusBgClass(selectedOrder.status)' class='px-2 py-1 rounded-md text-xs font-bold uppercase text-white shadow-sm'>
              {{ selectedOrder.status }}
            </span>
          </div>
          <button @click='selectedOrder = null' class='text-gray-400 hover:text-red-500'><XIcon class='w-6 h-6'/></button>
        </div>`;

c = c.replace(oldHeader, newHeader);

fs.writeFileSync('src/views/kasir/DashboardView.vue', c, 'utf8');
