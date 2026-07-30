import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../db/audit.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { data } = await supabase.from('clients').select('*').order('id', { ascending: true });
  res.json(data || []);
});

router.get('/:id', async (req, res) => {
  const { data } = await supabase.from('clients').select('*').eq('id', req.params.id).single();
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { full_name, contact_number, email, social_media, status } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name required' });

  const { data, error } = await supabase.from('clients').insert({
    full_name, contact_number: contact_number || '', email: email || '',
    social_media: social_media || '', status: status || 'active',
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  await logAudit('CREATE', 'client', data.id, `Name: ${full_name}`);
  res.status(201).json({ id: data.id });
});

router.put('/:id', async (req, res) => {
  const { full_name, contact_number, email, social_media, status } = req.body;

  const { error } = await supabase.from('clients').update({
    full_name, contact_number, email, social_media, status,
  }).eq('id', req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  await logAudit('UPDATE', 'client', Number(req.params.id), `Name: ${full_name}`);
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('clients').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  await logAudit('DELETE', 'client', Number(req.params.id), '');
  res.json({ success: true });
});

export default router;
