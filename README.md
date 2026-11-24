# OptiFérias

Planejador inteligente de férias para brasileiros. Descubra as melhores datas para tirar férias maximizando dias de descanso ao cruzar seu saldo com feriados, pontos facultativos e fins de semana.

## Funcionalidades

- **Otimização automática** — calcula quais datas de início rendem mais dias off por dia de saldo gasto
- **Divisão em 2 períodos** — respeita a CLT (um período ≥ 14 dias, outro ≥ 5 dias)
- **Divisão personalizada** — digite sua própria combinação (ex: `14+16`)
- **Filtro "a partir de"** — busca apenas cenários futuros a partir de uma data
- **Feriados nacionais + estaduais** — cobertura completa via dataset embutido + API opcional
- **Feriados municipais** — suporte a cidades específicas (ex: Cataguases/MG)
- **Autocomplete de cidades** — sugestões em tempo real via API do IBGE
- **Calendário visual** — veja os dias de férias marcados no calendário
- **100% frontend** — não requer servidor, roda direto no navegador
- **Design minimalista** — sem dependências de UI, CSS puro

## Regras da CLT implementadas

- **Art. 134 §1º** — fracionamento em até 2 períodos (um ≥ 14, outro ≥ 5)
- **Art. 134 §3º** — proibição de iniciar férias 2 dias antes de feriado ou domingo
- **DSR** — domingos considerados como descanso semanal remunerado

## Pré-requisitos

- Node.js 18+
- npm 9+

## Como rodar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

## API de feriados (opcional)

Por padrão o sistema calcula os feriados nacionais (inclusive os móveis, a partir da Páscoa) para qualquer ano e usa um dataset local para estaduais e municipais. Para dados mais precisos (especialmente feriados estaduais), configure uma chave da [feriadosapi.com](https://feriadosapi.com).

A feriadosapi.com não libera CORS, então o navegador consulta a função serverless `api/feriados.ts`, que chama a API com a chave guardada no servidor. Configure a variável **`FERIADOS_API_KEY`** (sem prefixo `VITE_`) nas Environment Variables do projeto na Vercel. Para testar localmente com a função, use `vercel dev` com a chave no `.env`. Com `npm run dev`, o app usa apenas o fallback local.

O plano gratuito cobre feriados nacionais, estaduais e das 27 capitais (60 req/min).

## Estrutura

```
api/
└── feriados.ts        # Função serverless (Vercel): proxy para a feriadosapi.com
src/
├── components/        # UI (Form, ResultCard, CalendarView, CityInput...)
├── engine/            # Motor de cálculo (splits, calendário, otimizador, API)
├── data/              # Dados estáticos (feriados municipais, cidades)
├── App.tsx            # Componente raiz com split layout
└── index.tsx          # Entry point
```

## Tecnologias

React + Vite + TypeScript · CSS puro · API IBGE · feriadosapi.com

## Licença

MIT
