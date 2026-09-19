// Lê os dados do Supabase no servidor, com a chave secreta.
// Só é acessível depois do login (ver middleware.js).
// A chave fica na variável de ambiente SUPABASE_SECRET_KEY do Vercel — nunca no código.

const SUPA = 'https://mpqxovtheecoqbermucw.supabase.co';

// Só estas tabelas podem ser pedidas (lista fechada).
const TABELAS = {
  grelhas:    '/rest/v1/grelhas?select=*&order=criado_em.desc',
  assertivas: '/rest/v1/fazedor_assertivas?select=*&order=criado_em.desc',
  frases:     '/rest/v1/fazedor_frases?select=*&order=criado_em.desc',
  quiz:       '/rest/v1/quiz_radar?select=*&order=criado_em.desc',
  cha:        '/rest/v1/cena_cha_nomeacao?select=*&order=created_at.desc',
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const caminho = TABELAS[req.query.tabela];
  if (!caminho) return res.status(400).json({ erro: 'Tabela desconhecida' });

  const chave = (process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!chave) return res.status(500).json({ erro: 'SUPABASE_SECRET_KEY não configurada' });

  const headers = { apikey: chave };
  if (chave.startsWith('eyJ')) headers.Authorization = 'Bearer ' + chave; // chave antiga "service_role"

  try {
    const r = await fetch(SUPA + caminho, { headers });
    const corpo = await r.text();
    res.status(r.status).setHeader('Content-Type', 'application/json').send(corpo);
  } catch (e) {
    res.status(502).json({ erro: 'Sem ligação ao Supabase' });
  }
}
