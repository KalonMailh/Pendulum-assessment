import { XPublisher, XSubscriber } from "zeromq";

async function runProxy() {
    const xsub = new XSubscriber();
    const xpub = new XPublisher();

    // Enter and exit ports
    await xsub.bind("tcp://127.0.0.1:4001");
    await xpub.bind("tcp://127.0.0.1:4005");

    // Forward messages from servers (XSUB) to listeners (XPUB)
    const forwardData = async () => {
        for await (const frames of xsub) {
            try {
                await xpub.send(frames);
            }
            catch (parseErr) {
                console.warn(`Failed to forward message:`, parseErr);
            }
        }
    }

     // Forward subscription requests from listeners (XPUB) back to servers (XSUB)
    const forwardSubscriptions = async () =>
    {
        for await (const frames of xpub)
        {
            await xsub.send(frames);
        }
    };

    // Run both background loops concurrently
    await Promise.all([forwardData(), forwardSubscriptions()]);
}

runProxy().catch(err => console.error("[ZMQ Proxy] Error:", err));