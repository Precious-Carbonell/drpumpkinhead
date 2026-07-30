import { Router } from 'express';
import { supabase } from '../db/supabase.js';

const router = Router();

function maskNamePart(part) {
  if (part.length <= 2) return part;
  return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
}

function maskFullName(name) {
  return name.split(' ').map(maskNamePart).join(' ');
}

// GET /api/commissions/public
router.get('/commissions/public', async (req, res) => {
  const { data } = await supabase
    .from('commissions')
    .select('queue_number, commission_type, commission_status, progress_percentage, due_date, clients(full_name)')
    .neq('commission_status', 'Completed')
    .order('queue_number', { ascending: true });

  const publicData = (data || []).map(row => ({
    maskedName: maskFullName(row.clients?.full_name || 'Unknown'),
    commissionType: row.commission_type,
    queuePosition: row.queue_number,
    commissionStatus: row.commission_status,
    progressPercentage: row.progress_percentage,
    estimatedCompletion: row.due_date || '',
  }));

  res.json(publicData);
});

// GET /api/prices/public
router.get('/prices/public', async (req, res) => {
  const { data } = await supabase
    .from('price_list')
    .select('category, commission_type, description, price_php, price_usd, turnaround_days')
    .order('category')
    .order('id');

  res.json(data || []);
});

// GET /api/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  const { count: total } = await supabase.from('commissions').select('*', { count: 'exact', head: true });
  const { count: active } = await supabase.from('commissions').select('*', { count: 'exact', head: true }).in('commission_status', ['In Progress', 'Sketching', 'Coloring']);
  const { count: completed } = await supabase.from('commissions').select('*', { count: 'exact', head: true }).eq('commission_status', 'Completed');
  const { count: pending } = await supabase.from('commissions').select('*', { count: 'exact', head: true }).eq('commission_status', 'Queued');

  const { data: paidRows } = await supabase.from('commissions').select('price').eq('payment_status', 'Paid');
  const revenue = (paidRows || []).reduce((sum, r) => sum + (r.price || 0), 0);

  res.json({ total: total || 0, active: active || 0, completed: completed || 0, pending: pending || 0, revenue });
});

// GET /api/audit-log
router.get('/audit-log', async (req, res) => {
  const { data } = await supabase
    .from('audit_log')
    .select('*')
    .order('id', { ascending: false })
    .limit(500);

  res.json(data || []);
});

export default router;
