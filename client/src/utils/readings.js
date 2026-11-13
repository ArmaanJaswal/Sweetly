export const SLOTS = ['MORNING_FASTING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER']

// MORNING_FASTING -> Morning Fasting
export const formatSlot = (slot) =>
    slot
        .toLowerCase()
        .split('_')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ')

// '2026-11-13' -> 'Fri, 13 Nov 2026'
export const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    })

// Today's date in UTC, matching the server's validation
export const today = () => new Date().toISOString().slice(0, 10)

// Sort by date, then by slot order within a day
export const sortReadings = (readings, { newestFirst = false } = {}) =>
    [...readings].sort((a, b) => {
        if (a.readingDate !== b.readingDate) {
            const byDate = a.readingDate.localeCompare(b.readingDate)
            return newestFirst ? -byDate : byDate
        }
        return SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot)
    })

// [{ date, readings: [...] }, ...] keeping the incoming order
export const groupByDate = (readings) =>
    readings.reduce((groups, reading) => {
        const last = groups[groups.length - 1]
        if (last && last.date === reading.readingDate) last.readings.push(reading)
        else groups.push({ date: reading.readingDate, readings: [reading] })
        return groups
    }, [])

// Common general target range of 70-180 mg/dl
export const getStatus = (value) => {
    if (value < 70) return 'low'
    if (value > 180) return 'high'
    return 'normal'
}
