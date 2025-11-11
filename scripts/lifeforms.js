class LifeForm {
    constructor(config) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = config.type;
        this.position = config.position;
        this.velocity = {
            x: (Math.random() - 0.5) * 0.1,
            y: (Math.random() - 0.5) * 0.1,
            z: (Math.random() - 0.5) * 0.1
        };
        this.size = config.size;
        this.energy = config.energy;
        this.age = 0;
        this.traits = config.traits;
        this.color = this.generateColor();
        this.geometry = this.generateGeometry();
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    generateColor() {
        const baseHue = Math.random() * 360;
        const saturation = 70 + Math.random() * 30;
        const lightness = 40 + Math.random() * 30;
        return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
    }

    generateGeometry() {
        const complexity = Math.floor(this.traits.complexity * 5) + 1;
        return {
            type: this.type,
            vertices: this.generateVertices(complexity),
            edges: this.generateEdges(complexity)
        };
    }

    generateVertices(complexity) {
        const vertices = [];
        for (let i = 0; i < complexity * 4; i++) {
            vertices.push({
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                z: (Math.random() - 0.5) * 2
            });
        }
        return vertices;
    }

    generateEdges(complexity) {
        const edges = [];
        for (let i = 0; i < complexity * 6; i++) {
            edges.push({
                start: Math.floor(Math.random() * complexity * 4),
                end: Math.floor(Math.random() * complexity * 4)
            });
        }
        return edges;
    }

    update(environment) {
        this.age++;
        this.processEnergy(environment);
        this.move();
        this.grow();
        this.energy -= 0.1;
    }

    processEnergy(environment) {
        const energyGain = this.calculateEnergyGain(environment);
        this.energy += energyGain;
        this.energy = Math.min(100, Math.max(0, this.energy));
    }

    calculateEnergyGain(environment) {
        let gain = 0;
        
        switch (this.type) {
            case 'plant':
                gain = environment.energy * 0.01 * this.traits.energyEfficiency;
                break;
            case 'fungus':
                gain = environment.stability * 0.008 * this.traits.energyEfficiency;
                break;
            case 'crystal':
                gain = Math.abs(environment.temperature - 20) * 0.005 * this.traits.energyEfficiency;
                break;
            case 'energy':
                gain = (environment.energy + environment.stability) * 0.006 * this.traits.energyEfficiency;
                break;
        }
        
        return gain;
    }

    move() {
        this.position.x += this.velocity.x * this.traits.movementSpeed;
        this.position.y += this.velocity.y * this.traits.movementSpeed;
        this.position.z += this.velocity.z * this.traits.movementSpeed;
        
        if (Math.abs(this.position.x) > 25 || Math.abs(this.position.y) > 25 || Math.abs(this.position.z) > 25) {
            this.velocity.x *= -1;
            this.velocity.y *= -1;
            this.velocity.z *= -1;
        }
    }

    grow() {
        if (this.energy > 50) {
            this.size += this.traits.growthRate * 0.01;
            this.size = Math.min(5, this.size);
        }
    }

    shouldReproduce() {
        return this.energy > 75 && Math.random() < this.traits.reproductionRate;
    }

    reproduce() {
        if (this.energy < 50) return null;
        
        this.energy *= 0.6;
        
        const offspringConfig = {
            type: this.type,
            position: {
                x: this.position.x + (Math.random() - 0.5) * 3,
                y: this.position.y + (Math.random() - 0.5) * 3,
                z: this.position.z + (Math.random() - 0.5) * 3
            },
            size: this.size * (0.8 + Math.random() * 0.4),
            energy: this.energy * 0.8,
            traits: {...this.traits}
        };
        
        this.mutateTraits(offspringConfig.traits, 0.1);
        
        return new LifeForm(offspringConfig);
    }

    mutate(mutationRate) {
        const mutatedConfig = {
            type: this.getMutatedType(),
            position: {
                x: this.position.x + (Math.random() - 0.5) * 5,
                y: this.position.y + (Math.random() - 0.5) * 5,
                z: this.position.z + (Math.random() - 0.5) * 5
            },
            size: this.size * (0.5 + Math.random()),
            energy: 50,
            traits: {...this.traits}
        };
        
        this.mutateTraits(mutatedConfig.traits, mutationRate);
        
        return new LifeForm(mutatedConfig);
    }

    getMutatedType() {
        const types = ['plant', 'fungus', 'crystal', 'energy'];
        if (Math.random() < 0.8) return this.type;
        return types[Math.floor(Math.random() * types.length)];
    }

    mutateTraits(traits, mutationRate) {
        Object.keys(traits).forEach(trait => {
            if (Math.random() < mutationRate) {
                traits[trait] = Math.max(0, Math.min(1, traits[trait] + (Math.random() - 0.5) * 0.5));
            }
        });
    }

    getMeshData() {
        return {
            position: this.position,
            size: this.size,
            color: this.color,
            geometry: this.geometry,
            rotation: this.age * this.rotationSpeed
        };
    }
}