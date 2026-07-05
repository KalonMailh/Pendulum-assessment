// Server

// ==========================================
// IMPORTS
import { Publisher, Subscriber } from "zeromq";
import { Circle, Vector, Response, testCircleCircle } from "sat-ts";
import { Pendulum } from "./Pendulum";
import { Point2D } from "./Point2D";
import pm2 from 'pm2';

// ==========================================
// CONFIGURATION & ENVIRONMENT VARIABLES

// Network instance port for this specific server
const PORT = Number(process.env.PORT) || 3001;

// Anchor position and physical properties of the pendulum
const ANCHOR_X = Number(process.env.ANCHOR_X) || 0;
const ANCHOR_Y = Number(process.env.ANCHOR_Y) || 0;
const PENDULUM_ID = Number(process.env.PENDULUM_ID) || 1;
const PENDULUM_INIT_ANGLE = Number(process.env.PENDULUM_INIT_ANGLE) || 1;
const PENDULUM_LENGTH = Number(process.env.PENDULUM_LENGTH) || 1;
const PENDULUM_MASS = Number(process.env.PENDULUM_MASS) || 1;
const PENDULUM_RADIUS = Number(process.env.PENDULUM_RADIUS) || 1; // Used as the bounding radius for collisions

// ==========================================
// PHYSICS ENGINE PARAMETERS

const FPS = 60;
const deltaTime = 1 / FPS; // Approximately 0.0166 seconds

// ==========================================
// PHYSICAL OBJECTS INSTANTIATION

const pendulumAnchor: Point2D = { x: ANCHOR_X, y: ANCHOR_Y };
const myPendulum = new Pendulum(PENDULUM_ID, PENDULUM_INIT_ANGLE, PENDULUM_LENGTH, PENDULUM_MASS, pendulumAnchor);

// ==========================================
// NETWORK CONFIGURATION (ZeroMQ Proxy)

const PROXY_IN_PORT = Number(process.env.PROXY_IN_PORT) || 4001;
const PROXY_OUT_PORT = Number(process.env.PROXY_OUT_PORT) || 4005;

const pubSocket = new Publisher();
const subSocket = new Subscriber();

console.log(`[Network] Configured Proxy Ports -> IN (Pub): #${PROXY_IN_PORT} | OUT (Sub): #${PROXY_OUT_PORT}`);

// ==========================================
// STATE MANAGEMENT & SYNCHRONIZATION

// Local simulation loop states
let isSimulationRunning = true;
let loopInterval: NodeJS.Timeout | null = null;

// Cluster Memory
// For tracking who sent RESTART
const serverKnown = new Set<number>();
// list of server known
const serverReadyToRestart = new Set<number>();


// ZeroMQ Network initialisation
async function initNetwork()
{
    // Publisher binding
    pubSocket.connect(`tcp://127.0.0.1:${PROXY_IN_PORT}`);
    subSocket.connect(`tcp://127.0.0.1:${PROXY_OUT_PORT}`);

    // Subscribe to everything
    subSocket.subscribe("");

    listenToPeers();
}

// Sending message
async function sendSystemMessage(type: "STOP" | "RESTART") {
    const payload = { id: PENDULUM_ID, type: type, timestamp: Date.now() };

    try
    {
        await pubSocket.send(["pendulum_system", JSON.stringify(payload)]);
        console.log(`Sent ${type} broadcast.`);

    } catch (err) {
        console.error(`Failed to send ${type} message`, err);
    }
}

// Local stop
function handleLocalStop(triggeredByMe: boolean) {

    if (!isSimulationRunning)
        return;

    isSimulationRunning = false;

    if (loopInterval) {
        clearInterval(loopInterval);
        loopInterval = null;
    }

    console.log(`\n SIMULATION HALTED (${triggeredByMe ? "trigger by me" : "NOT trigger by me"})`);

    // If trigger by me, I send the information to other servers
    if (triggeredByMe)
    {
        sendSystemMessage("STOP");

        // Wait 2 second
        setTimeout(() =>
        {
            sendRestartSignal();
        }, 2000);
    }
}

// Send restart
function sendRestartSignal() {
    console.log(`Sending RESTART status...`);
    sendSystemMessage("RESTART");

    // Server noted as ready
    serverReadyToRestart.add(PENDULUM_ID);
    checkAllPeersReady();
}

// Check if all server are ready
function checkAllPeersReady() {

    const totalRequired = serverKnown.size + 1;

    console.log(`Readiness: ${serverReadyToRestart.size}/${totalRequired} server ready.`);

    if (serverReadyToRestart.size >= totalRequired && totalRequired > 1)
    {
        console.log(`\nAll instances ready! Restarting in 5 seconds...\n`);

        setTimeout(() => 
        {
            serverReadyToRestart.clear();

            // Reset to initial angle
            myPendulum.angle = PENDULUM_INIT_ANGLE; 
            // Reset Velocity
            myPendulum.angularVelocity = 0;

            startSimulationLoop();

            isSimulationRunning = true;
        }, 5000);
    }
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

            if (!topic)
                continue;

            try
            {
                const data = JSON.parse(msg.toString());

                if (data.id === PENDULUM_ID)
                    continue;

                // Save server id
                serverKnown.add(data.id);

                switch (topic.toString()) {

                    case "pendulum_system":
                        switch (data.type) {
                            case "STOP":
                                handleLocalStop(false);
                                break;

                            case "RESTART":
                                console.log(` -> Received RESTART signal from Node #${data.id}`);

                                // If I have not sent 'RESTART' yet, I must do it
                                if (!serverReadyToRestart.has(PENDULUM_ID)) {
                                    console.log(`Acknowledging master restart. Sending my RESTART...`);
                                    sendSystemMessage("RESTART");

                                    // I add myself in the list, as ready
                                    serverReadyToRestart.add(PENDULUM_ID); 
                                }

                                // Add server id that sent RESTART to the list
                                serverReadyToRestart.add(data.id);

                                checkAllPeersReady();
                                break;
                        }
                        break;

                    case "pendulum_status":
                        // Position message
                        console.log(` -> Received Peer Data: Pendulum #${data.id} is at X:${data.x.toFixed(2)} and has radius:${data.r}`);

                        if (isSimulationRunning)
                        {
                            const otherPendulumPosition: Point2D = { x: data.x, y: data.y };
                            collisionDetection(otherPendulumPosition, data.r);
                        }
                        break;

                    default:
                        console.warn(`Network - Unhandled ZMQ topic received: ${topic}`);
                        break;
                }

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
    startSimulationLoop();
})
.catch(err =>
{
    console.error("Failed to initialize network layer", err);
});


function startSimulationLoop() {

    if (loopInterval)
        clearInterval(loopInterval);

    isSimulationRunning = true;
    console.log("BOOTING SIMULATION !");

    loopInterval = setInterval(async () => {
        myPendulum.update(deltaTime);
        const pos = myPendulum.getGlobalPosition();

        console.log(`Pendulum #${myPendulum.id} - Angle: ${(myPendulum.angle * (180 / Math.PI)).toFixed(1)} Deg | Global Pos: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}`);

        const payload = {
                id: myPendulum.id,
                type: "STATUS",
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
    }, deltaTime * 1000);
}


async function collisionDetection(pendulumPosition: Point2D, pendulumRadius: number)
{
    if (!isSimulationRunning || !pendulumPosition || pendulumRadius === 0)
        return;

    const pos = myPendulum.getGlobalPosition();
    var response = new Response();

    // Create circle
    const thisPendulumPosition = new Circle(new Vector(pos.x, pos.y), PENDULUM_RADIUS);
    const externalPendulumPosition = new Circle(new Vector(pendulumPosition.x, pendulumPosition.y), pendulumRadius);

    // Collision test
    if (testCircleCircle(thisPendulumPosition, externalPendulumPosition, response))
    {
        console.log(`COLLISION: Pendule #${PENDULUM_ID}!`);
        handleLocalStop(true);
    }
}

// START cluster
function startCluster() {
    pm2.connect((err) => {
        if (err) {
            console.error(err);
            return;
        }

        pm2.start('ecosystem.config.js', (err, apps) => {
            pm2.disconnect();
            if (err) console.error("Error during cluster launch", err);
        });
    });
}

// STOP cluster
function stopCluster() {
    pm2.connect((err) => {
        if (err) return;

        pm2.stop('ecosystem.config.js', (err) => {
            pm2.disconnect();
            if (err) console.error("Erreur during cluster stop", err);
        });
    });
}

