document.addEventListener('DOMContentLoaded', function() {
    // Initialize Tone.js
    const players = {
        piano: new Tone.PolySynth(Tone.Synth).toDestination(),
        guitar: new Tone.PolySynth(Tone.MonoSynth).toDestination(),
        xylophone: new Tone.MetalSynth().toDestination(),
        drums: new Tone.MembraneSynth().toDestination(),
        synth: new Tone.PolySynth(Tone.FMSynth).toDestination(),
        bass: new Tone.PolySynth(Tone.AMSynth).toDestination()
    };

    // Set initial instrument
    let currentInstrument = 'piano';
    
    // DSP Effects
    const reverb = new Tone.Reverb(2).toDestination();
    const delay = new Tone.PingPongDelay("8n", 0.2).toDestination();
    const distortion = new Tone.Distortion(0.4).toDestination();
    
    // Connect effects
    players.piano.connect(reverb);
    players.piano.connect(delay);
    players.piano.connect(distortion);
    
    // Initialize charts
    const waveformCtx = document.getElementById('waveform').getContext('2d');
    const spectrumCtx = document.getElementById('spectrum').getContext('2d');
    
    const waveformChart = new Chart(waveformCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 100}, (_, i) => i),
            datasets: [{
                label: 'Waveform',
                data: Array(100).fill(0),
                borderColor: '#ff9800',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: -1,
                    max: 1
                }
            },
            animation: {
                duration: 0
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    const spectrumChart = new Chart(spectrumCtx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 20}, (_, i) => `${(i+1)*100}Hz`),
            datasets: [{
                label: 'Frequency Spectrum',
                data: Array(20).fill(0),
                backgroundColor: '#9c27b0',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Generate sensor controls
    const sensorGrid = document.querySelector('.sensor-grid');
    const sensorBars = document.querySelector('.sensor-bars');
    const keyboard = document.querySelector('.keyboard');
    
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];
    const colors = ['#6a1b9a', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4'];
    
    notes.forEach((note, i) => {
        // Create sensor controls
        const sensorControl = document.createElement('div');
        sensorControl.className = 'sensor-control';
        sensorControl.innerHTML = `
            <label>Sensor ${i+1}</label>
            <label>Note: <select class="note-select">
                <option value="C4">C</option>
                <option value="D4">D</option>
                <option value="E4">E</option>
                <option value="F4">F</option>
                <option value="G4">G</option>
                <option value="A4">A</option>
                <option value="B4">B</option>
                <option value="C5">C (high)</option>
            </select></label>
            <label>Sensitivity: <input type="range" class="sensitivity" min="1" max="100" value="50"></label>
            <label>Threshold: <input type="range" class="threshold" min="1" max="100" value="30"></label>
        `;
        
        // Set default note
        sensorControl.querySelector('.note-select').value = note;
        sensorGrid.appendChild(sensorControl);
        
        // Create sensor bar
        const sensorBar = document.createElement('div');
        sensorBar.className = 'sensor-bar';
        sensorBar.innerHTML = `
            <div class="bar-fill" style="height: 0%; background: ${colors[i]}"></div>
            <div class="sensor-label">Sensor ${i+1}</div>
        `;
        sensorBar.dataset.sensor = i;
        sensorBars.appendChild(sensorBar);
        
        // Create keyboard key
        const key = document.createElement('div');
        key.className = 'key';
        key.textContent = note.replace('4', '');
        key.dataset.note = note;
        key.dataset.sensor = i;
        keyboard.appendChild(key);
    });
    
    // Instrument selection
    document.getElementById('instrument-select').addEventListener('change', function() {
        currentInstrument = this.value;
        
        // Update all players with new instrument settings
        Object.values(players).forEach(player => player.disconnect());
        
        switch(currentInstrument) {
            case 'piano':
                players.piano = new Tone.PolySynth(Tone.Synth).toDestination();
                break;
            case 'guitar':
                players.guitar = new Tone.PolySynth(Tone.MonoSynth).toDestination();
                break;
            case 'xylophone':
                players.xylophone = new Tone.MetalSynth().toDestination();
                break;
            case 'drums':
                players.drums = new Tone.MembraneSynth().toDestination();
                break;
            case 'synth':
                players.synth = new Tone.PolySynth(Tone.FMSynth).toDestination();
                break;
            case 'bass':
                players.bass = new Tone.PolySynth(Tone.AMSynth).toDestination();
                break;
        }
        
        // Reconnect effects
        players[currentInstrument].connect(reverb);
        players[currentInstrument].connect(delay);
        players[currentInstrument].connect(distortion);
    });
    
    // Effect toggles
    document.getElementById('reverb-toggle').addEventListener('change', function() {
        if(this.checked) {
            players[currentInstrument].connect(reverb);
        } else {
            players[currentInstrument].disconnect(reverb);
        }
    });
    
    document.getElementById('delay-toggle').addEventListener('change', function() {
        if(this.checked) {
            players[currentInstrument].connect(delay);
        } else {
            players[currentInstrument].disconnect(delay);
        }
    });
    
    document.getElementById('distortion-toggle').addEventListener('change', function() {
        if(this.checked) {
            players[currentInstrument].connect(distortion);
        } else {
            players[currentInstrument].disconnect(distortion);
        }
    });
    
    // Effect amount controls
    document.getElementById('reverb-amount').addEventListener('input', function() {
        reverb.wet.value = this.value;
    });
    
    document.getElementById('delay-amount').addEventListener('input', function() {
        delay.wet.value = this.value;
    });
    
    document.getElementById('distortion-amount').addEventListener('input', function() {
        distortion.wet.value = this.value;
    });
    
    // Simulation controls
    let simulationInterval;
    document.getElementById('simulate-btn').addEventListener('click', function() {
        if(simulationInterval) clearInterval(simulationInterval);
        
        simulationInterval = setInterval(() => {
            const randomSensor = Math.floor(Math.random() * 6);
            triggerSensor(randomSensor, Math.random() * 50 + 50);
        }, 500);
    });
    
    document.getElementById('stop-btn').addEventListener('click', function() {
        if(simulationInterval) clearInterval(simulationInterval);
    });
    
    // Function to trigger a sensor
    function triggerSensor(sensorIndex, intensity) {
        const sensorBar = document.querySelector(`.sensor-bar[data-sensor="${sensorIndex}"] .bar-fill`);
        const key = document.querySelector(`.key[data-sensor="${sensorIndex}"]`);
        const noteSelect = document.querySelectorAll('.note-select')[sensorIndex];
        const note = noteSelect.value;
        
        // Update UI
        sensorBar.style.height = `${intensity}%`;
        key.classList.add('active');
        
        // Play note
        if(players[currentInstrument]) {
            players[currentInstrument].triggerAttackRelease(note, "8n");
        }
        
        // Update waveform
        updateWaveform();
        updateSpectrum();
        
        // Reset after short delay
        setTimeout(() => {
            sensorBar.style.height = '0%';
            key.classList.remove('active');
        }, 200);
    }
    
    // Function to update waveform visualization
    function updateWaveform() {
        const newData = Array.from({length: 100}, () => Math.random() * 2 - 1);
        waveformChart.data.datasets[0].data = newData;
        waveformChart.update();
    }
    
    // Function to update spectrum visualization
    function updateSpectrum() {
        const newData = Array.from({length: 20}, () => Math.random() * 100);
        spectrumChart.data.datasets[0].data = newData;
        spectrumChart.update();
    }
    
    // Allow manual triggering by clicking sensor bars
    document.querySelectorAll('.sensor-bar').forEach(bar => {
        bar.addEventListener('click', function() {
            const sensorIndex = parseInt(this.dataset.sensor);
            triggerSensor(sensorIndex, Math.random() * 50 + 50);
        });
    });
    
    // Initialize with a piano sound
    players.piano.volume.value = -10;
});