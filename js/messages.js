// Message bank for hydration tracker

export const SHORT_MESSAGES = [
    "You're amazing! 💕",
    "Every sip counts! 💪",
    "Keep going, beautiful! ✨",
    "You've got this! 🌟",
    "Hydration is self-love! 💖",
    "So proud of you! 🎉",
    "You're doing great! 💗",
    "Stay hydrated, stay glowing! 💫",
    "One step closer! 🚀",
    "Your body thanks you! 🙏",
    "Amazing progress! 🌈",
    "You're inspiring! 💝",
    "Keep it up! 🎯",
    "Hydration hero! 🦸‍♀️",
    "Nothing can stop you! ⚡",
    "You're unstoppable! 🔥",
    "Love this habit! 💕",
    "You're disciplined! 💪",
    "Your skin glows! ✨",
    "Health is wealth! 💎",
    "Beautiful inside & out! 🌸",
    "You're doing amazing! 🌺",
    "Stay strong! 💖",
    "You're a rockstar! 🎸",
    "Halfway there! 🎪",
    "Almost there! 🏁",
    "You're dedicated! 📚",
    "I believe in you! 🙌",
    "You're consistent! ⏰",
    "Incredible! 🌠",
    "You're a winner! 🏆",
    "Hydration queen! 👑",
    "Your energy shines! ☀️",
    "You're disciplined! 💼",
    "You're thriving! 🌱",
    "So close! 🎯",
    "You're a champion! 🥇",
    "On fire today! 🔥",
    "Your health matters! ❤️",
    "You deserve this! 🌟",
    "Keep hydrating! 💧",
    "You're my hero! 🦸‍♀️",
    "So beautiful! 💐",
    "You're glowing! ✨",
    "Perfect timing! ⏰",
    "You're disciplined! 📝",
    "You're doing it! 🎊",
    "I'm so proud! 🎗️",
    "You're strong! 💪",
    "You're incredible! 🌟"
];

export const DAILY_MESSAGES = [
    "Today's message: You are loved more than you know. Every drop of water you drink is a little act of love for the amazing person you are. Keep going 💕",
    "Today's message: The strength you're building today, both in body and mind, will carry you through everything. I'm so proud of your dedication. 🌟",
    "Today's message: Remember to be kind to yourself today. You're doing better than you think. Each sip is a reminder that you matter. 💖",
    "Today's message: Your health is your greatest wealth. By taking care of yourself, you're investing in our future together. Thank you for being you. 💝",
    "Today's message: Some days are harder than others. But you show up for yourself, and that's everything. I see your effort and I'm grateful. 🙏",
    "Today's message: The little habits we build today become the life we live tomorrow. Your commitment to hydration is building a healthier, brighter you. 🌈",
    "Today's message: You are stronger than your challenges, smarter than your doubts, and braver than your fears. Keep sipping, keep shining. 🔥",
    "Today's message: Self-care isn't selfish, it's essential. When you care for yourself, you have more love to give to others. You're doing it right. ✨",
    "Today's message: I'm constantly amazed by your dedication. Not just to your patients, but to yourself. That balance is everything. 💪",
    "Today's message: Every bottle you finish is a victory. Celebrate each one. You've earned it. Today is YOUR day. 🎉",
    "Today's message: Your body is your home. Nourish it, respect it, love it. You're doing exactly that with every sip. Thank you. 💕",
    "Today's message: The journey of a thousand miles begins with a single sip. You're well on your way. I'm walking this journey with you. 🚶‍♀️",
    "Today's message: You inspire me every single day with your commitment to others and now to yourself. Keep being phenomenal. 🌟",
    "Today's message: Hydration isn't just about water—it's about clarity, energy, and showing up as your best self. That's what you're creating. 💎",
    "Today's message: I believe in you more than you know. Trust the process, trust your body, trust that you're exactly where you need to be. 💖",
    "Today's message: You're not just drinking water—you're building a foundation of health that will support all your dreams. Keep building! 🏗️",
    "Today's message: Some people dream of success. You're achieving it, one sip at a time. Your future self is thanking you right now. 🎯",
    "Today's message: Remember why you started. You started because you deserve to feel your best. And you are. Keep going! 💗",
    "Today's message: Your dedication is contagious. Watching you care for yourself makes me want to do better too. Thank you for leading by example. 👑",
    "Today's message: The world needs healthy, vibrant, amazing people like you. By hydrating, you're preparing to make your mark. You've got this! 🌍",
    "Today's message: Today might be tough, but you're tougher. Every bottle is proof of your resilience. I'm cheering for you! 🎊",
    "Today's message: You're not just meeting a goal—you're creating a lifestyle. And that lifestyle is one of health, happiness, and love. 💕",
    "Today's message: I see you trying, I see you succeeding, I see you growing. And I couldn't be more proud to call you mine. Forever & always. 💝",
    "Today's message: Your body is a temple, and you're treating it like the sacred space it is. That's beautiful to witness. 🙏",
    "Today's message: Small consistent actions create massive changes over time. You're proving that right now. Keep the momentum! ⚡",
    "Today's message: You're not just drinking water—you're investing in clarity, energy, and the ability to show up fully for your patients and for me. 💪",
    "Today's message: Today is a gift, and you're unwrapping it with health and intention. That's the best way to live. Keep it up! 🎁",
    "Today's message: Your commitment to yourself shows me how much you value your life, your health, and our future together. I love that about you. 💖",
    "Today's message: You're not just hydrating—you're thriving. And watching you thrive is one of my greatest joys. Keep shining! ✨",
    "Today's message: Remember: progress, not perfection. Every sip counts. You're already doing amazing just by showing up. 🌱",
    "Today's message: I'm grateful every day for someone who takes care of themselves as diligently as you take care of others. That's rare and beautiful. 🌸"
];

export function getRandomShortMessage(excludeIndex = null) {
    let index;
    do {
        index = Math.floor(Math.random() * SHORT_MESSAGES.length);
    } while (index === excludeIndex && SHORT_MESSAGES.length > 1);
    return { message: SHORT_MESSAGES[index], index };
}

export function getDailyMessage(segmentIndex) {
    if (segmentIndex >= DAILY_MESSAGES.length) {
        return { message: "You've completed today's message! Come back tomorrow for more ❤️", complete: true };
    }
    // Progressive reveal: only show up to segmentIndex + 1 words
    const fullMessage = DAILY_MESSAGES[segmentIndex];
    const words = fullMessage.split(' ');
    const progress = Math.min(segmentIndex + 1, words.length);
    const partial = words.slice(0, progress).join(' ');
    return {
        message: partial + (progress < words.length ? '...' : ''),
        complete: progress >= words.length
    };
}

export function getDailyMessageCount() {
    return DAILY_MESSAGES.length;
}
