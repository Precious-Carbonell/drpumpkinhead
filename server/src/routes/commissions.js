import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../db/audit.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { data } = await supabase
    .from('commissions')
    .select('*, clients(full_name)')
    .order('queue_number', { ascending: true });

  const rows = (data || []).map(r => ({ ...r, client_name: r.clients?.full_name || '', clients: undefined }));
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { data } = await supabase
    .from('commissions')
    .select('*, clients(full_name)')
    .eq('id', req.params.id)
    .single();

  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json({ ...data, client_name: data.clients?.full_name || '', clients: undefined });
});

router.post('/', async (req, res) => {
  const { client_id, queue_number, commission_type, price, mode_of_payment, payment_type, payment_status, commission_status, progress_percentage, due_date, remarks } = req.body;
  if (!client_id || !commission_type) return res.status(400).json({ error: 'client_id and commission_type required' });

  const { data, error } = await supabase.from('commissions').insert({
    client_id, queue_number, commission_type, price: price || 0,
    mode_of_payment: mode_of_payment || '', payment_type: payment_type || '',
    payment_status: payment_status || 'Unpaid', commission_status: commission_status || 'Queued',
    progress_percentage: progress_percentage || 0, due_date: due_date || null, remarks: remarks || '',
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  await logAudit('CREATE', 'commission', data.id, `Type: ${commission_type}`);
  res.status(201).json({ id: data.id });
});

router.put('/:id', async (req, res) => {
  const { client_id, queue_number, commission_type, price, mode_of_payment, payment_type, payment_status, commission_status, progress_percentage, due_date, date_created, remarks } = req.body;

  const { error } = await supabase.from('commissions').update({
    client_id, queue_number, commission_type, price, mode_of_payment, payment_type,
    payment_status, commission_status, progress_percentage, due_date, date_created, remarks,
  }).eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  await logAudit('UPDATE', 'commission', Number(req.params.id), `Status: ${commission_status}, Payment: ${payment_type}`);
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('commissions').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  await logAudit('DELETE', 'commission', Number(req.params.id), '');
  res.json({ success: true });
});

export default router;
