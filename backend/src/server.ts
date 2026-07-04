// Server

// Import class
import { Pendulum } from "./Pendulum";
import { Point2D } from "./Point2D";

// Environment variables
const PORT = Number(process.env.PORT) || 3001;
const PENDULUM_ID = Number(process.env.PENDULUM_ID) || 1;
const PENDULUM_INIT_ANGLE = Number(process.env.PENDULUM_INIT_ANGLE) || 1;
const PENDULUM_LENGTH = Number(process.env.PENDULUM_LENGTH) || 1;
const PENDULUM_MASS = Number(process.env.PENDULUM_MASS) || 1;
const ANCHOR_X = Number(process.env.ANCHOR_X) || 0;
const ANCHOR_Y = Number(process.env.ANCHOR_Y) || 0;

// Variables
const FPS = 60;
const deltaTime = 1 / FPS; // 0.0166 secondes
const pendulumAnchor: Point2D = { x: ANCHOR_X, y: ANCHOR_Y };


const myPendulum = new Pendulum(PENDULUM_ID, PENDULUM_INIT_ANGLE, PENDULUM_LENGTH, PENDULUM_MASS, pendulumAnchor);


console.log(`[Server] Starting instance for Pendulum #${PENDULUM_ID} on port ${PORT}...`);

// Launch simulation Loop
setInterval(() => {

    myPendulum.update(deltaTime);

    const pos = myPendulum.getGlobalPosition();

    console.log(`Pendulum #${myPendulum.id} - Angle: ${(myPendulum.angle * (180 / Math.PI)).toFixed(1)} Deg | Global Pos: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}`);

}, deltaTime * 1000); // every 16 millisecondes