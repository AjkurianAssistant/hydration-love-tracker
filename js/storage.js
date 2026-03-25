// localStorage wrapper for hydration tracker
const STORAGE_KEYS = {
    TODAY_LOGS: 'hydration_today_logs',
    WEEKLY_DATA: 'hydration_weekly_data',
    DAILY_MESSAGE_INDEX: 'hydration_daily_msg_index',
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
        const day = getChicagoDateFromTimestamp(log.timestamp);
        weekly[day] = (weekly[day] || 0) + log.ozAmount;
        localStorage.setItem(STORAGE_KEYS.WEEKLY_DATA, JSON.stringify(weekly));
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
        localStorage.setItem(STORAGE_KEYS.TODAY_LOGS, JSON.stringify([]));
        this.resetDailyMessageIndex();
    }
};

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
