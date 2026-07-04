@echo off

:: Launch Proxy
start "ZMQ Central Proxy" cmd /k "cd backend && npx tsx src/proxy.ts"

:: Break 
timeout /t 1 /nobreak > nul

echo Launching 5 independent pendulum servers...

:: Server 1
set PORT=3001
set PENDULUM_ID=1
set PENDULUM_INIT_ANGLE=45
set PENDULUM_LENGTH=150
set PENDULUM_MASS=10
set PENDULUM_RADIUS=10
set ANCHOR_X=10
set ANCHOR_Y=200
start "Server Pendulum 1" cmd /k "cd backend && npm run start"

:: Server 2
set PORT=3002
set PENDULUM_ID=2
set PENDULUM_INIT_ANGLE=45
set PENDULUM_LENGTH=50
set PENDULUM_MASS=20
set PENDULUM_RADIUS=10
set ANCHOR_X=30
set ANCHOR_Y=200
start "Server Pendulum 2" cmd /k "cd backend && npm run start"

:: Server 3
set PORT=3003
set PENDULUM_ID=3
set PENDULUM_INIT_ANGLE=45
set PENDULUM_LENGTH=110
set PENDULUM_MASS=30
set PENDULUM_RADIUS=10
set ANCHOR_X=40
set ANCHOR_Y=200
start "Server Pendulum 3" cmd /k "cd backend && npm run start"

:: Server 4
set PORT=3004
set PENDULUM_ID=4
set PENDULUM_INIT_ANGLE=45
set PENDULUM_LENGTH=100
set PENDULUM_MASS=50
set PENDULUM_RADIUS=10
set ANCHOR_X=70
set ANCHOR_Y=200
start "Server Pendulum 4" cmd /k "cd backend && npm run start"

:: Server 5
set PORT=3005
set PENDULUM_ID=5
set PENDULUM_INIT_ANGLE=45
set PENDULUM_LENGTH=100
set PENDULUM_MASS=80
set PENDULUM_RADIUS=10
set ANCHOR_X=110
set ANCHOR_Y=200
start "Server Pendulum 5" cmd /k "cd backend && npm run start"

echo All 5 servers triggered!
pause