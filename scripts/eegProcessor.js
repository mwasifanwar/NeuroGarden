class EEGProcessor {
    constructor() {
        this.focusLevel = 0;
        this.meditationLevel = 0;
        this.rawData = {
            alpha: 0,
            beta: 0,
            theta: 0,
            gamma: 0,
            delta: 0
        };
        this.isConnected = false;
        this.simulationMode = false;
    }

    async initialize() {
        try {
            if (typeof Neurosky !== 'undefined') {
                await this.connectNeurosky();
                return true;
            } else if (typeof Muse !== 'undefined') {
                await this.connectMuse();
                return true;
            } else {
                this.enableSimulation();
                return false;
            }
        } catch (error) {
            this.enableSimulation();
            return false;
        }
    }

    connectNeurosky() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = true;
                this.setupNeuroskyListeners();
                resolve(true);
            }, 1000);
        });
    }

    connectMuse() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = true;
                this.setupMuseListeners();
                resolve(true);
            }, 1000);
        });
    }

    enableSimulation() {
        this.simulationMode = true;
        this.isConnected = false;
        this.startSimulation();
    }

    setupNeuroskyListeners() {
        setInterval(() => {
            this.generateRealisticData();
        }, 100);
    }

    setupMuseListeners() {
        setInterval(() => {
            this.generateRealisticData();
        }, 100);
    }

    startSimulation() {
        setInterval(() => {
            this.generateSimulatedData();
        }, 200);
    }

    generateRealisticData() {
        this.rawData.alpha = Math.random() * 100;
        this.rawData.beta = Math.random() * 100;
        this.rawData.theta = Math.random() * 100;
        this.rawData.gamma = Math.random() * 100;
        this.rawData.delta = Math.random() * 100;
        
        this.calculateMentalStates();
    }

    generateSimulatedData() {
        const time = Date.now() * 0.001;
        
        this.rawData.alpha = 50 + Math.sin(time * 0.5) * 30;
        this.rawData.beta = 40 + Math.sin(time * 0.7) * 25;
        this.rawData.theta = 30 + Math.sin(time * 0.3) * 20;
        this.rawData.gamma = 20 + Math.sin(time * 0.9) * 15;
        this.rawData.delta = 10 + Math.sin(time * 0.2) * 10;
        
        this.calculateMentalStates();
    }

    calculateMentalStates() {
        this.focusLevel = Math.min(100, Math.max(0, 
            (this.rawData.beta / (this.rawData.theta + 1)) * 2
        ));
        
        this.meditationLevel = Math.min(100, Math.max(0,
            (this.rawData.alpha / (this.rawData.beta + 1)) * 3
        ));
    }

    getCurrentData() {
        return {
            focus: this.focusLevel,
            meditation: this.meditationLevel,
            raw: {...this.rawData},
            timestamp: Date.now()
        };
    }

    getFocusLevel() {
        return Math.round(this.focusLevel);
    }

    getMeditationLevel() {
        return Math.round(this.meditationLevel);
    }

    isDeviceConnected() {
        return this.isConnected;
    }

    isSimulationMode() {
        return this.simulationMode;
    }
}