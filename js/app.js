// Main application logic
import { Storage, getChicagoDateStringFromDate, getChicagoWeekday } from './storage.js';
import { getRandomShortMessage } from './messages.js';

const GOAL_BOTTLES = 5;
const BOTTLE_OZ = 16.9;

class HydrationApp {
    constructor() {
        this.chart = null;
        this.drinkStreak = 0; // Track consecutive drinks for progressive effects
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
        this.updateBottleVisual();
        this.startBackgroundAnimation();
        this.updateModalStats();

        setInterval(() => {
            Storage.performDailyResetIfNeeded();
            this.updateModalStats();
        }, 60 * 1000);
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
            historyList: document.getElementById('history-list'),
            weekChart: document.getElementById('week-chart'),
            waterLevel: document.getElementById('water-level'),
            waterBubbles: document.getElementById('water-bubbles'),
            bottleLabel: document.getElementById('bottle-label'),
            ozLabel: document.getElementById('oz-label'),
            settingsBtn: document.getElementById('settings-btn'),
            settingsModal: document.getElementById('settings-modal'),
            btnReset: document.getElementById('btn-reset'),
            btnCloseModal: document.getElementById('btn-close-modal'),
            modalDrinkCount: document.getElementById('modal-drink-count'),
            modalBottleInfo: document.getElementById('modal-bottle-info')
        };
    }

    bindEvents() {
        this.elements.btnSip.addEventListener('click', (e) => this.handleSip(e));
        this.elements.settingsBtn.addEventListener('click', () => this.toggleSettings(true));
        this.elements.btnCloseModal.addEventListener('click', () => this.toggleSettings(false));
        this.elements.btnReset.addEventListener('click', () => this.resetAllData());
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) this.toggleSettings(false);
        });
    }

    async handleSip(e) {
        const ozAmount = 0.5;

        // Add log
        const log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ozAmount: ozAmount
        };
        Storage.addLog(log);

        // Update bottle progress (drain)
        this.currentBottleProgress -= ozAmount;
        this.drinkStreak++;

        // Check if bottle is empty
        if (this.currentBottleProgress <= 0) {
            this.currentBottleNumber = Math.min(this.currentBottleNumber + 1, GOAL_BOTTLES);
            this.currentBottleProgress = BOTTLE_OZ;
            this.drinkStreak = 0; // Reset streak on bottle completion
        }

        // Save state
        this.saveBottleState();

        // Animations
        await this.animateButton(e.target);
        await this.animateFloatLabel(e.target, ozAmount);
        this.animateWaterDrain();
        this.animateSplash();
        this.triggerSipConfetti();

        // Update UI
        this.refreshUI();
        this.updateBottleVisual();
        this.updateModalStats();

        // Show message
        const shortMsg = getRandomShortMessage();
        this.showShortMessage(shortMsg.message);
    }

    async animateButton(btn) {
        // Button scale with elastic bounce
        await gsap.to(btn, {
            scale: 0.85,
            duration: 0.06,
            yoyo: true,
            repeat: 1,
            ease: "power2.out"
        });

        // Ripple effect
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            left: ${rect.width / 2 - 10}px;
            top: ${rect.height / 2 - 10}px;
            background: rgba(255,255,255,0.5);
            border-radius: 50%;
        `;
        btn.style.position = 'relative';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    async animateFloatLabel(btn, ozAmount) {
        const rect = btn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;

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
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(label);

        const tl = gsap.timeline();
        tl.to(label, { 
            y: -100, 
            opacity: 0, 
            duration: 0.9, 
            ease: "power2.out" 
        })
        .eventCallback("onComplete", () => label.remove());
    }

    animateWaterDrain() {
        if (!this.elements.waterLevel) return;

        const levelPercent = (this.currentBottleProgress / BOTTLE_OZ) * 100;
        
        gsap.to(this.elements.waterLevel, {
            height: `${levelPercent}%`,
            duration: 0.4,
            ease: "power2.inOut"
        });
    }

    animateSplash() {
        if (!this.elements.waterBubbles) return;

        // Create splash droplets
        const bottleBody = document.querySelector('.bottle-body');
        if (!bottleBody) return;

        const rect = bottleBody.getBoundingClientRect();
        const dropletCount = 5 + Math.floor(Math.random() * 5);

        for (let i = 0; i < dropletCount; i++) {
            const droplet = document.createElement('div');
            droplet.className = 'splash';
            const size = 3 + Math.random() * 4;
            droplet.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: rgba(144, 224, 239, 0.8);
                border-radius: 50%;
                left: ${rect.left + 10 + Math.random() * (rect.width - 20)}px;
                top: ${rect.top + 20}px;
                z-index: 1001;
            `;
            document.body.appendChild(droplet);

            const angle = (Math.random() - 0.5) * Math.PI; // Spread upward
            const velocity = 30 + Math.random() * 40;
            const endX = parseFloat(droplet.style.left) + Math.cos(angle) * velocity;
            const endY = parseFloat(droplet.style.top) - Math.abs(Math.sin(angle) * velocity) - 20;

            gsap.to(droplet, {
                left: endX,
                top: endY,
                opacity: 0,
                duration: 0.6 + Math.random() * 0.4,
                ease: "power2.out",
                onComplete: () => droplet.remove()
            });
        }
    }

    triggerSipConfetti() {
        // Intensity scales with drink streak
        const baseCount = 5;
        const streakBonus = Math.min(this.drinkStreak * 2, 15);
        const particleCount = baseCount + streakBonus;

        // Only fire confetti on some sips for variety, or always small amount
        if (this.drinkStreak % 3 === 0) { // Every 3rd sip gets confetti
            confetti({
                particleCount: particleCount,
                spread: 40,
                origin: { y: 0.7 },
                colors: ['#4facfe', '#00f2fe', '#90e0ef'],
                disableForReducedMotion: true,
                zIndex: 9999
            });
        }

        // Every sip gets mini confetti burst
        if (particleCount > 5) {
            setTimeout(() => {
                confetti({
                    particleCount: Math.floor(particleCount / 2),
                    spread: 30,
                    origin: { y: 0.8, x: 0.5 },
                    colors: ['#4facfe', '#90e0ef'],
                    disableForReducedMotion: true,
                    zIndex: 9999
                });
            }, 100);
        }
    }

    showShortMessage(message) {
        gsap.to(this.elements.shortMessage, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                this.elements.shortMessage.textContent = message;
                gsap.to(this.elements.shortMessage, { opacity: 1, duration: 0.3, ease: "power2.out" });
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
                // Massive celebration for bottle completion
                this.celebrationExplosion(threshold);
                break;
            }
        }
    }

    celebrationExplosion(bottleNumber) {
        // Triple burst confetti
        confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#ff6b9d', '#4facfe', '#00f2fe', '#ff9a00'],
            disableForReducedMotion: true,
            zIndex: 9999
        });

        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5, x: 0.2 },
                colors: ['#ff6b9d', '#ffd700', '#4facfe'],
                zIndex: 9999
            });
        }, 200);

        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5, x: 0.8 },
                colors: ['#00f2fe', '#ff9a00', '#ffd700'],
                zIndex: 9999
            });
        }, 400);

        // Screen flash
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: white;
            opacity: 0.4;
            pointer-events: none;
            z-index: 9998;
            animation: flashFade 0.6s ease-out forwards;
        `;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 600);

        // Screen shake
        const shakeRepeats = bottleNumber === 5 ? 30 : 15;
        gsap.to('body', {
            x: 6,
            duration: 0.04,
            yoyo: true,
            repeat: shakeRepeats,
            ease: "power2.inOut"
        });

        // Pulse the bottle visual
        gsap.fromTo('.water-bottle',
            { scale: 1 },
            { scale: 1.15, duration: 0.2, yoyo: true, repeat: 3 }
        );
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
        if (!this.elements.waterLevel) return;

        // Update labels
        const displayBottleNum = this.currentBottleNumber > GOAL_BOTTLES ? GOAL_BOTTLES : this.currentBottleNumber;
        this.elements.bottleLabel.textContent = `Bottle ${displayBottleNum} of ${GOAL_BOTTLES}`;
        this.elements.ozLabel.textContent = `${this.currentBottleProgress.toFixed(1)} oz remaining`;

        // Water level as percentage
        const levelPercent = (this.currentBottleProgress / BOTTLE_OZ) * 100;
        const clampedPercent = Math.min(Math.max(levelPercent, 0), 100);

        gsap.to(this.elements.waterLevel, {
            height: `${clampedPercent}%`,
            duration: 0.5,
            ease: "power2.out"
        });

        // Bubbles
        if (clampedPercent > 20 && clampedPercent < 80) {
            this.createBubbleEffect();
        }
    }

    createBubbleEffect() {
        const bubbles = this.elements.waterBubbles;
        if (!bubbles) return;

        bubbles.innerHTML = '';
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
            this.drinkStreak = 0;
            this.saveBottleState();
        }
        
        this.updateBottleVisual();
        this.refreshUI();
    }

    toggleSettings(show) {
        if (show) {
            this.elements.settingsModal.classList.add('active');
            this.updateModalStats();
        } else {
            this.elements.settingsModal.classList.remove('active');
        }
    }

    updateModalStats() {
        const logs = Storage.getTodayLogs();
        this.elements.modalDrinkCount.textContent = logs.length;
        this.elements.modalBottleInfo.textContent = `${this.currentBottleNumber} of ${GOAL_BOTTLES} bottles`;
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
            localStorage.clear();
            location.reload();
        }
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

// Initialize immediately
window.app = new HydrationApp();
