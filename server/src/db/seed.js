import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase.js';

async function seed() {
  // Seed admin user
  const { data: existingAdmin } = await supabase.from('admin_users').select('id').eq('username', 'admin').single();
  if (!existingAdmin) {
    const hash = bcrypt.hashSync('admin123', 10);
    await supabase.from('admin_users').insert({ username: 'admin', password_hash: hash });
    console.log('Admin user created (username: admin, password: admin123)');
  } else {
    console.log('Admin user already exists');
  }

  // Seed clients
  const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true });
  if (count === 0) {
    await supabase.from('clients').insert([
      { full_name: 'Princess Clara', contact_number: '09171234567', email: 'princess@email.com', social_media: '@princess_clara', status: 'active' },
      { full_name: 'John Doe', contact_number: '09181234567', email: 'john@email.com', social_media: '@johndoe', status: 'active' },
      { full_name: 'Ana Reyes', contact_number: '09191234567', email: 'ana@email.com', social_media: '@ana_reyes', status: 'active' },
      { full_name: 'Mark Tan', contact_number: '09201234567', email: 'mark@email.com', social_media: '@marktan', status: 'active' },
      { full_name: 'Sarah Lee', contact_number: '09211234567', email: 'sarah@email.com', social_media: '@sarahlee', status: 'active' },
    ]);
    console.log('Clients seeded');
  }

  // Seed commissions (need client IDs)
  const { count: commCount } = await supabase.from('commissions').select('*', { count: 'exact', head: true });
  if (commCount === 0) {
    const { data: clients } = await supabase.from('clients').select('id').order('id');
    if (clients && clients.length >= 5) {
      await supabase.from('commissions').insert([
        { client_id: clients[0].id, queue_number: 1, commission_type: 'Bust-up (Solo)', price: 200, mode_of_payment: 'GCash', payment_type: 'Full', payment_status: 'Paid', commission_status: 'In Progress', progress_percentage: 80, due_date: '2026-08-05', remarks: 'Rush order' },
        { client_id: clients[1].id, queue_number: 2, commission_type: 'Icon (Couple)', price: 250, mode_of_payment: 'PayPal', payment_type: 'Half', payment_status: 'Partial', commission_status: 'In Progress', progress_percentage: 45, due_date: '2026-08-10', remarks: '' },
        { client_id: clients[2].id, queue_number: 3, commission_type: 'Chibi Bust-up', price: 180, mode_of_payment: 'GCash', payment_type: 'Full', payment_status: 'Paid', commission_status: 'Sketching', progress_percentage: 20, due_date: '2026-08-14', remarks: '' },
        { client_id: clients[3].id, queue_number: 4, commission_type: 'Icon (Solo)', price: 150, mode_of_payment: 'GCash', payment_type: 'Half', payment_status: 'Unpaid', commission_status: 'Queued', progress_percentage: 0, due_date: '2026-08-18', remarks: '' },
        { client_id: clients[4].id, queue_number: 5, commission_type: 'Bust-up (Couple)', price: 350, mode_of_payment: 'PayPal', payment_type: 'Full', payment_status: 'Paid', commission_status: 'Queued', progress_percentage: 0, due_date: '2026-08-22', remarks: 'With background' },
      ]);
      console.log('Commissions seeded');
    }
  }

  // Seed price list
  const { count: priceCount } = await supabase.from('price_list').select('*', { count: 'exact', head: true });
  if (priceCount === 0) {
    await supabase.from('price_list').insert([
      { category: 'Solo', commission_type: 'Icon', description: 'Solo icon portrait', price_php: 150, price_usd: 5, turnaround_days: 7 },
      { category: 'Solo', commission_type: 'Bust-up', description: 'Solo bust-up illustration', price_php: 200, price_usd: 10, turnaround_days: 7 },
      { category: 'Couple / Duo', commission_type: 'Icon', description: 'Couple/Duo icon portrait', price_php: 250, price_usd: 11, turnaround_days: 7 },
      { category: 'Couple / Duo', commission_type: 'Bust-up', description: 'Couple/Duo bust-up illustration', price_php: 350, price_usd: 16, turnaround_days: 7 },
      { category: 'Chibi', commission_type: 'Head-only', description: 'Chibi head-only', price_php: 150, price_usd: 5, turnaround_days: 7 },
      { category: 'Chibi', commission_type: 'Bust-up', description: 'Chibi bust-up', price_php: 180, price_usd: 7, turnaround_days: 7 },
      { category: 'Tweening', commission_type: 'Easy', description: 'Simple tweening animation', price_php: 300, price_usd: 15, turnaround_days: 14 },
      { category: 'Tweening', commission_type: 'Medium', description: 'Medium tweening animation', price_php: 600, price_usd: 25, turnaround_days: 14 },
      { category: 'Tweening', commission_type: 'Difficult', description: 'Complex tweening animation', price_php: 900, price_usd: 35, turnaround_days: 14 },
      { category: 'Frame by Frame', commission_type: 'Easy', description: 'Simple frame-by-frame animation', price_php: 800, price_usd: 30, turnaround_days: 14 },
      { category: 'Frame by Frame', commission_type: 'Medium', description: 'Medium frame-by-frame animation', price_php: 1400, price_usd: 45, turnaround_days: 14 },
      { category: 'Frame by Frame', commission_type: 'Difficult', description: 'Complex frame-by-frame animation', price_php: 2000, price_usd: 60, turnaround_days: 14 },
      { category: 'Tweening + FbF', commission_type: 'Easy', description: 'Simple combined animation', price_php: 1000, price_usd: 40, turnaround_days: 14 },
      { category: 'Tweening + FbF', commission_type: 'Medium', description: 'Medium combined animation', price_php: 1800, price_usd: 60, turnaround_days: 14 },
      { category: 'Tweening + FbF', commission_type: 'Difficult', description: 'Complex combined animation', price_php: 2600, price_usd: 80, turnaround_days: 14 },
    ]);
    console.log('Price list seeded');
  }

  console.log('Seed complete!');
}

seed();
