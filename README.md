# Hydration Love 💧

A beautiful, animated water tracker with heartfelt messages, built with love for an ER nurse studying to be an FNP.

## Features

- 🎯 **Simple button tracking**: 
  - 💧 **Sip** = 0.5 oz
  - ✅ **Bottle Done** = 16.9 oz (full bottle)
- 📊 **5-bottle daily goal** (84.5 oz) with beautiful progress bar
- 🎨 **Visual water bottle** that fills in real-time as you sip, resets when bottle is finished
- 💬 **Heartfelt messages**: Two message systems:
  - Random uplifting message with every drink
  - Progressive daily love note that unlocks word-by-word (30 segments)
- 🎉 **Spectacular animations**:
  - Floating "+X oz" labels on every tap
  - Confetti bursts at each completed bottle (1, 2, 3, 4, 5)
  - Full-screen celebration ceremony when daily message completes
  - Buttons scale, glass cards, shimmer effects, wave progress
  - Screen shake on 5th bottle!
- 📱 **Mobile-first design**: Optimized for iPhone with large touch targets
- 📈 **Weekly chart**: See your bottle consumption over the last 7 days
- ⏰ **4am Chicago reset**: Automatically resets daily at 4am Chicago time
- ✨ **Modern glassmorphism**: Frosted glass cards, animated gradient background, smooth transitions
- 🔒 **No API keys**: Completely offline - everything stored locally

## How It Works

1. **Tap "Sip"** each time you take a drink (0.5 oz)
2. **Watch the water bottle fill** visually with bubble animations
3. **When bottle reaches 16.9 oz**, it automatically counts as "Bottle 1 of 5" and resets for the next bottle
4. **Or tap "Bottle Done"** to instantly complete a bottle (if you finished it all at once)
5. **Watch the magic**:
   - Progress bar fills with wave animation
   - "+X oz" floats up from the button
   - Random encouraging message appears
   - Daily love note reveals word-by-word
   - Confetti explodes when you complete each bottle!
6. **Complete the daily message** (by reaching all 30 word segments) for a special ceremony with typewriter effect, screen flash, and massive confetti!

## Visual Water Bottle

The bottle graphic shows your **current bottle progress**:
- Fills from empty to full as you sip
- Shows exact oz amount (e.g., "4.5 / 16.9 oz")
- Automatically resets to 0 when you complete a bottle
- Displays which bottle you're on: "Bottle 2 of 5"

## Setup (2 minutes)

### 1. Deploy to GitHub Pages
```bash
# If you haven't installed GitHub CLI:
# brew install gh

# Inside the hydration-tracker folder:
gh repo create hydration-love-tracker --public --source=. --remote=origin --push

# That's it! GitHub Actions will auto-deploy
```

### 2. Get your live URL
After push completes (2 min), visit:
`https://YOURUSERNAME.github.io/hydration-love-tracker/`

### 3. Open on her iPhone
- Save to Home Screen: Share → Add to Home Screen
- No signup required, no settings needed!

## Customization

### Change drink amounts (in `js/app.js`):
```javascript
const SIP_OZ = 0.5;
const BOTTLE_OZ = 16.9;
```

### Change daily goal:
```javascript
const GOAL_BOTTLES = 5;
```

### Add your own messages (in `js/messages.js`):
- `SHORT_MESSAGES`: Add uplifting phrases
- `DAILY_MESSAGES`: Add full daily love notes (max 30 recommended)

## Tech Stack

- **Pure HTML/CSS/JavaScript**: No build step required
- **GSAP**: Smooth animations and timelines
- **Chart.js**: Weekly bar chart visualization
- **Canvas Confetti**: Celebration effects
- **LocalStorage**: All data stored locally (private)
- **GitHub Actions**: Auto-deploy on push

## Privacy

All data stays on the device. No accounts, no cloud storage, no tracking. You can clear data anytime by clearing browser cache.

## File Structure

```
hydration-tracker/
├── index.html
├── css/style.css (glassmorphism, animations, bottle visual)
├── js/
│   ├── app.js (main logic, animations, ceremony, bottle tracking)
│   ├── storage.js (localStorage with Chicago 4am reset)
│   └── messages.js (message banks)
├── .github/workflows/gh-pages.yml (auto-deploy)
└── README.md
```

## Troubleshooting

**Doesn't work after deployment?**
- Check GitHub Pages is enabled (workflow should auto-enable)
- Wait 2-3 minutes after push for deployment
- Check Actions tab for workflow status

**Data not persisting?**
- Don't use Private/Incognito mode
- Clear browser cache to reset everything

**Want to reset today's progress?**
- On iPhone: Settings → Safari → Clear History & Website Data (for this site)

## Credits

Built with love for the most amazing nurse I know. 💕

---

Made with opencode. Free hosting on GitHub Pages.
