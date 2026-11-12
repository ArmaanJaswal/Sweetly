// Seeds a test user with readings for the previous month and the current month (up to today),
// so the /api/report routes have data to work with.
//
// Run from the server folder:  npm run seed
// Then log in with the credentials printed at the end.
//
// Safe to re-run: it only touches the seed user, and wipes + recreates that user's readings each time.

import bcrypt from 'bcrypt';
import { db } from '../src/prisma/db.ts';

const SEED_USER = {
    name: 'Seed User',
    email: 'seed@sweety.test',
    password: 'password123',
};

// Rough realistic glucose ranges (mg/dl) per slot
const SLOT_RANGES = {
    MORNING_FASTING: [80, 130],
    AFTER_BREAKFAST: [120, 200],
    AFTER_LUNCH: [130, 220],
    AFTER_DINNER: [120, 210],
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// YYYY-MM-DD in UTC, same convention as readingService and reportRoutes
const toDateString = (d) => d.toISOString().slice(0, 10);

// Every date from the 1st of the previous month through today (UTC)
const getSeedDates = () => {
    const now = new Date();
    const today = toDateString(now);
    const dates = [];
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    while (toDateString(d) <= today) {
        dates.push(toDateString(d));
        d.setUTCDate(d.getUTCDate() + 1);
    }
    return dates;
};

const main = async () => {
    // 1. Find or create the seed user
    let user = await db.orm.public.User.where({ email: SEED_USER.email }).first();
    if (!user) {
        const passwordHash = await bcrypt.hash(SEED_USER.password, 10);
        user = await db.orm.public.User.create({
            name: SEED_USER.name,
            email: SEED_USER.email,
            passwordHash,
        });
        console.log(`Created user ${user.email} (id ${user.id})`);
    } else {
        console.log(`Using existing user ${user.email} (id ${user.id})`);
    }

    // 2. Clear this user's old readings so re-running doesn't hit the unique constraint
    await db.orm.public.Reading.where({ userId: user.id }).deleteAll();

    // 3. Insert readings. Skip ~10% of slots at random so the data looks like real usage.
    const dates = getSeedDates();
    let count = 0;
    for (const readingDate of dates) {
        for (const [slot, [min, max]] of Object.entries(SLOT_RANGES)) {
            if (Math.random() < 0.1) continue;
            await db.orm.public.Reading.create({
                userId: user.id,
                readingDate,
                slot,
                value: randomInt(min, max),
            });
            count++;
        }
    }

    console.log(`Inserted ${count} readings from ${dates[0]} to ${dates[dates.length - 1]}`);
    console.log(`\nLog in with: email=${SEED_USER.email}  password=${SEED_USER.password}`);
};

try {
    await main();
} catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
} finally {
    await db.close();
}
