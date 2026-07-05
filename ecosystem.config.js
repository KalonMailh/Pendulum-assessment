module.exports = {
    apps: [
        // -----------------------------------------------------------------
        // CENTRAL PROXY
        {
            name: 'ZMQ-Central-Proxy',
            script: './node_modules/tsx/dist/cli.mjs',
            args: 'src/proxy.ts',
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
                PENDULUM_LENGTH: 150,
                PENDULUM_MASS: 10,
                PENDULUM_RADIUS: 15,
                ANCHOR_X: 10,
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
                PENDULUM_LENGTH: 50,
                PENDULUM_MASS: 20,
                PENDULUM_RADIUS: 15,
                ANCHOR_X: 30,
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
                PENDULUM_INIT_ANGLE: 30,
                PENDULUM_LENGTH: 110,
                PENDULUM_MASS: 30,
                PENDULUM_RADIUS: 15,
                ANCHOR_X: 40,
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
                PENDULUM_INIT_ANGLE: -30,
                PENDULUM_LENGTH: 100,
                PENDULUM_MASS: 50,
                PENDULUM_RADIUS: 15,
                ANCHOR_X: 70,
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
                PENDULUM_LENGTH: 100,
                PENDULUM_MASS: 80,
                PENDULUM_RADIUS: 15,
                ANCHOR_X: 110,
                ANCHOR_Y: 200,
            }
        }
    ],
};