# Hydration Love 💧

A beautiful, animated water tracker with heartfelt messages, built with love for an ER nurse studying to be an FNP.

## 🌐 Live Site

**Check it out:** https://ajkurianassistant.github.io/hydration-love-tracker/

## Features

- 🎯 **Simple tracking**:
  - 💧 **Sip** = 0.5 oz
  - ✅ **Bottle Done** = 16.9 oz (full bottle)
- 🎨 **Visual water bottle** that starts full and drains with each sip
  - Shows current oz remaining: "16.9 oz" → "12.5 oz" → etc.
  - Automatically moves to next bottle when empty
  - Beautiful bubble animations as you drink
- 📊 **5-bottle daily goal** (84.5 oz) with animated progress bar
- 💬 **Encouraging messages**: Random uplifting message with every drink
- 🎉 **Spectacular animations**:
  - "-X oz" floats up from button (water draining!)
  - Water level drops smoothly with bubble effects
  - Confetti bursts at each completed bottle (1, 2, 3, 4, 5)
  - Screen shake on 5th bottle!
- 📱 **Mobile-first design**: Optimized for iPhone, large touch targets at top
- 📈 **Weekly chart**: See your bottle consumption over the last 7 days
- ⏰ **4am Chicago reset**: Automatically resets daily at 4am Chicago time
- ✨ **Modern glassmorphism**: Frosted glass cards, animated gradient background
- 🔒 **No setup required**: Everything stored locally, no accounts

## How It Works

1. **Start with a full bottle** (16.9 oz) visualized on screen
2. **Tap "💧 Sip"** each time you drink (0.5 oz)
   - Water level drops
   - "-0.5 oz" floats up
   - Encouraging message appears
3. **When bottle is empty**, it counts as "Bottle 1 of 5" and a fresh full bottle appears
4. **Tap "✅ Bottle Done"** to skip to next bottle (if you finished it all at once)
5. **Complete 5 bottles** for the daily goal and celebrate!

## Setup

Already deployed! Just open the live URL on your iPhone and add to Home Screen.

**URL:** https://ajkurianassistant.github.io/hydration-love-tracker/

## Customization

Want to change drink amounts or goal?

In `js/app.js`:
```javascript
const GOAL_BOTTLES = 5;          // Daily goal in bottles
const BOTTLE_OZ = 16.9;          // Oz per bottle
const SIP_OZ = 0.5;              // Oz per sip

const DRINK_TYPES = {
    SIP: { amount: 0.5, confetti: 10, colors: [...] },
    BOTTLE: { amount: 16.9, confetti: 200, colors: [...] }
};
```

Add your own messages in `js/messages.js` → `SHORT_MESSAGES` array.

## Tech Stack

- Pure HTML/CSS/JavaScript (no build step)
- GSAP for smooth animations
- Chart.js for weekly visualization
- Canvas Confetti for celebrations
- LocalStorage for persistence
- GitHub Actions for auto-deploy

## Privacy

All data stays on the device. No accounts, no cloud storage. Clear browser cache to reset.

## File Structure

```
hydration-tracker/
├── index.html
├── css/style.css (modern glassmorphism, animations)
├── js/
│   ├── app.js (logic, bottle tracking, animations)
│   ├── storage.js (localStorage with bottle state persistence)
│   └── messages.js (encouraging messages)
├── .github/workflows/gh-pages.yml (auto-deploy)
└── README.md
```

## Troubleshooting

**Site not loading?**
- Wait 2-3 minutes after deployment
- Check GitHub Actions for build status

**Data not persisting?**
- Use regular mode (not Private browsing)
- Clear cache to reset

**Want to reset today's progress?**
- Clear browser data for this site

---

Built with love 💕 for the most dedicated healthcare worker.
