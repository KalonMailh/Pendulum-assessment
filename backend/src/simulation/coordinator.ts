import { Circle, Vector, Response, testCircleCircle } from "sat-ts";
import { CONFIG } from "../config/environment";
import { Pendulum } from "../simulation/Pendulum";
import { Point2D } from "../simulation/Point2D";
import { Messenger } from "../network/messenger";


// Manages the local physics engine loop for a single pendulum instance and synchronizes state updates
export class SimulationCoordinator
{
    private myPendulum: Pendulum;
    private isSimulationRunning = false;
    private loopInterval: NodeJS.Timeout | null = null;

    // Cluster Memory
    private serverKnown = new Set<number>();          // Tracks all active unique peer node IDs discovered in the cluster
    private serverReadyToRestart = new Set<number>();  // Tracks which nodes have acknowledged and are primed for a synchronized restart

    constructor(private messenger: Messenger)
    {
        const anchor: Point2D = { x: CONFIG.PENDULUM.ANCHOR_X, y: CONFIG.PENDULUM.ANCHOR_Y };

        this.myPendulum = new Pendulum(
            CONFIG.PENDULUM.ID,
            CONFIG.PENDULUM.INIT_ANGLE,
            CONFIG.PENDULUM.LENGTH,
            CONFIG.PENDULUM.MASS,
            anchor
        );
    }


    // Starts the local high-frequency simulation loop matching the target physics delta time.
    start()
    {
        if (this.loopInterval)
            clearInterval(this.loopInterval);

        this.isSimulationRunning = true;

        console.log(`[Simulation] Booting Pendulum #${CONFIG.PENDULUM.ID}`);

        this.loopInterval = setInterval(async () =>
        {
            // Update physical kinematics equations
            this.myPendulum.update(CONFIG.PHYSICS.DELTA_TIME);
            const pos = this.myPendulum.getGlobalPosition();

            console.log(`Pendulum #${CONFIG.PENDULUM.ID} - Angle: ${(this.myPendulum.angle * (180 / Math.PI)).toFixed(1)} Deg | Global Pos: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}`);

            const payload = {
                id: this.myPendulum.id,
                type: "STATUS",
                x: pos.x,
                y: pos.y,
                r: CONFIG.PENDULUM.RADIUS,
                timestamp: Date.now()
            };

            // Broadcast current physical coordinates to all cluster nodes for distributed collision detection
            await this.messenger.sendStatusMessage(payload);
        }, CONFIG.PHYSICS.DELTA_TIME * 1000);
    }

    
    handleStop(triggeredByMe: boolean)
    {
        if (!this.isSimulationRunning)
            return;

        this.isSimulationRunning = false;

        if (this.loopInterval)
        {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }

        console.log(`\nHALTED (${triggeredByMe ? "Triggered locally" : "Triggered by an other server"})`);

        // If triggered by me, broadcast to the network and request a delayed cluster restart sequence
        if (triggeredByMe)
        {
            this.messenger.sendSystemMessage("STOP");

            // Wait 2 seconds
            setTimeout(() => this.sendRestartSignal(), 2000);
        }
    }

    // Signals to the network that this server is stopped, reset, and waiting for others to be ready.
    sendRestartSignal()
    {
        console.log(`Sending RESTART status...`);

        this.messenger.sendSystemMessage("RESTART");
        this.serverReadyToRestart.add(CONFIG.PENDULUM.ID); // Mark self as ready
        this.checkAllPeersReady();
    }

    handlePause()
    {
        if (!this.isSimulationRunning)
            return;

        this.isSimulationRunning = false;

        // TODO : Implement PAUSE
    }

    handlePlay()
    {
        if (this.isSimulationRunning)
            return;

        this.start();
    }


    handlePeerSystemMessage(type: "STOP" | "RESTART" | "PAUSE" | "PLAY", peerId: number)
    {
        this.serverKnown.add(peerId);

        switch (type) {
            case "STOP":
                this.handleStop(false);
                break;

            case "PAUSE":
                console.log(` -> Received PAUSE signal from Node #${peerId}`);
                this.handlePause();
                break;

            case "PLAY":
                console.log(` -> Received PLAY signal from Node #${peerId}`);
                this.handlePlay();
                break;

            case "RESTART":
                console.log(` -> Received RESTART signal from Node #${peerId}`);

                // If I haven't broadcasted my own RESTART readiness yet, do it now
                if (!this.serverReadyToRestart.has(CONFIG.PENDULUM.ID)) {
                    console.log(`Acknowledging master restart. Sending my RESTART...`);

                    this.messenger.sendSystemMessage("RESTART");
                    this.serverReadyToRestart.add(CONFIG.PENDULUM.ID);
                }

                // Register the peer as ready for the countdown
                this.serverReadyToRestart.add(peerId);
                this.checkAllPeersReady();
                break;
        }
    }


    handlePeerStatusMessage(data: any)
    {
        this.serverKnown.add(data.id);

        console.log(` -> Received Peer Data: Pendulum #${data.id} is at X:${data.x.toFixed(2)} and has radius:${data.r}`);

        if (this.isSimulationRunning)
        {
            const pos = this.myPendulum.getGlobalPosition();
            const response = new Response();

            // Generate bounding volumes using Separating Axis Theorem (SAT) structures
            const thisCircle = new Circle(new Vector(pos.x, pos.y), CONFIG.PENDULUM.RADIUS);
            const externalCircle = new Circle(new Vector(data.x, data.y), data.r);

            // Execute Collision Check
            if (testCircleCircle(thisCircle, externalCircle, response))
            {
                console.log(`Intersect detected with Pendulum #${data.id}!`);
                this.handleStop(true); 
            }
        }
    }

    private checkAllPeersReady()
    {
        const totalRequired = this.serverKnown.size + 1;

        console.log(`[Sync] Readiness: ${this.serverReadyToRestart.size}/${totalRequired} engines operational.`);

        // Barrier synchronization satisfied
        if (this.serverReadyToRestart.size >= totalRequired && totalRequired > 1)
        {
            console.log(`\nAll instances synced! Resuming simulation loop in 5s...\n`);

            setTimeout(() =>
            {
                this.serverReadyToRestart.clear();

                // Reset physical state to default boundary configurations
                this.myPendulum.angle = CONFIG.PENDULUM.INIT_ANGLE;
                this.myPendulum.angularVelocity = 0;

                this.start();
            }, 5000);
        }
    }
}