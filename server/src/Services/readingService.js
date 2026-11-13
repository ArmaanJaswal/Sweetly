import { db } from "../prisma/db.ts";

const VALID_SLOTS = ["MORNING_FASTING", "AFTER_BREAKFAST", "AFTER_LUNCH", "AFTER_DINNER"];


export const validateReading = async ({ userId, value, slot, date, excludeId = null }) => {
    const numericValue = Number(value);
    if (!Number.isInteger(numericValue) || numericValue < 40 || numericValue > 600) {
        return { error: "Value must be a whole number between 40 and 600 mg/dl" };
    }

    if (!VALID_SLOTS.includes(slot)) {
        return { error: `Slot must be one of: ${VALID_SLOTS.join(", ")}` };
    }

    
    const parsed = new Date(date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(parsed) || parsed.toISOString().slice(0, 10) !== date) {
        return { error: "Date must be a valid date in YYYY-MM-DD format" };
    }

    
    const today = new Date().toISOString().slice(0, 10);
    if (date > today) {
        return { error: "Date can't be in the future" };
    }

    const readingFound = await db.orm.public.Reading.where({
        userId,
        readingDate: date,
        slot
    }).first();

    if (readingFound && readingFound.id !== excludeId) {
        return { error: `You already have a ${slot} reading for this date` };
    }

    return { data: { value: numericValue, slot, readingDate: date } };
};
