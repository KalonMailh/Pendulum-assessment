import { Button, Stack } from '@mui/material';

function App() {
    async function onStartButtonClicked()
    {
        console.log("Start button clicked!");
    };

    async function onPauseButtonClicked()
    {
        console.log("Pause button clicked!");
    };

    async function onStopButtonClicked()
    {
        console.log("Stop button clicked!");
    };

    return (
        
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h1>Pendulum Control Panel</h1>
            <Stack direction="row" spacing={2}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={onStartButtonClicked}
                    size="large">
                    Start Simulation
                </Button>
                <Button
                    variant="contained"
                    onClick={onPauseButtonClicked}>
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
        </div>
        
    );
}

export default App;