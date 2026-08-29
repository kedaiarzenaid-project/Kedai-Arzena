const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://weztkhfwfbqvuwhblxgf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlenRraGZ3ZmJxdnV3aGJseGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzkzMDUsImV4cCI6MjEwMzMxNTMwNX0.mEqiqTb61MpjCvMyTJuZlW1lYdPxlLgDgsAAJBPHi_I');

async function run() {
  const query = `
    CREATE POLICY "Admin/Kasir can read all users_test" ON public.users FOR SELECT USING (public.get_my_role() IN ('admin', 'kasir'));
  `;
  // We can't run raw SQL from client easily unless we have rpc.
  console.log('Cannot run raw SQL from client directly.');
}
run();
