// Server

// Import class
import { Pendulum } from "./Pendulum";
import { Point2D } from "./Point2D";

const FPS = 60;
const deltaTime = 1 / FPS; // 0.0166 secondes

const pendulumAnchor: Point2D = { x: 0, y: 0 };



console.log("...Server Start...");


const myPendulum = new Pendulum(1, 45, 150, 1, pendulumAnchor);

// Launch simulation Loop
setInterval(() => {

    myPendulum.update(deltaTime);

    const pos = myPendulum.getLocalPosition();

    console.log(`Pendulum #${myPendulum.id} - Angle: ${(myPendulum.angle * (180 / Math.PI)).toFixed(1)} Deg | Pos: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}`);

}, deltaTime * 1000); // every 16 millisecondes