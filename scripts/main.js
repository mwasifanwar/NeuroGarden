class NeuroGarden {
    constructor() {
        this.eegProcessor = new EEGProcessor();
        this.ecosystem = new Ecosystem();
        this.renderer = new NeuroRenderer();
        this.isRunning = false;
        this.startTime = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderer.init();
        this.gameLoop();
    }

    setupEventListeners() {
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.connectEEG();
        });

        document.getElementById('startBtn').addEventListener('click', () => {
            this.startEcosystem();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetEcosystem();
        });
    }

    connectEEG() {
        this.eegProcessor.initialize().then(success => {
            if (success) {
                this.updateStatus('EEG Connected - Ready to Start');
                document.getElementById('startBtn').disabled = false;
            } else {
                this.updateStatus('EEG Connection Failed - Using Simulated Data');
                document.getElementById('startBtn').disabled = false;
            }
        });
    }

    startEcosystem() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.ecosystem.initialize();
        this.updateStatus('Ecosystem Active - Brainwaves Influencing Growth');
    }

    resetEcosystem() {
        this.isRunning = false;
        this.ecosystem.reset();
        this.updateStatus('Ecosystem Reset - Ready to Start');
        this.updateStats();
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    updateStats() {
        const focus = this.eegProcessor.getFocusLevel();
        const meditation = this.eegProcessor.getMeditationLevel();
        const lifeForms = this.ecosystem.getLifeFormCount();
        const age = Math.floor((Date.now() - this.startTime) / 1000);

        document.getElementById('focusLevel').textContent = focus + '%';
        document.getElementById('meditationLevel').textContent = meditation + '%';
        document.getElementById('lifeFormCount').textContent = lifeForms;
        document.getElementById('ecosystemAge').textContent = age + 's';

        const state = this.ecosystem.getCurrentState();
        document.getElementById('currentState').textContent = state;
    }

    gameLoop() {
        if (this.isRunning) {
            const eegData = this.eegProcessor.getCurrentData();
            this.ecosystem.update(eegData);
            this.renderer.render(this.ecosystem);
            this.updateStats();
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new NeuroGarden();
});