// Main application logic
import { Storage, getChicagoDateStringFromDate, getChicagoWeekday } from './storage.js';
import { getRandomShortMessage, getDailyMessage, getDailyMessageCount } from './messages.js';

const GOAL_BOTTLES = 5;
const BOTTLE_OZ = 16.9;
const SIP_OZ = 0.5;

const DRINK_TYPES = {
    SIP: { amount: 0.5, label: 'Sip', confetti: 10, colors: ['#4facfe', '#00f2fe'] },
    BOTTLE: { amount: 16.9, label: 'Bottle', confetti: 150, colors: ['#ff6b9d', '#c33764', '#ffd700'] }
};

class HydrationApp {
    constructor() {
        this.chart = null;
        this.ceremonyComplete = false;
        this.currentBottleProgress = 0; // oz in current bottle (0 to 16.9)
        this.currentBottleNumber = 1;   // which bottle we're on (1 to 5)
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        Storage.performDailyResetIfNeeded();
        this.refreshUI();
        this.initChart();
        this.checkDailyReset();
        this.startBackgroundAnimation();
        this.checkMessageCeremony();

        setInterval(() => Storage.performDailyResetIfNeeded(), 60 * 1000);
    }

    bindElements() {
        this.elements = {
            bottleCount: document.getElementById('bottle-count'),
            bottlePercentage: document.getElementById('bottle-percentage'),
            remaining: document.getElementById('remaining'),
            progressFill: document.getElementById('progress-fill'),
            shortMessage: document.getElementById('short-message'),
            dailyProgressText: document.getElementById('daily-progress-text'),
            dailyText: document.getElementById('daily-text'),
            btnSip: document.getElementById('btn-sip'),
            btnBottle: document.getElementById('btn-bottle'),
            historyList: document.getElementById('history-list'),
            weekChart: document.getElementById('week-chart'),
            ceremonyOverlay: document.getElementById('ceremony-overlay'),
            ceremonyMessage: document.getElementById('ceremony-message'),
            btnReplay: document.getElementById('btn-replay'),
            btnCloseCeremony: document.getElementById('btn-close-ceremony'),
            waterLevel: document.getElementById('water-level'),
            waterBubbles: document.getElementById('water-bubbles'),
            currentBottleLabel: document.getElementById('current-bottle-label'),
            currentOzLabel: document.getElementById('current-oz-label')
        };
    }

    bindEvents() {
        this.elements.btnSip.addEventListener('click', () => this.handleDrink('SIP'));
        this.elements.btnBottle.addEventListener('click', () => this.handleDrink('BOTTLE'));
        this.elements.btnReplay.addEventListener('click', () => this.runFullMessageCeremony());
        this.elements.btnCloseCeremony.addEventListener('click', () => this.closeCeremony());
    }

    async handleDrink(type) {
        const drink = DRINK_TYPES[type];
        const ozAmount = drink.amount;

        // Create floating label animation at button position
        await this.animateButtonAndFloatLabel(type, ozAmount);

        // Add log
        const log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ozAmount: ozAmount
        };
        Storage.addLog(log);

        // Update current bottle progress
        this.currentBottleProgress += ozAmount;
        let bottleCompleted = false;
        if (this.currentBottleProgress >= BOTTLE_OZ) {
            this.currentBottleNumber = Math.min(this.currentBottleNumber + 1, GOAL_BOTTLES);
            this.currentBottleProgress = this.currentBottleProgress % BOTTLE_OZ;
            bottleCompleted = true;
        }

        // Increment daily message
        const newIndex = Storage.incrementDailyMessageIndex();

        // Update UI
        this.refreshUI();
        this.updateBottleVisual();

        // Check milestones (based on total bottles completed)
        const progress = this.calculateProgress();
        this.triggerMilestoneConfetti(progress, bottleCompleted);

        // Show random short message
        const shortMsg = getRandomShortMessage();
        this.showShortMessage(shortMsg.message);

        // Check for full message reveal
        if (newIndex >= getDailyMessageCount() && !this.ceremonyComplete) {
            this.ceremonyComplete = true;
            setTimeout(() => this.runFullMessageCeremony(), 1000);
        }
    }

    async animateButtonAndFloatLabel(type, ozAmount) {
        const btn = this.elements[`btn${type.charAt(0) + type.slice(1).toLowerCase()}`];
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
    }

    updateBottleVisual() {
        // Update bottle labels
        const bottleNumber = Math.min(this.currentBottleNumber, GOAL_BOTTLES);
        this.elements.currentBottleLabel.textContent = `Bottle ${bottleNumber} of ${GOAL_BOTTLES}`;
        this.elements.currentOzLabel.textContent = `${this.currentBottleProgress.toFixed(1)} / ${BOTTLE_OZ} oz`;

        // Calculate water level percentage (0-100)
        const levelPercent = (this.currentBottleProgress / BOTTLE_OZ) * 100;
        const clampedPercent = Math.min(Math.max(levelPercent, 0), 100);

        // Animate water level
        gsap.to(this.elements.waterLevel, {
            height: `${clampedPercent}%`,
            duration: 0.5,
            ease: "power2.out"
        });

        // Create bubble effect on fill
        if (clampedPercent > 0 && clampedPercent < 100) {
            this.createBubbleEffect();
        }
    }

    createBubbleEffect() {
        const bubbles = this.elements.waterBubbles;
        if (!bubbles) return;

        // Clear existing bubbles
        bubbles.innerHTML = '';

        // Create a few random bubbles
        const bubbleCount = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.style.cssText = `
                position: absolute;
                bottom: 0;
                left: ${10 + Math.random() * 80}%;
                width: ${4 + Math.random() * 6}px;
                height: ${4 + Math.random() * 6}px;
                background: rgba(255,255,255,0.4);
                border-radius: 50%;
                animation: bubbleRise ${1 + Math.random() * 1.5}s ease-out forwards;
            `;
            bubbles.appendChild(bubble);
        }

        // Clean up bubbles after animation
        setTimeout(() => { bubbles.innerHTML = ''; }, 2000);
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
        const goalBottles = GOAL_BOTTLES;
        const percentage = Math.min((totalBottles / goalBottles) * 100, 100);
        return {
            totalBottles: Math.round(totalBottles * 10) / 10,
            percentage: Math.round(percentage),
            currentBottlesInt: Math.min(Math.floor(totalBottles) + 1, GOAL_BOTTLES)
        };
    }

    triggerMilestoneConfetti(progress, bottleJustCompleted = false) {
        // Milestones at 1, 2, 3, 4, 5 bottles completed
        const milestones = [1, 2, 3, 4, 5];
        
        for (let i = 0; i < milestones.length; i++) {
            const threshold = milestones[i];
            if (progress.totalBottles >= threshold && progress.totalBottles < threshold + 0.1) {
                const particleCount = bottleJustCompleted ? 200 : 80 + i * 30;
                
                confetti({
                    particleCount: particleCount,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#4facfe', '#00f2fe', '#ff9a00', '#ffcc00', '#ff6b9d', '#ffd700'],
                    disableForReducedMotion: true,
                    zIndex: 9999
                });

                // Screen shake for full bottle
                if (threshold === 5) {
                    gsap.to('body', {
                        x: 5,
                        duration: 0.05,
                        yoyo: true,
                        repeat: 20
                    });
                }
                break;
            }
        }
    }

    refreshUI() {
        // Update bottle visual info
        this.updateBottleVisual();

        // Get progress for overall bar
        const progress = this.calculateProgress();

        // Animate progress bar width
        gsap.to(this.elements.progressFill, {
            width: `${progress.percentage}%`,
            duration: 0.7,
            ease: "power2.out"
        });

        // Update total remaining (from goal perspective)
        const remainingBottles = Math.max(0, GOAL_BOTTLES - progress.totalBottles);
        this.elements.remaining.textContent = `Goal: ${GOAL_BOTTLES} bottles | Remaining: ${remainingBottles.toFixed(1)} bottles`;

        // Update daily message
        const currentIndex = Storage.getDailyMessageIndex();
        const totalSegments = getDailyMessageCount();
        this.elements.dailyProgressText.textContent = `${Math.min(currentIndex, totalSegments)}/${totalSegments} words`;
        const daily = getDailyMessage(Math.min(currentIndex, totalSegments - 1));
        this.elements.dailyText.textContent = daily.message;

        // Render history
        this.renderHistory();

        // Update chart
        this.updateChart();
    }

    triggerMilestoneConfetti(progress) {
        const total = progress.totalBottles;
        const milestones = [1.25, 2.5, 3.75, 5];
        const config = {};

        for (let i = 0; i < milestones.length; i++) {
            const threshold = milestones[i];
            if (total >= threshold && total < threshold + 0.1) {
                confetti({
                    particleCount: 100 + i * 50,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#4facfe', '#00f2fe', '#ff9a00', '#ffcc00', '#ff6b9d', '#ffd700'][i % 6],
                    disableForReducedMotion: true,
                    zIndex: 9999
                });

                // Screen shake for full bottle milestones
                if (threshold === 5) {
                    gsap.to('body', {
                        x: 5,
                        duration: 0.05,
                        yoyo: true,
                        repeat: 20
                    });
                }
                break;
            }
        }
    }

    refreshUI() {
        const progress = this.calculateProgress();

        // Update bottle status
        const currentBottle = Math.min(progress.currentBottlesInt + 1, GOAL_BOTTLES);
        this.elements.bottleCount.textContent = `Bottle ${currentBottle} of ${GOAL_BOTTLES}`;
        this.elements.bottlePercentage.textContent = `${progress.percentage}%`;
        this.elements.remaining.textContent = `Remaining: ${(GOAL_BOTTLES - progress.totalBottles).toFixed(1)} bottles (${(84.5 - (progress.totalBottles * 16.9)).toFixed(1)} oz)`;

        // Animate progress bar width
        gsap.to(this.elements.progressFill, {
            width: `${progress.percentage}%`,
            duration: 0.7,
            ease: "power2.out"
        });

        // Update daily message
        const currentIndex = Storage.getDailyMessageIndex();
        const totalSegments = getDailyMessageCount();
        this.elements.dailyProgressText.textContent = `${Math.min(currentIndex, totalSegments)}/${totalSegments} words`;
        const daily = getDailyMessage(Math.min(currentIndex, totalSegments - 1));
        this.elements.dailyText.textContent = daily.message;

        // Render history
        this.renderHistory();

        // Update chart
        this.updateChart();
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
                <span class="history-amount">+${log.ozAmount.toFixed(1)} oz</span>
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
        Storage.performDailyResetIfNeeded();
        // Reset bottle tracking state
        this.currentBottleProgress = 0;
        this.currentBottleNumber = 1;
        this.ceremonyComplete = false;
        
        // Update UI
        const currentIndex = Storage.getDailyMessageIndex();
        this.elements.dailyProgressText.textContent = `${Math.min(currentIndex, getDailyMessageCount())}/${getDailyMessageCount()} words`;
        const daily = getDailyMessage(currentIndex);
        this.elements.dailyText.textContent = daily.message;
        this.updateBottleVisual();
        this.refreshUI();
    }

    checkMessageCeremony() {
        const currentIndex = Storage.getDailyMessageIndex();
        if (currentIndex >= getDailyMessageCount()) {
            this.ceremonyComplete = true;
        }
    }

    runFullMessageCeremony() {
        const currentIndex = Storage.getDailyMessageIndex();
        if (currentIndex < getDailyMessageCount()) return;

        const message = getDailyMessage(currentIndex - 1);
        this.elements.ceremonyOverlay.style.display = 'flex';
        this.elements.ceremonyMessage.innerHTML = '<span class="typewriter-text"></span>';
        this.elements.ceremonyOverlay.classList.add('active');

        // Typewriter effect
        const text = message.message;
        const container = this.elements.ceremonyMessage.querySelector('.typewriter-text');
        container.innerHTML = '';

        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < text.length) {
                container.innerHTML += text[charIndex];
                charIndex++;
            } else {
                clearInterval(typeInterval);
            }
        }, 40);
    }

    closeCeremony() {
        this.elements.ceremonyOverlay.classList.remove('active');
        setTimeout(() => {
            this.elements.ceremonyOverlay.style.display = 'none';
        }, 300);
    }

    startBackgroundAnimation() {
        const bg = document.querySelector('.background-animation');
        gsap.to(bg, {
            backgroundPosition: '200% 200%',
            duration: 30,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new HydrationApp();
});
