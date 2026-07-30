import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../db/audit.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { data } = await supabase.from('price_list').select('*').order('category').order('id');
  res.json(data || []);
});

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('price_list').select('*').eq('id', req.params.id).single();
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { category, commission_type, description, price_php, price_usd, turnaround_days } = req.body;
  if (!category || !commission_type) return res.status(400).json({ error: 'category and commission_type required' });

  const { data, error } = await supabase.from('price_list').insert({
    category, commission_type, description: description || '',
    price_php: price_php || 0, price_usd: price_usd || 0, turnaround_days: turnaround_days || 7,
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  await logAudit('CREATE', 'price', data.id, `${category} - ${commission_type}`);
  res.status(201).json({ id: data.id });
});

router.put('/:id', async (req, res) => {
  const { category, commission_type, description, price_php, price_usd, turnaround_days } = req.body;

  const { error } = await supabase.from('price_list').update({
    category, commission_type, description, price_php, price_usd, turnaround_days,
  }).eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  await logAudit('UPDATE', 'price', Number(req.params.id), `${category} - ${commission_type}`);
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('price_list').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  await logAudit('DELETE', 'price', Number(req.params.id), '');
  res.json({ success: true });
});

export default router;
