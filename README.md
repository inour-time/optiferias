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

Por padrão o sistema usa um dataset local de feriados. Para dados mais precisos (especialmente feriados estaduais), configure uma chave da [feriadosapi.com](https://feriadosapi.com):

```bash
cp .env.example .env
# Edite .env e adicione sua chave:
# VITE_FERIADOS_API_KEY=fapi_sua_chave_aqui
```

O plano gratuito cobre feriados nacionais, estaduais e das 27 capitais (60 req/min).

## Estrutura

```
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
