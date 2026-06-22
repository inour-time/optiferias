# OptiFérias — Plano Completo

## Diretório do Projeto
```
C:\Users\Matheus Meigre\Documents\Ferramentas e Estudos\OptiFerias
```

## Stack Tecnológica

| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | React + Vite + TypeScript | Pedido do usuário |
| Estilo | CSS puro (sem libs) | Minimalismo, zero dependências |
| API de feriados | [feriadosapi.com](https://feriadosapi.com) (plano free) | Nacionais + estaduais grátis, 60 req/min |
| API Key | `.env` (`VITE_FERIADOS_API_KEY`) | Segurança, não versionar |
| Dados municipais | JSON estático em `src/data/` | Cataguases não é capital (API paga), dados obtidos via pesquisa |

## Regras da CLT Implementadas

### Fracionamento (Art. 134 §1º)
- Exatamente 2 períodos por split
- Um período ≥ 14 dias, o outro ≥ 5 dias
- Geração dinâmica para qualquer saldo N
- UI: cada split é um checkbox selecionável

### Restrição de Início (Art. 134 §3º)
> "É vedado o início das férias no período de dois dias que antecede feriado ou dia de repouso semanal remunerado."

- Data de início S é INVÁLIDA se S-1 ou S-2 for feriado ou domingo

### DSR (Descanso Semanal Remunerado)
- Apenas domingos

## Feriados Municipais — Cataguases/MG

| Data | Dia | Feriado | Tipo |
|---|---|---|---|
| 22/05/2026 | sexta | Santa Rita de Cássia (Padroeira) | Municipal |
| 07/09/2026 | segunda | Aniversário de Cataguases | Municipal |

Feriado estadual MG: 21/04 — Data Magna de Minas Gerais.

## Algoritmo de Otimização

```
Para cada split (A, B):
  Para cada startDate S no ano:
    1. Validar §3(S)
    2. Calcular extensão reversa (dias não-úteis antes de S)
    3. Calcular extensão frente (dias não-úteis depois de S+A-1)
    4. totalBreak = reversa + A + frente
    5. eficiência = totalBreak / A
  Guardar top 10 para A e B
  Combinar topA + topB → cenários ranqueados por eficiência total
```

## Estrutura de Arquivos

```
C:\Users\Matheus Meigre\Documents\Ferramentas e Estudos\OptiFerias\
├── .env                          # VITE_FERIADOS_API_KEY=sua_chave
├── .env.example                  # Template sem a chave
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.css
    ├── components/
    │   ├── Form.tsx
    │   ├── Form.css
    │   ├── ResultList.tsx
    │   ├── ResultList.css
    │   ├── ResultCard.tsx
    │   ├── ResultCard.css
    │   ├── CalendarView.tsx
    │   ├── CalendarView.css
    │   └── ErrorMessage.tsx
    ├── engine/
    │   ├── types.ts
    │   ├── api.ts
    │   ├── calendar.ts
    │   ├── splits.ts
    │   └── optimizer.ts
    └── data/
        └── municipios.ts
```

## Fases de Implementação

| Fase | O quê | Arquivos |
|---|---|---|
| 1 | Scaffold Vite + React + TS | package.json, configs |
| 2 | Tipos e engine básico | types.ts, splits.ts, calendar.ts |
| 3 | API client | api.ts (+ fallback local) |
| 4 | Dados municipais | municipios.ts |
| 5 | Otimizador | optimizer.ts |
| 6 | CSS global | App.css |
| 7 | Formulário | Form.tsx, Form.css |
| 8 | Resultados (lista) | ResultList.tsx, ResultCard.tsx |
| 9 | Calendário visual | CalendarView.tsx |
| 10 | App + integração | App.tsx, main.tsx |
| 11 | Testes manuais | Verificação de cenários reais |
