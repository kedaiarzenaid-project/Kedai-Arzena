const fs = require('fs');
let c = fs.readFileSync('src/views/kasir/PosView.vue', 'utf8');

// 1. Reduce header height (p-4 to py-2 px-4)
c = c.replace(
  /<header class='bg-blue-800 text-white p-4 shadow-sm flex justify-between items-center z-10'>/,
  "<header class='bg-blue-800 text-white py-2 px-4 shadow-sm flex justify-between items-center z-10'>"
);

// 2. Fix search input styling
const oldInput = `<input v-model='searchQuery' type='text' placeholder='Cari menu...' class='w-full px-3 py-1.5 rounded-full text-sm text-gray-800 focus:outline-none'>`;
const newInput = `<input v-model='searchQuery' type='text' placeholder='Cari menu...' class='w-full px-3 py-1.5 rounded-full text-sm text-white bg-white/20 placeholder-white/70 focus:bg-white/30 focus:outline-none border border-white/10 shadow-inner'>`;

c = c.replace(oldInput, newInput);

// 3. Reduce the padding of the Category container a little bit too to save space
c = c.replace(
  /<div class='p-3 bg-white shadow-sm flex gap-2 overflow-x-auto whitespace-nowrap z-10 no-scrollbar'>/,
  "<div class='py-2 px-4 bg-white shadow-sm flex gap-2 overflow-x-auto whitespace-nowrap z-10 no-scrollbar'>"
);

fs.writeFileSync('src/views/kasir/PosView.vue', c, 'utf8');
