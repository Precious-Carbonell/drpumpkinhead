import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../db/audit.js';

const router = Router();
router.use(authenticate);

// GET all expenditures (sorted by date desc)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('expenditures')
    .select('*')
    .order('date', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
});

// GET summary (total spent, by category)
router.get('/summary', async (req, res) => {
  const { data, error } = await supabase.from('expenditures').select('*');
  if (error) return res.status(400).json({ error: error.message });

  const rows = data || [];
  const totalSpent = rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const byCategory = {};
  rows.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + parseFloat(r.amount);
  });

  res.json({ totalSpent, byCategory, count: rows.length });
});

// POST create expenditure
router.post('/', async (req, res) => {
  const { category, description, amount, date } = req.body;
  if (!category || !amount) return res.status(400).json({ error: 'category and amount are required' });

  const { data, error } = await supabase.from('expenditures').insert({
    category,
    description: description || '',
    amount: parseFloat(amount),
    date: date || new Date().toISOString().split('T')[0],
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  await logAudit('CREATE', 'expenditure', data.id, `${category}: ₱${amount}`);
  res.status(201).json(data);
});

// PUT update expenditure
router.put('/:id', async (req, res) => {
  const { category, description, amount, date } = req.body;

  const { error } = await supabase.from('expenditures').update({
    category,
    description: description || '',
    amount: parseFloat(amount),
    date,
  }).eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  await logAudit('UPDATE', 'expenditure', Number(req.params.id), `${category}: ₱${amount}`);
  res.json({ success: true });
});

// DELETE expenditure
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('expenditures').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  await logAudit('DELETE', 'expenditure', Number(req.params.id), '');
  res.json({ success: true });
});

export default router;
