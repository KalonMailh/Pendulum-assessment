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