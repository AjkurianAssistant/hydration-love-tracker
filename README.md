# Hydration Love 💧

A personalized water tracking app with AI image analysis, built with love for an ER nurse studying to be an FNP.

## Features

- 📸 **AI-Powered Tracking**: Take a photo of your water bottle, AI estimates how much you drank
- 🎯 **Daily Goal**: 5 bottles (16.9 oz each) - tailored to your stats
- 💬 **Heartfelt Messages**: Get encouraging messages with every log
- 🔐 **Progressive Daily Message**: Unlock parts of a special message throughout the day
- 📊 **Progress Tracking**: Visual progress bar, weekly chart, and history log
- 🔒 **Anti-Cheating**: Stores last 10 image hashes to prevent duplicates
- 🎉 **Celebrations**: Confetti when you reach your goal
- 📱 **Mobile-First**: Optimized for iPhone with touch-friendly interface

## Setup (2 minutes)

### 1. Get a Free API Key
Go to [OpenRouter.ai](https://openrouter.ai) and sign up for a free account.
- Free tier: 1,000 requests/day
- Recommended model: `qwen/qwen-2.5-vl-32b:free` (image understanding)

### 2. Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push these files to the `main` branch
3. Go to Settings → Pages
4. Set source to "Deploy from a branch"
5. Branch: `main`, folder: `/ (root)`
6. Save
7. Your app will be at: `https://yourusername.github.io/repository-name/`

### 3. First Use

1. Open your deployed site on your iPhone (Safari)
2. Tap the gear icon (⚙️) in the bottom right
3. Paste your OpenRouter API key
4. Save
5. Start logging!

## How It Works

1. **Take a Photo**: Tap the upload area and snap a picture of your water bottle
2. **AI Analysis**: The image is sent to OpenRouter's free vision model to estimate fill percentage
3. **Get Messages**: Receive both a short uplifting message and reveal part of your daily love note
4. **Track Progress**: Watch the progress bar fill and the chart update over time

**Privacy**: All data is stored locally in your browser. Images are sent to OpenRouter for analysis but are not stored there. You can clear data anytime by clearing browser cache.

## Tech Stack

- Pure HTML/CSS/JavaScript (no build step)
- Chart.js for weekly visualization
- GSAP for smooth animations
- Canvas Confetti for celebrations
- OpenRouter API (free tier)
- LocalStorage for client-side persistence

## Files

```
hydration-tracker/
├── index.html
├── css/style.css
├── js/
│   ├── app.js (main logic)
│   ├── storage.js (localStorage wrapper)
│   ├── ai.js (OpenRouter integration)
│   └── messages.js (50+ short messages, 30 daily love notes)
```

## Customization (Optional)

To add more messages, edit `js/messages.js`:
- Add to `SHORT_MESSAGES` array for quick uplifting notes
- Add to `DAILY_MESSAGES` array for daily progressive messages (max 30 recommended)

## Troubleshooting

**"API key not set"**: Make sure you saved your key in settings (gear icon)

**"API error"**: Check your OpenRouter account has credits. Free tier resets daily.

**Data not persisting**: Make sure you're not in Private/Incognito mode. Safari may block localStorage in certain privacy modes.

**Images not uploading**: Ensure camera permission is granted. Try a different browser if issues persist.

## Future Enhancements (Optional)

- [ ] Push notifications/reminders
- [ ] Multiple bottle size options
- [ ] Custom goal based on weight/height
- [ ] Export data as CSV
- [ ] Multiple language support

## Credits

Built with love 💕 for the most dedicated healthcare worker I know.

---

Made with opencode. Deploy free on GitHub Pages.
