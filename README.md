# Distributed Pendulum Simulation Cluster

A distributed physics simulation showcasing real-time synchronization, consensus-driven state management, and narrow-phase collision detection across a multi-node cluster using **Node.js, TypeScript, and ZeroMQ**.

## Core Architecture

- **5 Simulation Nodes:** Each server runs an independent instance of a physical pendulum simulation managed by a `SimulationCoordinator`.
- **ZeroMQ Pub/Sub Proxy:** Nodes broadcast their physical coordinates (`pendulum_status`) and orchestration commands (`pendulum_system`) asynchronously using a central proxy.
- **Distributed Collision Detection:** Nodes perform narrow-phase collision checks in parallel using the **Separating Axis Theorem (SAT)**. An impact detected by any single node triggers a cluster-wide barrier synchronization to safely stop, reset, and simultaneously restart the simulation.

## Current Project State & Limitations

> ⚠️ **Front-End & Back-End Integration:** Due to time constraints, the user interface (Front-End) is currently **disconnected** from the simulation cluster backend. The HTTP API bridge (`/api/simulation/pause`, etc.) is fully scaffolded on the backend architecture but requires network binding on the client side.

---

## Quick Start

### 1. Prerequisites
Ensure you have [PM2](https://pm2.keymetrics.io/) installed globally to manage the distributed cluster process lifecycle.
```bash
	npm install pm2 -g

### 2. Launching the Simulation Backend Cluster
Navigate to the server/cluster directory and use the PM2 ecosystem configuration to spin up the 5 synchronized nodes instantly:

	Bash
	cd pendulum
	pm2 start ecosystem.config.js

For stop it 
	pm2 delete ecosystem.config.js

### 3. Launching the Front-End Interface
To view the UI components locally (isolated from live data for now), spin up the local development server:

	Bash
	npm run dev
```

## 🤖 AI Assistant Disclaimer

An AI assistant was used during this project as an architectural sounding board. The tool was leveraged to validate network protocol trade-offs, design a multi-process orchestration strategy, and accelerate structural refactoring.

### Engineering Workflow & Key Prompts:

1. **Network Protocol Evaluation (UDP vs. Alternatives for Telemetry)**
   *Context: Initial architectural reflection on choosing the right transport layer to broadcast physical coordinates in real-time with maximum scalabilty and minimal latency.*
   * **Prompt:** *"Pour synchroniser en temps réel un cluster de pendules, je pensais partir sur un réseau UDP pour garantir la scalabilité et éviter l'overhead de TCP. Quels sont les protocoles ou bibliothèques modernes qui me permettraient de gérer ça proprement sans réinventer la roue sur la fiabilité des messages ?"*

2. **Cluster Orchestration & Multi-Process Architecture (PM2 Setup)**
   *Context: Designing a scalable runtime environment where each pendulum runs in an isolated OS process rather than multi-threading inside a single instance.*
   * **Prompt:** *"Je souhaite instancier mes 5 nœuds de simulation de manière isolée pour simuler un vrai cluster distribué. Comment configurer un orchestrateur comme PM2 via un fichier `ecosystem.config.js` pour injecter dynamiquement des variables d'environnement uniques (IDs, coordonnées d'ancres) à chaque processus au démarrage ?"*

3. **Backend Refactoring & Structural Decoupling**
   *Context: Migrating the initial network-heavy proof of concept into a clean, modular, and maintainable Object-Oriented architecture.*
   * **Prompt:** *"Je veux isoler proprement la logique réseau ZeroMQ dans une classe `Messenger` et confier la gestion d'état et la boucle physique à un `SimulationCoordinator`. Comment structurer le lien entre ces deux composants ?"*

4. **State Machine Extension (Play / Pause / Synchronized Stop)**
   *Context: Implementing cluster-wide barrier synchronization mechanisms when a collision or external event occurs.*
   * **Prompt:** *"Comment concevoir les transitions d'états dans mon coordinateur pour différencier un `PAUSE` purement local (gel de la physique) d'un `STOP` global distribué qui doit forcer tous les nœuds à se synchroniser avant un restart ?"*
