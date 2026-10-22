# Chess Engine & Piece Interaction Network (Vue 3)

A modern, high-performance chess application featuring an interactive engine dashboard modeled after the sketch wireframe, complete with real-time piece interaction network analysis, depth-based engine telemetry metrics, and a dedicated project landing homepage for NED University SE Department (SE-25038, SE-25090).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural directions confirmed during Phase 1 have been synthesized into this specification:
> - **Framework Transition**: Configured for **Vue 3 + Vite** with TypeScript and Tailwind CSS, replacing the initial boilerplate.
> - **Wireframe Rule Handling**: The handwritten rules from the sketch (real piece assets, interactive colorful network with arrows, legend modal `(i)`, sticky left board panel, engine telemetry with live numbers, and automatic board flip by player color) will be implemented as functional mechanics rather than displayed as literal text on the UI.
> - **Navigation Architecture**: A polished, dedicated **Landing Homepage** introduces the NED University SE Department research project with a prominent *"Play Against Engine"* CTA seamlessly navigating into the full **Engine Dashboard**.

- **Confirmed Decision 1**: Switch build and component layer to Vue 3 (`@vitejs/plugin-vue`).
- **Confirmed Decision 2**: Board auto-flips to chosen player color; piece interaction network uses SVG chess symbols and color-coded attack (crimson) and defense (emerald) vectors.
- **Confirmed Decision 3**: Complete telemetry pipeline showing live Evaluation Score, Visited Nodes, Pruned Branches, Engine Latency (ms), and ranked Move Ordering.

---

## 1. Overview & Core Concept

- **What It Does**: A complete web-based chess engine interface. Users can play against an embedded minimax engine with alpha-beta pruning, inspect tactical piece relationships (defends, attacks, pins) in an interactive graph, and monitor live search tree telemetry.
- **Target Audience / Persona**: Students, faculty, and chess enthusiasts exploring algorithmic decision-making, move ordering heuristics, and visual piece interaction networks.
- **Key Value**: Bridges visual board play with real-time engine telemetry and graph-theoretic piece interaction analysis in an intuitive, responsive Vue 3 application.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Homepage & Orientation**:
   - Hero section presenting the **ChessEngine** project by NED University SE Department (SE-25038, SE-25090).
   - Highlighting three core pillars: *Alpha-Beta Minimax Engine*, *Piece Interaction Network*, and *Real-Time Telemetry & Move Ordering*.
   - Direct Call-to-Action button *"Launch Engine"* (plus quick-start options: White / Black, Depth 1–7).
2. **Game Setup & Configuration**:
   - Navigation bar with `New Game` modal (choose side White/Black, starting time, preset puzzles) and `Depth = 5` dropdown selector (Depth 1 to 7).
   - Clocks for Engine and Player (10:00 active countdown on turn).
3. **Board Play & Sticky Left Panel**:
   - High-fidelity chessboard with algebraic coordinate labels (1–8, a–h), smooth piece drag-and-drop / click-to-move, and legal move indicators.
   - Panel stays sticky on desktop viewport while the right analysis pane scrolls if needed.
   - Material balance badge (e.g., `♟️ +3`) and active turn indicator.
4. **Piece Interaction Network (Top Right Card)**:
   - Dynamic canvas / SVG network graph representing pieces on the board and their interactions:
     - Directed emerald arrows for **Defends** (e.g., `bK` defends `bP`).
     - Directed red/crimson arrows for **Attacks** (e.g., `wB` attacks `bP`, `wQ` attacks `bP`).
     - Real piece vector icons for nodes with color badges for White and Black.
   - Info button `(i)` opening a comprehensive slide-over or modal with the **Network Legend & Interpretation Guide**.
5. **Telemetry & Metrics (Bottom Right Card)**:
   - Split layout matching the sketch:
     - **Left Column**: Live Eval Score (centipawns/mate), Nodes Visited, Pruned Branches, Search Latency (ms).
     - **Right Column**: Move Ordering preview (e.g., `1. Nf3`, `2. e4`, `3. d4`).
6. **Footer / Attribution**:
   - Clean, institutional credits: `NED University SE Department` · `SE-25038, SE-25090`.

### Visual Identity & Theme

- **Aesthetic Direction**: Academic precision meets sleek tournament digital board. Dark slate canvas with rich wooden/amber tournament board accents.
- **Color Palette & Mood**:
  - Background Neutral: Deep Charcoal Slate (`#0B0F17` / `#111827`)
  - Surface Containers: Elevated Slate (`#1E293B`, `#182234`) with subtle 1px border (`#334155`)
  - Board Light Squares: Warm Cream Ivory (`#EEEED2` or `#E2E8F0`)
  - Board Dark Squares: Forest Tournament Green (`#769656` or `#475569`)
  - Network Attack Arrows: Crimson Red (`#EF4444`)
  - Network Defense Arrows: Emerald Green (`#10B981`)
  - Telemetry Accents: Cyan & Amber (`#06B6D4`, `#F59E0B`)
- **Typography & Hierarchy**:
  - Primary / Display: `Plus Jakarta Sans` / `Inter`
  - Telemetry & Coordinates: `font-mono tabular-nums` for precise timer and metrics alignment
- **Motion & Responsive Feedback**:
  - Routine interactions $\le 200\text{ms}$.
  - Smooth arrow animations in the interaction network upon board move completion.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Vue 3 Integration**:
  - *Chosen Approach*: Update `vite.config.ts` to use `@vitejs/plugin-vue`, install `vue`, and build Vue 3 SFC (`.vue`) components with `<script setup lang="ts">`.
  - *Why*: Direct alignment with user's explicit preference ("Switch the project setup to Vue 3").
- **Decision 2: Rule Engine & Minimax Evaluation**:
  - *Chosen Approach*: Use `chess.js` for strict FEN move validation, legal move generation, and checkmate/stalemate detection; pair with an in-browser alpha-beta minimax search worker/heuristic that computes node counts, branch prunings, move ordering, and evaluation in centipawns.
  - *Why*: Guaranteed bug-free chess rules (en passant, castling, promotion) combined with authentic live engine metrics requested in the wireframe.
- **Decision 3: Piece Interaction Graph Construction**:
  - *Chosen Approach*: Parse the board square-by-square after every half-move, calculate ray attacks, pawn captures, knight hops, and defensive reinforcements to construct an SVG directed interaction network with real piece symbols.
  - *Why*: Provides the exact visual structure drawn in the sketch (`bK` defends `bP`, `wB` attacks `bP`, `wQ` attacks `bP`).

---

## 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────┐
│                          App.vue                              │
│       ┌──────────────────────┴──────────────────────┐         │
│       ▼                                             ▼         │
│  [ HomeLanding.vue ]                     [ ChessEngineView.vue ]
│  • Project Overview                      • Topbar (New Game, Depth)
│  • NED SE Dept Showcase                  • Clocks & Auto-Flip Board
│  • Quick Launch Config                   • Sticky Left Board Card
└─────────────────────────────────────────────────────┬─────────┘
                                                      │
              ┌───────────────────────────────────────┴──────────────────────────────────────┐
              ▼                                                                              ▼
  ┌─────────────────────────────┐                                ┌──────────────────────────────────────────────┐
  │   PieceInteractionCard.vue  │                                │             TelemetryCard.vue                │
  │ • Real SVG piece glyphs     │                                │ • Eval Score (e.g. +1.42)                    │
  │ • Attack vectors (Red)      │                                │ • Nodes Visited (e.g. 14,290)                │
  │ • Defense vectors (Green)   │                                │ • Pruned Branches (e.g. 3,842)               │
  │ • Legend Modal (i) Button   │                                │ • Latency in ms (e.g. 34ms)                  │
  └─────────────────────────────┘                                │ • Move Ordering list (1. Nf3, 2. e4, 3. d4) │
                                                                 └──────────────────────────────────────────────┘
```

### State Model & Reactive Stores

- `gameState`: FEN string, move history, turn (`'w'` | `'b'`), selected square, legal moves, game status (active, check, checkmate, draw).
- `engineConfig`: `depth: number` (1–7), `playerColor: 'w' | 'b'`, `isThinking: boolean`.
- `timers`: `whiteTime: number`, `blackTime: number`, `activeTimer: 'w' | 'b' | null`.
- `telemetry`: `evalScore: number`, `nodesVisited: number`, `prunedBranches: number`, `latencyMs: number`, `moveOrdering: Array<{ san: string, score: number }>`.
- `interactionNetwork`: Directed graph nodes `{ id, piece, color, square, x, y }` and edges `{ from, to, type: 'attacks' | 'defends', color }`.

---

## 5. Verification Plan

1. **Compilation & Build**:
   - Install Vue 3 dependencies (`vue`, `@vitejs/plugin-vue`, `chess.js`).
   - Run `compile_applet` to verify clean compilation without TypeScript or bundler errors.
2. **UI & Feature Tests**:
   - Verify Landing Homepage loads cleanly with NED SE Department credentials.
   - Click "Launch Engine" to verify seamless transition to the wireframe view.
   - Verify Chessboard displays accurate piece assets and coordinates (1–8, a–h).
   - Make moves as White and Black; verify board auto-flip option works.
   - Verify Engine computes moves at chosen depth with live updating Telemetry (Eval Score, Nodes Visited, Pruned Branches, Latency ms, Move Ordering).
   - Verify Piece Interaction Network updates with real piece assets, color-coded arrows, and interactive Legend modal `(i)`.
   - Verify left board card remains sticky when scrolling right panels on desktop.
