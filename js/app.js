// Main application logic
import { Storage, getChicagoDateStringFromDate, getChicagoWeekday } from './storage.js';
import { getRandomShortMessage } from './messages.js';

const GOAL_BOTTLES = 5;
const BOTTLE_OZ = 16.9;
const SIP_OZ = 0.5;

const DRINK_TYPES = {
    SIP: { amount: 0.5, confetti: 10, colors: ['#4facfe', '#00f2fe'] },
    BOTTLE: { amount: 16.9, confetti: 200, colors: ['#ff6b9d', '#c33764', '#ffd700'] }
};

class HydrationApp {
    constructor() {
        this.chart = null;
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        Storage.performDailyResetIfNeeded();
        this.loadBottleState();
        this.initChart();
        this.checkDailyReset();
        this.refreshUI();
        this.startBackgroundAnimation();
        this.updateBottleVisual(); // Ensure bottle visual is set on load

        setInterval(() => Storage.performDailyResetIfNeeded(), 60 * 1000);
    }

    loadBottleState() {
        this.currentBottleNumber = Storage.getCurrentBottleNumber();
        this.currentBottleProgress = Storage.getCurrentBottleProgress();
        
        // Validate
        if (this.currentBottleNumber < 1) this.currentBottleNumber = 1;
        if (this.currentBottleNumber > GOAL_BOTTLES) this.currentBottleNumber = GOAL_BOTTLES;
        if (this.currentBottleProgress < 0) this.currentBottleProgress = 0;
        if (this.currentBottleProgress > BOTTLE_OZ) this.currentBottleProgress = BOTTLE_OZ;
    }

    saveBottleState() {
        Storage.setCurrentBottleNumber(this.currentBottleNumber);
        Storage.setCurrentBottleProgress(this.currentBottleProgress);
    }

    bindElements() {
        this.elements = {
            progressFill: document.getElementById('progress-fill'),
            shortMessage: document.getElementById('short-message'),
            btnSip: document.getElementById('btn-sip'),
            btnBottle: document.getElementById('btn-bottle'),
            historyList: document.getElementById('history-list'),
            weekChart: document.getElementById('week-chart'),
            waterLevel: document.getElementById('water-level'),
            waterBubbles: document.getElementById('water-bubbles'),
            bottleLabel: document.getElementById('bottle-label'),
            ozLabel: document.getElementById('oz-label')
        };
    }

    bindEvents() {
        this.elements.btnSip.addEventListener('click', () => this.handleDrink('SIP'));
        this.elements.btnBottle.addEventListener('click', () => this.handleDrink('BOTTLE'));
    }

    async handleDrink(type) {
        const drink = DRINK_TYPES[type];
        const ozAmount = drink.amount;

        // Animate button and float label
        await this.animateButtonAndFloatLabel(type, ozAmount);

        // Add log
        const log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ozAmount: ozAmount
        };
        Storage.addLog(log);

        // Update bottle progress (drain the water)
        this.currentBottleProgress -= ozAmount;
        
        // Check if bottle is empty or over-consumed
        if (this.currentBottleProgress <= 0) {
            // Move to next bottle and refill it to full
            this.currentBottleNumber = Math.min(this.currentBottleNumber + 1, GOAL_BOTTLES);
            this.currentBottleProgress = BOTTLE_OZ;
        }

        // Save state
        this.saveBottleState();

        // Update UI
        this.refreshUI();
        this.updateBottleVisual();

        // Trigger confetti for milestones (based on total bottles consumed)
        const progress = this.calculateProgress();
        this.triggerMilestoneConfetti(progress);

        // Show random short message
        const shortMsg = getRandomShortMessage();
        this.showShortMessage(shortMsg.message);
    }

    async animateButtonAndFloatLabel(type, ozAmount) {
        const btn = this.elements[`btn${type.charAt(0) + type.slice(1).toLowerCase()}`];
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;

        // Button scale animation
        await gsap.to(btn, {
            scale: 0.9,
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            ease: "power2.out"
        });

        // Create floating label
        const label = document.createElement('div');
        label.className = 'floating-label';
        label.textContent = `-${ozAmount} oz`;
        label.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: 700;
            font-size: 1.2rem;
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.appendChild(label);

        // Animate label
        const tl = gsap.timeline();
        tl.to(label, { y: -80, opacity: 0, duration: 0.8, ease: "power2.out" })
          .eventCallback("onComplete", () => label.remove());
    }

    showShortMessage(message) {
        gsap.to(this.elements.shortMessage, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                this.elements.shortMessage.textContent = message;
                gsap.to(this.elements.shortMessage, { opacity: 1, duration: 0.3 });
            }
        });
    }

    calculateProgress() {
        const logs = Storage.getTodayLogs();
        const totalOz = logs.reduce((sum, log) => sum + log.ozAmount, 0);
        const totalBottles = totalOz / BOTTLE_OZ;
        const percentage = Math.min((totalBottles / GOAL_BOTTLES) * 100, 100);
        return {
            totalBottles: Math.round(totalBottles * 10) / 10,
            percentage: Math.round(percentage)
        };
    }

    triggerMilestoneConfetti(progress) {
        const milestones = [1, 2, 3, 4, 5];
        
        for (let i = 0; i < milestones.length; i++) {
            const threshold = milestones[i];
            if (progress.totalBottles >= threshold && progress.totalBottles < threshold + 0.1) {
                // First massive burst
                confetti({
                    particleCount: 200,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#4facfe', '#00f2fe', '#ff9a00', '#ffcc00', '#ff6b9d', '#ffd700'],
                    disableForReducedMotion: true,
                    zIndex: 9999
                });

                // Second burst from left side
                setTimeout(() => {
                    confetti({
                        particleCount: 150,
                        spread: 100,
                        origin: { y: 0.5, x: 0.2 },
                        colors: ['#ff6b9d', '#ffd700', '#4facfe'],
                        disableForReducedMotion: true,
                        zIndex: 9999
                    });
                }, 200);

                // Third burst from right side
                setTimeout(() => {
                    confetti({
                        particleCount: 150,
                        spread: 100,
                        origin: { y: 0.5, x: 0.8 },
                        colors: ['#00f2fe', '#ff9a00', '#ffd700'],
                        disableForReducedMotion: true,
                        zIndex: 9999
                    });
                }, 400);

                // Screen flash effect
                const flash = document.createElement('div');
                flash.style.cssText = `
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: white;
                    opacity: 0.3;
                    pointer-events: none;
                    z-index: 9998;
                    animation: flashFade 0.6s ease-out forwards;
                `;
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 600);

                // Screen shake for all bottle completions (stronger for #5)
                const shakeRepeats = threshold === 5 ? 30 : 15;
                gsap.to('body', {
                    x: 5,
                    duration: 0.05,
                    yoyo: true,
                    repeat: shakeRepeats
                });

                break;
            }
        }
    }

    refreshUI() {
        const progress = this.calculateProgress();

        // Update progress bar
        gsap.to(this.elements.progressFill, {
            width: `${progress.percentage}%`,
            duration: 0.7,
            ease: "power2.out"
        });

        // Render history
        this.renderHistory();

        // Update chart
        this.updateChart();
    }

    updateBottleVisual() {
        if (!this.elements.waterLevel) {
            console.warn('waterLevel element not found');
            return;
        }

        // Update bottle label
        const displayBottleNum = this.currentBottleNumber > GOAL_BOTTLES ? GOAL_BOTTLES : this.currentBottleNumber;
        this.elements.bottleLabel.textContent = `Bottle ${displayBottleNum} of ${GOAL_BOTTLES}`;

        // Show remaining oz in current bottle
        const remainingOz = this.currentBottleProgress.toFixed(1);
        this.elements.ozLabel.textContent = `${remainingOz} oz remaining`;

        // Calculate water level as percentage
        const levelPercent = (this.currentBottleProgress / BOTTLE_OZ) * 100;
        const clampedPercent = Math.min(Math.max(levelPercent, 0), 100);

        console.log('Bottle visual:', { currentBottleProgress: this.currentBottleProgress, levelPercent: clampedPercent });

        // Animate water level using percentage (work with CSS percentage height)
        gsap.to(this.elements.waterLevel, {
            height: `${clampedPercent}%`,
            duration: 0.5,
            ease: "power2.out"
        });

        // Create bubble effect if water is moving (between 20% and 80%)
        if (clampedPercent > 20 && clampedPercent < 80) {
            this.createBubbleEffect();
        }
    }

    createBubbleEffect() {
        const bubbles = this.elements.waterBubbles;
        if (!bubbles) return;

        // Clear existing bubbles
        bubbles.innerHTML = '';

        // Create a few random bubbles
        const bubbleCount = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.cssText = `
                position: absolute;
                bottom: 0;
                left: ${10 + Math.random() * 80}%;
                width: ${3 + Math.random() * 4}px;
                height: ${3 + Math.random() * 4}px;
                background: rgba(255,255,255,0.4);
                border-radius: 50%;
                animation: bubbleRise ${1 + Math.random() * 1}s ease-out forwards;
            `;
            bubbles.appendChild(bubble);
        }

        // Clean up bubbles after animation
        setTimeout(() => { bubbles.innerHTML = ''; }, 1500);
    }

    renderHistory() {
        const logs = Storage.getTodayLogs();
        if (logs.length === 0) {
            this.elements.historyList.innerHTML = '<p class="empty-state">No drinks yet today</p>';
            return;
        }

        const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.elements.historyList.innerHTML = sortedLogs.map(log => `
            <div class="history-item">
                <span class="history-time">${new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span class="history-amount">-${log.ozAmount.toFixed(1)} oz</span>
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
                    backgroundColor: 'rgba(79, 189, 186, 0.7)',
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
                        ticks: { stepSize: 1 }
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

    checkDailyReset() {
        if (Storage.performDailyResetIfNeeded()) {
            this.currentBottleNumber = 1;
            this.currentBottleProgress = BOTTLE_OZ;
            this.saveBottleState();
        }
        
        this.updateBottleVisual();
        this.refreshUI();
    }

    startBackgroundAnimation() {
        const bg = document.querySelector('.background-animation');
        if (bg) {
            gsap.to(bg, {
                backgroundPosition: '200% 200%',
                duration: 30,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }
}

// Initialize immediately - script is at end of body, DOM is ready
window.app = new HydrationApp();
