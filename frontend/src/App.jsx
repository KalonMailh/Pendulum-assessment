import { Button, Stack } from '@mui/material';

function App() {
    const handleStartClick = () => {
        console.log("Start button clicked!");
    };

    const handlePauseClick = () => {
        console.log("Pause button clicked!");
    };

    const handleStopClick = () => {
        console.log("Stop button clicked!");
    };

    return (
        
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h1>Pendulum Control Panel</h1>
            <Stack direction="row" spacing={2}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleStartClick}
                    size="large">
                    Start Simulation
                </Button>
                <Button
                    variant="contained"
                    onClick={handlePauseClick}>
                    PAUSE
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleStopClick}
                    size="large">
                    STOP
                </Button>
            </Stack>
        </div>
        
    );
}

export default App;