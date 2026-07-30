import { supabase } from './supabase.js';

export async function logAudit(action, entity, entityId, details = '') {
  await supabase.from('audit_log').insert({
    action,
    entity,
    entity_id: entityId,
    details,
  });
}
