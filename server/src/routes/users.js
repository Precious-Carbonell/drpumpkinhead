import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../db/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../db/audit.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { data } = await supabase.from('admin_users').select('id, username').order('id');
  res.json(data || []);
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const { data: existing } = await supabase.from('admin_users').select('id').eq('username', username).single();
  if (existing) return res.status(409).json({ error: 'Username already exists' });

  const hash = bcrypt.hashSync(password, 10);
  const { data, error } = await supabase.from('admin_users').insert({ username, password_hash: hash }).select().single();
  if (error) return res.status(400).json({ error: error.message });

  await logAudit('CREATE', 'user', data.id, `Username: ${username}`);
  res.status(201).json({ id: data.id });
});

router.put('/:id', async (req, res) => {
  const { username, password } = req.body;

  const updateData = {};
  if (username) updateData.username = username;
  if (password) updateData.password_hash = bcrypt.hashSync(password, 10);

  const { error } = await supabase.from('admin_users').update(updateData).eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });

  await logAudit('UPDATE', 'user', Number(req.params.id), `Username: ${username}`);
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  const { error } = await supabase.from('admin_users').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });

  await logAudit('DELETE', 'user', Number(req.params.id), '');
  res.json({ success: true });
});

export default router;
