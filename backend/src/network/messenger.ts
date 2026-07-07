import { Publisher, Subscriber } from "zeromq";
import { CONFIG } from "../config/environment";

export class Messenger
{
    // ==========================================
    // NETWORK CONFIGURATION (ZeroMQ Proxy)
    private pubSocket = new Publisher();
    private subSocket = new Subscriber();

    constructor() { }

    // ZeroMQ Network initialisation
    async initNetwork(onMessageReceived: (topic: string, msg: Buffer) => void)
    {
        // Publisher binding
        this.pubSocket.connect(`tcp://127.0.0.1:${CONFIG.NETWORK.PROXY_IN_PORT}`);
        this.subSocket.connect(`tcp://127.0.0.1:${CONFIG.NETWORK.PROXY_OUT_PORT}`);

        // Subscribe to everything
        this.subSocket.subscribe("");

        console.log(`Configured Proxy Ports -> IN (Pub): #${CONFIG.NETWORK.PROXY_IN_PORT} | OUT (Sub): #${CONFIG.NETWORK.PROXY_OUT_PORT}`);

        this.listenToPeers(onMessageReceived);
    }

    // Sending message
    async sendSystemMessage(type: "STOP" | "STOP_RESET" | "RESTART" | "PAUSE" | "PLAY")
    {
        const payload = { id: CONFIG.PENDULUM.ID, type: type, timestamp: Date.now() };

        try
        {
            await this.pubSocket.send(["pendulum_system", JSON.stringify(payload)]);
            console.log(`Sent ${type} broadcast.`);
        } catch (err)
        {
            console.error(`Failed to send ${type} message`, err);
        }
    }

    async sendStatusMessage(payload: object)
    {
        try
        {
            // ZeroMQ sending
            await this.pubSocket.send(["pendulum_status", JSON.stringify(payload)]);
        } catch (err)
        {
            console.error("Failed to send ZMQ message", err);
        }
    }

    // Listener
    async listenToPeers(onMessageReceived: (topic: string, msg: Buffer) => void)
    {
        try
        {
            for await (const [topic, msg] of this.subSocket)
            {
                if (!msg || msg.length === 0)
                    continue;

                if (!topic)
                    continue;

                onMessageReceived(topic.toString(), msg);
            }
        }
        catch (err)
        {
            console.error(`Error in ZMQ subscriber loop:`, err);
        }
    }
}