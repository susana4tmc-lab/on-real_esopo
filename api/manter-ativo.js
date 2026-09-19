// Mantém o projeto Supabase ativo (o plano gratuito suspende projetos sem atividade durante 7 dias).
// É chamado automaticamente pelo Vercel uma vez por dia (ver vercel.json).
// Faz uma consulta mínima à base de dados e não devolve dados nenhuns.

const SUPA = 'https://mpqxovtheecoqbermucw.supabase.co';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // Opcional: se existir a variável CRON_SECRET no Vercel, só o próprio Vercel pode chamar esta rota.
  const segredo = process.env.CRON_SECRET;
  if (segredo && req.headers.authorization !== `Bearer ${segredo}`) {
    return res.status(401).json({ ok: false });
  }

  const chave = (process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!chave) return res.status(500).json({ ok: false, erro: 'SUPABASE_SECRET_KEY não configurada' });
  const headers = { apikey: chave };
  if (chave.startsWith('eyJ')) headers.Authorization = 'Bearer ' + chave;

  try {
    const r = await fetch(SUPA + '/rest/v1/grelhas?select=id&limit=1', { headers });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, quando: new Date().toISOString() });
  } catch (e) {
    return res.status(502).json({ ok: false, erro: 'Sem ligação ao Supabase' });
  }
}
