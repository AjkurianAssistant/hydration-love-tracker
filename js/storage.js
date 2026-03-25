// localStorage wrapper for hydration tracker
const STORAGE_KEYS = {
    API_KEY: 'hydration_api_key',
    TODAY_LOGS: 'hydration_today_logs',
    WEEKLY_DATA: 'hydration_weekly_data',
    IMAGE_HASHES: 'hydration_image_hashes',
    DAILY_MESSAGE_INDEX: 'hydration_daily_msg_index',
    SETTINGS: 'hydration_settings'
};

export const Storage = {
    getAPIKey() {
        return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    },

    setAPIKey(key) {
        localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    },

    getTodayLogs() {
        const data = localStorage.getItem(STORAGE_KEYS.TODAY_LOGS);
        const logs = data ? JSON.parse(data) : [];
        // Filter to only today's logs
        const today = new Date().toDateString();
        return logs.filter(log => new Date(log.timestamp).toDateString() === today);
    },

    addLog(log) {
        const logs = this.getTodayLogs();
        logs.push(log);
        localStorage.setItem(STORAGE_KEYS.TODAY_LOGS, JSON.stringify(logs));
        this.updateWeeklyData(log);
    },

    getWeeklyData() {
        const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_DATA);
        return data ? JSON.parse(data) : {};
    },

    updateWeeklyData(log) {
        const weekly = this.getWeeklyData();
        const day = new Date(log.timestamp).toISOString().slice(0, 10);
        weekly[day] = (weekly[day] || 0) + log.ozAmount;
        localStorage.setItem(STORAGE_KEYS.WEEKLY_DATA, JSON.stringify(weekly));
    },

    getImageHashes() {
        const data = localStorage.getItem(STORAGE_KEYS.IMAGE_HASHES);
        return data ? JSON.parse(data) : [];
    },

    addImageHash(hash) {
        const hashes = this.getImageHashes();
        hashes.push(hash);
        // Keep only last 10
        if (hashes.length > 10) {
            hashes.shift();
        }
        localStorage.setItem(STORAGE_KEYS.IMAGE_HASHES, JSON.stringify(hashes));
    },

    hasImageHash(hash) {
        return this.getImageHashes().includes(hash);
    },

    getDailyMessageIndex() {
        const data = localStorage.getItem(STORAGE_KEYS.DAILY_MESSAGE_INDEX);
        const stored = data ? parseInt(data, 10) : 0;
        const today = new Date().toDateString();
        const indexKey = `hydration_daily_msg_${today}`;
        const savedIndex = localStorage.getItem(indexKey);
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    },

    incrementDailyMessageIndex() {
        const today = new Date().toDateString();
        const indexKey = `hydration_daily_msg_${today}`;
        const current = this.getDailyMessageIndex();
        localStorage.setItem(indexKey, (current + 1).toString());
        return current + 1;
    },

    resetDailyMessageIndex() {
        const today = new Date().toDateString();
        const indexKey = `hydration_daily_msg_${today}`;
        localStorage.setItem(indexKey, '0');
    },

    clearTodayData() {
        const logs = this.getTodayLogs();
        const dailyIndex = this.getDailyMessageIndex();
        localStorage.setItem(STORAGE_KEYS.TODAY_LOGS, JSON.stringify(logs));
        localStorage.setItem(`hydration_daily_msg_${new Date().toDateString()}`, dailyIndex.toString());
    }
};

// Simple hash function for image deduplication
export function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}
