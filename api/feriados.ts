// Função serverless (Vercel) que faz proxy para a feriadosapi.com.
// - A feriadosapi.com não envia cabeçalhos CORS, então o navegador não pode chamá-la direto.
// - A chave fica só no servidor (FERIADOS_API_KEY), fora do bundle público.

const UPSTREAM = 'https://feriadosapi.com/api/v1/feriados'

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
  })
}

export async function GET(request: Request): Promise<Response> {
  const apiKey = process.env.FERIADOS_API_KEY
  if (!apiKey) {
    return json({ error: 'FERIADOS_API_KEY não configurada' }, 503)
  }

  const { searchParams } = new URL(request.url)
  const ano = searchParams.get('ano') ?? ''
  const uf = (searchParams.get('uf') ?? '').toUpperCase()

  if (!/^\d{4}$/.test(ano)) {
    return json({ error: 'Parâmetro "ano" inválido' }, 400)
  }
  if (uf && !/^[A-Z]{2}$/.test(uf)) {
    return json({ error: 'Parâmetro "uf" inválido' }, 400)
  }

  const url = uf ? `${UPSTREAM}/estado/${uf}?ano=${ano}` : `${UPSTREAM}/nacionais?ano=${ano}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(7000),
    })

    if (!res.ok) {
      return json({ error: `feriadosapi.com respondeu ${res.status}` }, 502)
    }

    const data = await res.json()
    return json(data, 200, {
      // Feriados mudam raramente: cache de 1 dia na CDN da Vercel
      'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    })
  } catch {
    return json({ error: 'Falha ao consultar feriadosapi.com' }, 502)
  }
}
