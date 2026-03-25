// localStorage wrapper for hydration tracker
const STORAGE_KEYS = {
    API_KEY: 'hydration_api_key',
    TODAY_LOGS: 'hydration_today_logs',
    WEEKLY_DATA: 'hydration_weekly_data',
    IMAGE_HASHES: 'hydration_image_hashes',
    DAILY_MESSAGE_INDEX: 'hydration_daily_msg_index',
    SETTINGS: 'hydration_settings',
    LAST_RESET_DATE: 'hydration_last_reset_date'
};

// Get current date/time info for Chicago (Central Time)
function getChicagoDateInfo() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    }).formatToParts(now);

    const partMap = {};
    parts.forEach(p => { partMap[p.type] = p.value; });

    return {
        dateString: `${partMap.year}-${partMap.month}-${partMap.day}`,
        hour: parseInt(partMap.hour, 10)
    };
}

function getChicagoDateString() {
    return getChicagoDateInfo().dateString;
}

function getChicagoDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date);

    const partMap = {};
    parts.forEach(p => { partMap[p.type] = p.value; });
    return `${partMap.year}-${partMap.month}-${partMap.day}`;
}

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
        const chicagoToday = getChicagoDateString();
        return logs.filter(log => getChicagoDateFromTimestamp(log.timestamp) === chicagoToday);
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
        // Use Chicago date for the day key
        const day = getChicagoDateFromTimestamp(log.timestamp);
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
        const chicagoToday = getChicagoDateString();
        const indexKey = `hydration_daily_msg_${chicagoToday}`;
        const savedIndex = localStorage.getItem(indexKey);
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    },

    incrementDailyMessageIndex() {
        const chicagoToday = getChicagoDateString();
        const indexKey = `hydration_daily_msg_${chicagoToday}`;
        const current = this.getDailyMessageIndex();
        localStorage.setItem(indexKey, (current + 1).toString());
        return current + 1;
    },

    resetDailyMessageIndex() {
        const chicagoToday = getChicagoDateString();
        const indexKey = `hydration_daily_msg_${chicagoToday}`;
        localStorage.setItem(indexKey, '0');
    },

    getLastResetDate() {
        return localStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
    },

    setLastResetDate(dateString) {
        localStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, dateString);
    },

    needsDailyReset() {
        const chicago = getChicagoDateInfo();
        const lastReset = this.getLastResetDate();
        if (!lastReset) return true;
        if (chicago.dateString === lastReset) return false;
        // New day in Chicago: check if it's past 4am
        return chicago.hour >= 4;
    },

    performDailyResetIfNeeded() {
        if (this.needsDailyReset()) {
            this.resetDailyData();
            this.setLastResetDate(getChicagoDateString());
            return true;
        }
        return false;
    },

    resetDailyData() {
        // Clear today's logs (will be empty after reset anyway)
        localStorage.setItem(STORAGE_KEYS.TODAY_LOGS, JSON.stringify([]));
        // Reset daily message index for new day
        this.resetDailyMessageIndex();
        // Note: we keep image hashes and weekly data as they should persist across days
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

export function getChicagoDateStringFromDate(date) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date);
    const map = {};
    parts.forEach(p => map[p.type] = p.value);
    return `${map.year}-${map.month}-${map.day}`;
}

export function getChicagoWeekday(date, options = { weekday: 'short' }) {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        ...options
    }).format(date);
}
