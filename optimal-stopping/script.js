class OptimalStoppingVisualizer {
    constructor() {
        this.numCandidatesSlider = document.getElementById('num-candidates');
        this.candidatesValue = document.getElementById('candidates-value');
        this.runSimulationButton = document.getElementById('run-simulation-button');
        this.animationSpeedSlider = document.getElementById('animation-speed');
        this.candidatesGrid = document.getElementById('candidates-grid');
        this.resultsOutput = document.getElementById('results-output');
        this.statusContainer = document.getElementById('status-container');

        this.runSimulationButton.addEventListener('click', () => this.handleRunReset());
        this.numCandidatesSlider.addEventListener('input', () => this.updateSliderValue('candidates-value', this.numCandidatesSlider.value));
        this.animationSpeedSlider.addEventListener('input', () => this.updateSliderValue('status-container', `Speed: ${this.animationSpeedSlider.value}ms`));

        this.simulation = null;
        this.isSimulationRunning = false;
        this.animationCancelled = false;
    }

    updateSliderValue(elementId, text) {
        const element = document.getElementById(elementId);
        element.textContent = text;
        setTimeout(() => {
            if (element.textContent === text) {
                element.textContent = (elementId === 'status-container') ? '' : this.numCandidatesSlider.value;
            }
        }, 1500);
    }

    async handleRunReset() {
        if (this.isSimulationRunning) {
            this.resetSimulation();
        } else {
            await this.startSimulation();
        }
    }

    async startSimulation() {
        this.isSimulationRunning = true;
        this.animationCancelled = false;
        this.runSimulationButton.textContent = 'Reset Simulation';
        this.runSimulationButton.disabled = false; // Enable button for reset
        this.numCandidatesSlider.disabled = true;
        this.animationSpeedSlider.disabled = true;

        const numCandidates = parseInt(this.numCandidatesSlider.value);
        this.simulation = new OptimalStopping(numCandidates);
        this.simulation.generateCandidates();

        await this.visualizeObservationPhase();
        if (this.animationCancelled) return; 

        await this.visualizeSelectionPhase();
        if (this.animationCancelled) return; 

        this.displayResults();
        this.isSimulationRunning = false;
        this.runSimulationButton.textContent = 'Run Simulation';
        this.runSimulationButton.disabled = false;
        this.numCandidatesSlider.disabled = false;
        this.animationSpeedSlider.disabled = false;
    }

    resetSimulation() {
        this.animationCancelled = true;
        this.isSimulationRunning = false;
        this.simulation = null;
        this.candidatesGrid.innerHTML = '';
        this.resultsOutput.innerHTML = '';
        this.statusContainer.textContent = '';
        this.runSimulationButton.textContent = 'Run Simulation';
        this.runSimulationButton.disabled = false;
        this.numCandidatesSlider.disabled = false;
        this.animationSpeedSlider.disabled = false;
        this.candidatesValue.textContent = this.numCandidatesSlider.value; 
    }

    async visualizeObservationPhase() {
        this.statusContainer.textContent = 'Observation Phase...';
        for (let i = 0; i < this.simulation.sampleSize; i++) {
            if (this.animationCancelled) return; 
            this.simulation.step();
            this.visualizeCandidates();
            await this.sleep();
        }
    }

    async visualizeSelectionPhase() {
        this.statusContainer.textContent = 'Selection Phase...';
        while (!this.simulation.isFinished) {
            if (this.animationCancelled) return; 
            this.simulation.step();
            this.visualizeCandidates();
            await this.sleep();
        }
    }

    visualizeCandidates() {
        this.candidatesGrid.innerHTML = '';
        this.simulation.candidates.forEach((candidateValue, index) => {
            const candidateDiv = document.createElement('div');
            candidateDiv.classList.add('candidate');
            candidateDiv.textContent = candidateValue.toFixed(2);

            if (index < this.simulation.sampleSize) {
                candidateDiv.classList.add('sample');
            }

            if (candidateValue === this.simulation.bestInSample && this.simulation.bestInSample !== this.simulation.bestCandidate) {
                candidateDiv.classList.add('best-in-sample');
            }

            if (index === this.simulation.currentIndex - 1) {
                candidateDiv.classList.add('current');
            }

            if (candidateValue === this.simulation.chosenCandidate) {
                candidateDiv.classList.add('chosen');
            }

            if (candidateValue === this.simulation.bestCandidate) {
                candidateDiv.classList.add('best');
            }

            this.candidatesGrid.appendChild(candidateDiv);
        });
    }

    displayResults() {
        const { chosenCandidate, bestCandidate } = this.simulation;
        const success = chosenCandidate === bestCandidate;

        this.statusContainer.textContent = success ? 'Success!' : 'Failure!';

        this.resultsOutput.innerHTML = `
            <p>Absolute Best Candidate: ${bestCandidate.toFixed(4)}</p>
            <p>Chosen Candidate: ${chosenCandidate.toFixed(4)}</p>
            <p>Outcome: ${success ? 'Success' : 'Failure'}</p>
            <p>Rank of Chosen Candidate: ${this.simulation.candidates.sort((a, b) => b - a).indexOf(chosenCandidate) + 1}</p>
        `;
    }

    sleep() {
        const ms = this.animationSpeedSlider.value;
        return new Promise(resolve => {
            const timeoutId = setTimeout(() => {
                if (!this.animationCancelled) {
                    resolve();
                }
            }, ms);
            // Store timeoutId if needed for explicit clearing, though animationCancelled handles it
        });
    }
}

class OptimalStopping {
    constructor(numCandidates) {
        this.numCandidates = numCandidates;
        this.reset();
    }

    reset() {
        this.candidates = [];
        this.bestCandidate = null;
        this.sampleSize = 0;
        this.bestInSample = 0;
        this.chosenCandidate = null;
        this.currentIndex = 0;
        this.isFinished = false;
    }

    generateCandidates() {
        this.candidates = Array.from({ length: this.numCandidates }, () => Math.random());
        this.bestCandidate = Math.max(...this.candidates);
        this.sampleSize = Math.round(this.numCandidates / Math.E);
    }

    step() {
        if (this.isFinished) return;

        if (this.currentIndex < this.sampleSize) {
            if (this.candidates[this.currentIndex] > this.bestInSample) {
                this.bestInSample = this.candidates[this.currentIndex];
            }
        } else {
            if (this.candidates[this.currentIndex] > this.bestInSample) {
                this.chosenCandidate = this.candidates[this.currentIndex];
                this.isFinished = true;
            }
        }

        this.currentIndex++;

        if (this.currentIndex >= this.numCandidates) {
            this.isFinished = true;
            if (!this.chosenCandidate) {
                this.chosenCandidate = this.candidates[this.numCandidates - 1];
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OptimalStoppingVisualizer();
});