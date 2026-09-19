// Protecção por palavra-passe do dashboard ON-RE@L (projecto on-real-esopo).
// A grelha (index.html) continua aberta aos facilitadores.
// Utilizadores na variável PORTAL_USERS do Vercel:  utilizador:palavrapasse  separados por vírgulas.

export const config = {
  matcher: ['/dashboard.html', '/dashboard', '/api/:path*'],
};

function pedirLogin() {
  return new Response('Acesso reservado à equipa de coordenação ON-RE@L.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Dashboard ON-RE@L", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

function lerUtilizadores() {
  const bruto = (process.env.PORTAL_USERS || '').trim().replace(/^["']|["']$/g, '');
  const mapa = new Map();
  for (const par of bruto.split(',')) {
    const i = par.indexOf(':');
    if (i === -1) continue;
    const user = par.slice(0, i).trim().replace(/^["']|["']$/g, '');
    const pass = par.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (user && pass) mapa.set(user, pass);
  }
  return mapa;
}

function lerCredenciais(auth) {
  const binario = atob(auth.slice(6));
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
  const texto = new TextDecoder('utf-8').decode(bytes);
  const i = texto.indexOf(':');
  if (i === -1) return null;
  return { user: texto.slice(0, i).trim(), pass: texto.slice(i + 1) };
}

export default function middleware(request) {
  const utilizadores = lerUtilizadores();
  if (utilizadores.size === 0) {
    return new Response('Dashboard ainda não configurado.', { status: 503 });
  }
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) return pedirLogin();
  let cred;
  try { cred = lerCredenciais(auth); } catch { return pedirLogin(); }
  if (!cred || utilizadores.get(cred.user) !== cred.pass) return pedirLogin();
}
