// ==========================================
// IMPORTS
import { CONFIG } from "./config/environment";
import { Messenger } from "./network/messenger";
import { SimulationCoordinator } from "./simulation/coordinator";

// ==========================================
// INITIALIZATION

const messenger = new Messenger();
const coordinator = new SimulationCoordinator(messenger);

messenger.initNetwork((topic, msg) =>
{
    try
    {
        const data = JSON.parse(msg.toString());

        if (data.id === CONFIG.PENDULUM.ID)
            return;

        switch (topic)
        {
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
    catch (parseErr)
    {
        console.warn(`Failed to parse peer message payload:`, parseErr);
    }
})
.then(() =>
{
    // After network is ready we launch the simulation
    coordinator.start();
})
.catch(err =>
{
    console.error("Failed to initialize network layer", err);
});