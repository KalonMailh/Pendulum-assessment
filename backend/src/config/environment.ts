// ==========================================
// CONFIGURATION & ENVIRONMENT VARIABLES

export const CONFIG =
{
    // Network instance port for this specific server
    PORT: Number(process.env.PORT) || 3001,

    // Anchor position and physical properties of the pendulum
    PENDULUM:
    {
        ID: Number(process.env.PENDULUM_ID) || 1,
        ANCHOR_X: Number(process.env.ANCHOR_X) || 0,
        ANCHOR_Y: Number(process.env.ANCHOR_Y) || 0,
        INIT_ANGLE: Number(process.env.PENDULUM_INIT_ANGLE) || 1,
        LENGTH: Number(process.env.PENDULUM_LENGTH) || 1,
        MASS: Number(process.env.PENDULUM_MASS) || 1,
        RADIUS: Number(process.env.PENDULUM_RADIUS) || 1 // Used as the bounding radius for collisions
    },

    // NETWORK CONFIGURATION (ZeroMQ Proxy)
    NETWORK:
    {
        PROXY_IN_PORT: Number(process.env.PROXY_IN_PORT) || 4001,
        PROXY_OUT_PORT: Number(process.env.PROXY_OUT_PORT) || 4005
    },

    // PHYSICS ENGINE PARAMETERS
    PHYSICS:
    {
        FPS: 60,
        DELTA_TIME: 1 / 60 // Approximately 0.0166 seconds
    }
}