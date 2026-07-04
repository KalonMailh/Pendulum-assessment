// Server

// Import class
import { Publisher, Subscriber } from "zeromq"
import { Pendulum } from "./Pendulum";
import { Point2D } from "./Point2D";


// Environment variables Pendulum
const PORT = Number(process.env.PORT) || 3001;
const PENDULUM_ID = Number(process.env.PENDULUM_ID) || 1;
const PENDULUM_INIT_ANGLE = Number(process.env.PENDULUM_INIT_ANGLE) || 1;
const PENDULUM_LENGTH = Number(process.env.PENDULUM_LENGTH) || 1;
const PENDULUM_MASS = Number(process.env.PENDULUM_MASS) || 1;
const PENDULUM_RADIUS = Number(process.env.PENDULUM_RADIUS) || 1;           // For collision
const ANCHOR_X = Number(process.env.ANCHOR_X) || 0;
const ANCHOR_Y = Number(process.env.ANCHOR_Y) || 0;

const pendulumAnchor: Point2D = { x: ANCHOR_X, y: ANCHOR_Y };

// Variables
const FPS = 60;
const deltaTime = 1 / FPS; // 0.0166 secondes

const myPendulum = new Pendulum(PENDULUM_ID, PENDULUM_INIT_ANGLE, PENDULUM_LENGTH, PENDULUM_MASS, pendulumAnchor);



// Connexions au Proxy Central
const PROXY_IN_PORT = Number(process.env.PROXY_IN_PORT) || 4001;  // On envoie ici
const PROXY_OUT_PORT = Number(process.env.PROXY_OUT_PORT) || 4005; // On écoute ici

const pubSocket = new Publisher();
const subSocket = new Subscriber();

console.log(`PROXY_IN_PORT: #${PROXY_IN_PORT} and PROXY_OUT_PORT:#${PROXY_OUT_PORT}`);

//////////




// ZeroMQ Network initialisation
async function initNetwork()
{
    // Publisher binding
    pubSocket.connect(`tcp://127.0.0.1:${PROXY_IN_PORT}`);
    subSocket.connect(`tcp://127.0.0.1:${PROXY_OUT_PORT}`);

    // subscribe to everything
    subSocket.subscribe("");

    listenToPeers();
}

// Listener
async function listenToPeers()
{
    try
    {
        for await (const [topic, msg] of subSocket)
        {
            if (!msg || msg.length === 0)
                continue;

            try
            {
                const data = JSON.parse(msg.toString());

                if (data.id === PENDULUM_ID)
                    continue;

                console.log(` -> Received Peer Data: Pendulum #${data.id} is at X:${data.x.toFixed(2)} and have radius:${data.r}`);
            }
            catch (parseErr)
            {
                console.warn(`Failed to parse peer message payload:`, parseErr);
            }
        }
    }
    catch (err)
    {
        console.error(`Error in ZMQ subscriber loop:`, err);
    }
}

// Launch simulation Loop
initNetwork().then(() =>
{
    setInterval(async () =>
    {
        myPendulum.update(deltaTime);

        const pos = myPendulum.getGlobalPosition();

        console.log(`Pendulum #${myPendulum.id} - Angle: ${(myPendulum.angle * (180 / Math.PI)).toFixed(1)} Deg | Global Pos: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}`);



        // Data formating
        const payload = {
                id: myPendulum.id,
                x: pos.x,
                y: pos.y,
                r: PENDULUM_RADIUS,
                timestamp: Date.now()
            };

        try
        {
            // ZeroMQ sending
            await pubSocket.send(["pendulum_status", JSON.stringify(payload)]);
        }
        catch (err)
        {
            console.error("Failed to send ZMQ message", err);
        }

    }, deltaTime * 1000); // every 16 millisecondes
})
.catch(err =>
{
    console.error("Failed to initialize network layer", err);
});