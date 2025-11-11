class Ecosystem {
    constructor() {
        this.lifeForms = [];
        this.environment = {
            energy: 50,
            stability: 75,
            diversity: 0,
            temperature: 25,
            age: 0
        };
        this.evolutionHistory = [];
        this.isInitialized = false;
    }

    initialize() {
        this.lifeForms = [];
        this.environment = {
            energy: 50,
            stability: 75,
            diversity: 0,
            temperature: 25,
            age: 0
        };
        this.evolutionHistory = [];
        this.isInitialized = true;
        
        this.createInitialLifeForms();
    }

    createInitialLifeForms() {
        for (let i = 0; i < 3; i++) {
            this.lifeForms.push(this.createRandomLifeForm());
        }
        this.updateDiversity();
    }

    createRandomLifeForm() {
        const types = ['plant', 'fungus', 'crystal', 'energy'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        return new LifeForm({
            type: type,
            position: {
                x: (Math.random() - 0.5) * 20,
                y: (Math.random() - 0.5) * 20,
                z: (Math.random() - 0.5) * 20
            },
            size: 0.5 + Math.random() * 1.5,
            energy: 50 + Math.random() * 50,
            traits: this.generateRandomTraits()
        });
    }

    generateRandomTraits() {
        return {
            growthRate: Math.random(),
            reproductionRate: Math.random() * 0.1,
            energyEfficiency: Math.random(),
            movementSpeed: Math.random(),
            colorVariation: Math.random(),
            complexity: Math.random()
        };
    }

    update(eegData) {
        if (!this.isInitialized) return;

        this.environment.age++;
        this.processEEGInfluence(eegData);
        this.updateLifeForms();
        this.updateEnvironment();
        this.handleEvolution();
        this.cleanup();
    }

    processEEGInfluence(eegData) {
        const focus = eegData.focus / 100;
        const meditation = eegData.meditation / 100;
        
        this.environment.energy += (focus * 2 - 1) * 0.5;
        this.environment.stability += (meditation * 2 - 1) * 0.3;
        this.environment.temperature += (focus - 0.5) * 0.2;
        
        this.environment.energy = Math.max(0, Math.min(100, this.environment.energy));
        this.environment.stability = Math.max(0, Math.min(100, this.environment.stability));
        this.environment.temperature = Math.max(-10, Math.min(40, this.environment.temperature));
    }

    updateLifeForms() {
        this.lifeForms.forEach(lifeForm => {
            lifeForm.update(this.environment);
            
            if (lifeForm.shouldReproduce()) {
                const offspring = lifeForm.reproduce();
                if (offspring) {
                    this.lifeForms.push(offspring);
                }
            }
        });
    }

    updateEnvironment() {
        this.environment.energy -= this.lifeForms.length * 0.01;
        this.environment.energy = Math.max(0, this.environment.energy);
        this.updateDiversity();
    }

    updateDiversity() {
        const typeCount = new Set(this.lifeForms.map(lf => lf.type)).size;
        this.environment.diversity = (typeCount / 10) * 100;
    }

    handleEvolution() {
        if (this.environment.age % 100 === 0 && this.lifeForms.length > 0) {
            const evolvedForm = this.evolveLifeForm();
            if (evolvedForm) {
                this.lifeForms.push(evolvedForm);
                this.evolutionHistory.push({
                    timestamp: Date.now(),
                    lifeForm: evolvedForm,
                    trigger: 'natural'
                });
            }
        }
    }

    evolveLifeForm() {
        if (this.lifeForms.length === 0) return null;
        
        const parent = this.lifeForms[Math.floor(Math.random() * this.lifeForms.length)];
        const mutationRate = (100 - this.environment.stability) / 200;
        
        return parent.mutate(mutationRate);
    }

    cleanup() {
        this.lifeForms = this.lifeForms.filter(lifeForm => 
            lifeForm.energy > 0 && lifeForm.age < 1000
        );
    }

    reset() {
        this.isInitialized = false;
        this.lifeForms = [];
        this.environment = {
            energy: 50,
            stability: 75,
            diversity: 0,
            temperature: 25,
            age: 0
        };
        this.evolutionHistory = [];
    }

    getLifeFormCount() {
        return this.lifeForms.length;
    }

    getCurrentState() {
        if (!this.isInitialized) return "Ecosystem inactive";
        
        const energyState = this.environment.energy < 20 ? "Low Energy" : 
                           this.environment.energy > 80 ? "High Energy" : "Stable Energy";
        
        const diversityState = this.environment.diversity < 30 ? "Low Diversity" :
                             this.environment.diversity > 70 ? "High Diversity" : "Moderate Diversity";
        
        return `${energyState} | ${diversityState} | ${this.lifeForms.length} Life Forms`;
    }

    getLifeForms() {
        return this.lifeForms;
    }

    getEnvironment() {
        return {...this.environment};
    }
}