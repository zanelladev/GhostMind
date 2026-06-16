# GhostMind

Simulador de perseguição e fuga com agentes inteligentes em labirinto, inspirado no Pac-Man
(Projeto N3 — Inteligência Artificial). Veja o conceito completo em
[docs/GhostMind_Pitch_N3.md](docs/GhostMind_Pitch_N3.md).

- **Fantasmas (caçadores):** busca **A\*** com heurística de distância de Manhattan, replanejando a
  cada passo. Três personalidades sobre o mesmo motor, apenas com alvos diferentes:
  perseguidor (`C`), emboscador (`A`) e cauteloso (`U`).
- **Pac-Man (fugitivo):** busca **Greedy Best-First** — decisões rápidas e "boas o suficiente".
- **Pílula de poder:** inverte os papéis; os fantasmas passam a fugir (Greedy) e podem ser capturados.
- **Naive Bayes:** classifica o nível de ameaça do estado (seguro / risco / crítico) e ajusta a
  postura do Pac-Man autônomo entre coletar e fugir. Treinado em-browser, na inicialização, com
  estados simulados rotulados.
- **Modos:** IA (Pac-Man autônomo) e Jogador (setas / WASD).
- **Painel de métricas:** nós expandidos, custo do caminho e tempo de cálculo por agente — evidencia
  A\* × Greedy ao vivo.

A estética segue o design system de [DESIGN.md](DESIGN.md) ("parchment terminal"): superfícies de
papel quente, controles monocromáticos, e cor apenas nos elementos do jogo.

## Arquitetura

O **motor de jogo** (`lib/game/`) é TypeScript puro, sem React/DOM — testável e portável. A camada
de **apresentação** (`app/`, `components/`, `hooks/`) apenas renderiza o estado e envia comandos.

```
lib/game/
  search/   # heuristics, astar, greedy (frontier best-first compartilhada)
  agents/   # ghost (personalidades), pacman (IA + jogador)
  nb/       # gaussianNB, features, train
  engine.ts # regras, power mode, colisões  ·  maze.ts, types.ts
hooks/useGameLoop.ts        # loop de timestep fixo + input + classificador NB
components/                 # GameCanvas, ControlPanel, MetricsPanel, ThreatBadge
```

## Rodando

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # suíte Vitest (motor de busca, agentes, engine, Naive Bayes)
npm run build    # build de produção
```
