// ==========================================
// IMPORTS
import { CONFIG } from "./config/environment";
import { Messenger } from "./network/messenger";
import { SimulationCoordinator } from "./simulation/coordinator";
import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import cors from "cors";

// ==========================================
// INITIALIZATION

const messenger = new Messenger();
const coordinator = new SimulationCoordinator(messenger);

// Variable for web server
let frontClients: WebSocket[] = [];

messenger.initNetwork((topic, msg) => {
    try {
        const data = JSON.parse(msg.toString());

        // Frontend Link
        // We intercept EVERYTHING passing through the ZMQ proxy and immediately forward it to the Frontend

        if (CONFIG.PENDULUM.ID === 1 && topic === "pendulum_status" && frontClients.length > 0)
        {
            const data = JSON.parse(msg.toString());

            const frontPayload = JSON.stringify({
                id: data.id,
                x: data.x,
                y: data.y,
                anchorX: data.anchorX,
                anchorY: data.anchorY,
                radius: data.r
            });

            frontClients.forEach(client =>
            {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(frontPayload);
                }
            });
        }

        if (data.id === CONFIG.PENDULUM.ID)
            return;

        switch (topic) {
            case "pendulum_system":
                coordinator.handlePeerSystemMessage(data.type, data.id);
                break;

            case "pendulum_status":
                coordinator.handlePeerStatusMessage(data);
                break;

            default:
                console.warn(`Network - Unhandled ZMQ topic received: ${topic}`);
                break;
        }
    }
    catch (parseErr) {
        console.warn(`Failed to parse peer message payload:`, parseErr);
    }
})
.then(() => {
    // After network is ready we launch the simulation
    coordinator.start();


    // FRONTEND SERVERS INITIALIZATION (once)
    if (CONFIG.PENDULUM.ID === 1) {

        // WebSocket Server
        const wss = new WebSocketServer({ port: 8081 });
        wss.on('connection', (ws) =>
        {
            frontClients.push(ws);
            ws.on('close', () => frontClients = frontClients.filter(c => c !== ws));
        });

        console.log(`WebSocket Server running on port 8081 (Node 1 Hub)`);

        // HTTP Server (API for Play / Pause buttons)
        const app = express();
        app.use(cors());
        app.use(express.json());

        app.post("/api/simulation/pause", (req, res) =>
        {
            console.log("[API] HTTP Request: PAUSE cluster");
            messenger.sendSystemMessage("PAUSE");
            res.sendStatus(200);
        });

        app.post("/api/simulation/restart", (req, res) =>
        {
            console.log("[API] HTTP Request: RESTART cluster");
            messenger.sendSystemMessage("RESTART");
            res.sendStatus(200);
        });

        app.listen(4000, () =>
        {
            console.log(`[FRONT] HTTP API Server running on port 4000 (Node 1 Hub)`);
        });
    }
})
.catch(err => {
    console.error("Failed to initialize network layer", err);
});