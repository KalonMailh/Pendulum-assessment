module.exports = {
    apps: [
        // -----------------------------------------------------------------
        // CENTRAL PROXY
        {
            name: 'ZMQ-Central-Proxy',
            script: './node_modules/tsx/dist/cli.mjs',
            args: 'src/network/proxy.ts',
            cwd: './backend', 
            exec_mode: 'fork',
            watch: false,
        },

        // -----------------------------------------------------------------
        // PENDULUM SERVERS
        {
            name: 'Pendulum-Server-1',
            script: 'cmd.exe',
            args: '/c npm run start',
            cwd: './backend',
            exec_mode: 'fork',
            watch: false,
            shell: true,
            env: {
                PORT: 3001,
                PENDULUM_ID: 1,
                PENDULUM_INIT_ANGLE: 45,
                PENDULUM_LENGTH: 1.2,
                PENDULUM_MASS: 10,
                PENDULUM_RADIUS: 0.15,
                ANCHOR_X: 1.0,
                ANCHOR_Y: 200,
            }
        },
        {
            name: 'Pendulum-Server-2',
            script: 'cmd.exe',
            args: '/c npm run start',
            cwd: './backend',
            exec_mode: 'fork',
            watch: false,
            shell: true,
            env: {
                PORT: 3002,
                PENDULUM_ID: 2,
                PENDULUM_INIT_ANGLE: -45,
                PENDULUM_LENGTH: 1.0,
                PENDULUM_MASS: 20,
                PENDULUM_RADIUS: 0.20,
                ANCHOR_X: 1.4,
                ANCHOR_Y: 200,
            }
        },
        {
            name: 'Pendulum-Server-3',
            script: 'cmd.exe',
            args: '/c npm run start',
            cwd: './backend',
            exec_mode: 'fork',
            watch: false,
            shell: true,
            env: {
                PORT: 3003,
                PENDULUM_ID: 3,
                PENDULUM_INIT_ANGLE: -30,
                PENDULUM_LENGTH: 1.1,
                PENDULUM_MASS: 30,
                PENDULUM_RADIUS: 0.15,
                ANCHOR_X: 1.8,
                ANCHOR_Y: 200,
            }
        },
        {
            name: 'Pendulum-Server-4',
            script: 'cmd.exe',
            args: '/c npm run start',
            cwd: './backend',
            exec_mode: 'fork',
            watch: false,
            shell: true,
            env: {
                PORT: 3004,
                PENDULUM_ID: 4,
                PENDULUM_INIT_ANGLE: -60,
                PENDULUM_LENGTH: 1.3,
                PENDULUM_MASS: 50,
                PENDULUM_RADIUS: 0.25,
                ANCHOR_X: 2.3,
                ANCHOR_Y: 200,
            }
        },
        {
            name: 'Pendulum-Server-5',
            script: 'cmd.exe',
            args: '/c npm run start',
            cwd: './backend',
            exec_mode: 'fork',
            watch: false,
            shell: true,
            env: {
                PORT: 3005,
                PENDULUM_ID: 5,
                PENDULUM_INIT_ANGLE: 90,
                PENDULUM_LENGTH: 1.00,
                PENDULUM_MASS: 80,
                PENDULUM_RADIUS: 0.30,
                ANCHOR_X: 2.8,
                ANCHOR_Y: 200,
            }
        }
    ],
};