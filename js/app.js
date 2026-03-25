// Main application logic
import { Storage, simpleHash, getChicagoDateStringFromDate, getChicagoWeekday } from './storage.js';
import { AI } from './ai.js';
import { getRandomShortMessage, getDailyMessage, getDailyMessageCount } from './messages.js';

const GOAL_BOTTLES = 5;
const BOTTLE_OZ = 16.9;

class HydrationApp {
    constructor() {
        this.currentImage = null;
        this.currentImageHash = null;
        this.lastShortIndex = null;
        this.chart = null;
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadSettings();
        Storage.performDailyResetIfNeeded();
        this.refreshUI();
        this.initChart();
        this.checkDailyReset();

        // Check for reset every minute in case the app is open across midnight
        setInterval(() => Storage.performDailyResetIfNeeded(), 60 * 1000);
    }

    bindElements() {
        this.elements = {
            progressFill: document.getElementById('progress-fill'),
            currentBottles: document.getElementById('current-bottles'),
            remaining: document.getElementById('remaining'),
            messageCard: document.getElementById('message-card'),
            shortMessage: document.getElementById('short-message'),
            dailyText: document.getElementById('daily-text'),
            uploadArea: document.getElementById('upload-area'),
            imageInput: document.getElementById('image-input'),
            preview: document.getElementById('preview'),
            submitBtn: document.getElementById('submit-btn'),
            historyList: document.getElementById('history-list'),
            weekChart: document.getElementById('week-chart'),
            settingsBtn: document.getElementById('settings-btn'),
            settingsModal: document.getElementById('settings-modal'),
            apiKeyInput: document.getElementById('api-key'),
            saveSettings: document.getElementById('save-settings'),
            closeModal: document.getElementById('close-modal')
        };
    }

    bindEvents() {
        this.elements.uploadArea.addEventListener('click', () => this.elements.imageInput.click());
        this.elements.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.elements.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.elements.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.elements.imageInput.addEventListener('change', this.handleFileSelect.bind(this));
        this.elements.submitBtn.addEventListener('click', this.handleSubmit.bind(this));
        this.elements.settingsBtn.addEventListener('click', () => this.toggleSettings(true));
        this.elements.saveSettings.addEventListener('click', this.saveSettings.bind(this));
        this.elements.closeModal.addEventListener('click', () => this.toggleSettings(false));
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) this.toggleSettings(false);
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.elements.uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImage(file);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processImage(file);
        }
    }

    processImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            const hash = simpleHash(base64);

            if (Storage.hasImageHash(hash)) {
                alert('This image has already been used recently. Please take a new photo.');
                return;
            }

            this.currentImage = base64;
            this.currentImageHash = hash;
            this.elements.preview.src = base64;
            this.elements.preview.classList.remove('hidden');
            this.elements.submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    async handleSubmit() {
        if (!this.currentImage) return;

        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.textContent = 'Analyzing...';

        try {
            const result = await AI.analyzeBottle(this.currentImage);
            const log = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                imageHash: this.currentImageHash,
                percentage: result.percentage,
                ozAmount: result.ozAmount,
                messageIndex: Storage.getDailyMessageIndex()
            };

            Storage.addLog(log);
            Storage.addImageHash(this.currentImageHash);

            // Update messages
            const newIndex = Storage.incrementDailyMessageIndex();
            this.updateMessages(newIndex);

            // Reset UI
            this.currentImage = null;
            this.currentImageHash = null;
            this.elements.preview.src = '';
            this.elements.preview.classList.add('hidden');
            this.elements.imageInput.value = '';
            this.elements.submitBtn.textContent = 'Submit';

            this.refreshUI();
            this.triggerConfetti();
            this.showSuccessAnimation(result.ozAmount);

        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Failed to analyze image: ' + error.message + '\n\nMake sure you have a valid OpenRouter API key in settings.');
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.textContent = 'Submit';
        }
    }

    updateMessages(index) {
        // Short message - new random
        const short = getRandomShortMessage(this.lastShortIndex);
        this.lastShortIndex = short.index;
        this.animateMessageChange(this.elements.shortMessage, short.message);

        // Daily progressive message
        const daily = getDailyMessage(index);
        const progress = Math.min(index + 1, getDailyMessageCount());
        const total = getDailyMessageCount();
        this.elements.dailyText.textContent = `[${progress}/${total}] ${daily.message}`;
    }

    animateMessageChange(element, newText) {
        gsap.to(element, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                element.textContent = newText;
                gsap.to(element, { opacity: 1, duration: 0.3 });
            }
        });
    }

    calculateProgress() {
        const logs = Storage.getTodayLogs();
        const totalOz = logs.reduce((sum, log) => sum + log.ozAmount, 0);
        const totalBottles = totalOz / BOTTLE_OZ;
        const goalBottles = GOAL_BOTTLES;
        const percentage = Math.min((totalBottles / goalBottles) * 100, 100);
        return {
            totalBottles: Math.round(totalBottles * 10) / 10,
            remainingBottles: Math.max(0, Math.round((goalBottles - totalBottles) * 10) / 10),
            percentage,
            reachedGoal: totalBottles >= goalBottles
        };
    }

    refreshUI() {
        const progress = this.calculateProgress();

        // Update progress bar
        gsap.to(this.elements.progressFill, {
            width: `${progress.percentage}%`,
            duration: 0.8,
            ease: "back.out(1.7)"
        });

        // Update text
        this.elements.currentBottles.textContent = progress.totalBottles.toFixed(1);
        this.elements.remaining.textContent = `Remaining: ${progress.remainingBottles.toFixed(1)} bottles`;

        // Update daily message
        const currentIndex = Storage.getDailyMessageIndex();
        this.updateMessages(currentIndex);

        // Render history
        this.renderHistory();

        // Update chart
        this.updateChart();

        // Show congratulations if goal reached
        if (progress.reachedGoal && !this.goalReachedToday) {
            this.goalReachedToday = true;
            this.showGoalReached();
        }
    }

    renderHistory() {
        const logs = Storage.getTodayLogs();
        if (logs.length === 0) {
            this.elements.historyList.innerHTML = '<p class="empty-state">No drinks logged yet today</p>';
            return;
        }

        const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.elements.historyList.innerHTML = sortedLogs.map(log => `
            <div class="history-item">
                <span class="history-time">${new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span class="history-amount">${log.ozAmount.toFixed(1)} oz (${Math.round(log.percentage)}%)</span>
            </div>
        `).join('');
    }

    initChart() {
        const ctx = this.elements.weekChart.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Bottles per day',
                    data: [],
                    backgroundColor: 'rgba(79, 189, 186, 0.6)',
                    borderColor: 'rgba(79, 189, 186, 1)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: GOAL_BOTTLES,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        this.updateChart();
    }

    updateChart() {
        if (!this.chart) return;

        const weekly = Storage.getWeeklyData();
        const days = [];
        const data = [];

        // Last 7 days based on Chicago time
        const now = Date.now();
        for (let i = 6; i >= 0; i--) {
            const past = new Date(now - i * 24 * 60 * 60 * 1000);
            const dayKey = getChicagoDateStringFromDate(past);
            const dayLabel = getChicagoWeekday(past);
            const ozAmount = weekly[dayKey] || 0;
            const bottles = ozAmount / BOTTLE_OZ;

            days.push(dayLabel);
            data.push(Number(bottles.toFixed(1)));
        }

        this.chart.data.labels = days;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    }

    showSuccessAnimation(ozAmount) {
        // Animate the progress bar glow
        gsap.fromTo(this.elements.progressFill,
            { boxShadow: '0 0 20px rgba(79, 189, 186, 0.8)' },
            { boxShadow: '0 0 0px rgba(79, 189, 186, 0)', duration: 1.5 }
        );
    }

    showGoalReached() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4fbdba', '#ff6b9d', '#48bb78']
        });

        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#4fbdba', '#ff6b9d', '#48bb78']
            });
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#4fbdba', '#ff6b9d', '#48bb78']
                });
            }, 250);
        }, 250);
    }

    triggerConfetti() {
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#4fbdba', '#ff6b9d']
        });
    }

    checkDailyReset() {
        // Ensure daily reset is performed (in case init missed it)
        Storage.performDailyResetIfNeeded();
        // Load today's message progress
        const currentIndex = Storage.getDailyMessageIndex();
        this.updateMessages(currentIndex);
    }

    loadSettings() {
        const apiKey = Storage.getAPIKey();
        this.elements.apiKeyInput.value = apiKey;
    }

    toggleSettings(show) {
        if (show) {
            this.elements.settingsModal.classList.add('active');
        } else {
            this.elements.settingsModal.classList.remove('active');
        }
    }

    saveSettings() {
        const apiKey = this.elements.apiKeyInput.value.trim();
        if (apiKey) {
            Storage.setAPIKey(apiKey);
            this.toggleSettings(false);
            alert('Settings saved!');
        } else {
            alert('Please enter a valid API key.');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HydrationApp();
});
