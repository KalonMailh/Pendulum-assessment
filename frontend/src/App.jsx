import { Button, Stack } from '@mui/material';
import React, { useEffect, useRef } from 'react';

function App() {
    // References declaration
    const canvasRef = useRef(null);
    const activePendulums = useRef(new Map());

    // HTTP sending functions linked to buttons
    async function onStartButtonClicked()
    {
        console.log("Start button clicked!");
        await sendControl('restart');
    }

    async function onPauseButtonClicked()
    {
        console.log("Pause button clicked!");
        await sendControl('pause');
    }

    async function onStopButtonClicked()
    {
        console.log("Stop button clicked!");

        // If you configured a /api/simulation/stop route on the backend:
        try
        {
            await fetch(`http://localhost:4000/api/simulation/stop`, { method: 'POST' });
        }
        catch (err)
        {
            console.error("STOP command error:", err);
        }
    }

    // Generic fetch function (cleaned from TypeScript typing for the .jsx file)
    const sendControl = async (action) =>
    {
        try
        {
            await fetch(`http://localhost:4000/api/simulation/${action}`, { method: 'POST' });
        }
        catch (err)
        {
            console.error("HTTP command error:", err);
        }
    };

    // 3. Managing the WebSocket stream and the animation render loop
    useEffect(() =>
    {
        const ws = new WebSocket('ws://localhost:8081');

        ws.onmessage = (event) =>
        {
            const pendulum = JSON.parse(event.data);
            activePendulums.current.set(pendulum.id, pendulum);
        };

        let animationFrameId;

        const renderLoop = () =>
        {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // If global positions from getGlobalPosition() are already in pixels, set scale = 1.
            // If they are in meters (e.g., 1.5m), set scale = 150.
            const scaleX = 1;
            const scaleY = 1;

            const offsetX = 80;
            const offsetY = 50;

            // Color palette managed by the Frontend
            const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"];

            activePendulums.current.forEach((node) =>
            {
                const srcAnchorX = node.anchorX !== undefined ? node.anchorX : 0;
                const srcAnchorY = node.anchorY !== undefined ? node.anchorY : 200;

                // 1. SINGLE SCALE: 1 meter in physics = 180 pixels on screen
                const pixelScale = 180;

                // Global offset to center the entire group inside the Canvas
                const offsetX = 80;
                const offsetY = 40;

                // 2. ANCHOR POSITION (Strictly proportional to the Backend)
                const screenAnchorX = offsetX + (srcAnchorX * pixelScale);
                const screenAnchorY = offsetY; // Aligned on a horizontal line at the top

                // 3. RELATIVE MOVEMENT EXTRACTION AND SCALING
                const localX = node.x - srcAnchorX;
                const localY = Math.abs(node.y - srcAnchorY);

                const screenX = screenAnchorX + (localX * pixelScale);
                const screenY = screenAnchorY + (localY * pixelScale);

                // 4. SPHERE RADIUS (Strictly proportional to the Backend)
                const physicalRadius = node.radius !== undefined ? node.radius : 0.15;
                const screenRadius = physicalRadius * pixelScale;

                // ==========================================
                // CANVAS RENDERING (Unchanged)
                // ==========================================
                ctx.beginPath();
                ctx.moveTo(screenAnchorX, screenAnchorY);
                ctx.lineTo(screenX, screenY);
                ctx.strokeStyle = '#bdc3c7';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(screenAnchorX, screenAnchorY, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#2c3e50';
                ctx.fill();

                const pendulumColor = colors[(node.id - 1) % colors.length] || '#9b59b6';
                ctx.beginPath();
                ctx.arc(screenX, screenY, screenRadius, 0, 2 * Math.PI);
                ctx.fillStyle = pendulumColor;
                ctx.fill();
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${Math.max(10, Math.min(13, screenRadius * 0.5))}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`P${node.id}`, screenX, screenY);
            });

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return () =>
        {
            ws.close();
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // 4. Single return block for UI rendering
    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
            <h1>Pendulum Control Panel</h1>

            {/* 3 Aligned Buttons Layout */}
            <Stack direction="row" spacing={2} style={{ marginBottom: '30px' }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={onStartButtonClicked}
                    size="large">
                    Start Simulation
                </Button>
                <Button
                    variant="contained"
                    onClick={onPauseButtonClicked}
                    size="large">
                    PAUSE
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={onStopButtonClicked}
                    size="large">
                    STOP
                </Button>
            </Stack>

            {/* Pendulum cluster rendering area below */}
            <div style={{ marginTop: '20px' }}>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    style={{ border: '2px solid #333', background: '#ffffff', borderRadius: '4px' }}
                />
            </div>
        </div>
    );
}

export default App;