// --- Astro Data and Logic ---
// Placed outside the component function for better organization

const zodiacSignsData = [
    // NOTE: Dates are MM-DD format for easier comparison
    { sign: 'Capricorn', start: '12-22', end: '01-19' }, // Spans year end
    { sign: 'Aquarius', start: '01-20', end: '02-18' },
    { sign: 'Pisces', start: '02-19', end: '03-20' },
    { sign: 'Aries', start: '03-21', end: '04-19' },
    { sign: 'Taurus', start: '04-20', end: '05-20' },
    { sign: 'Gemini', start: '05-21', end: '06-20' },
    { sign: 'Cancer', start: '06-21', end: '07-22' },
    { sign: 'Leo', start: '07-23', end: '08-22' },
    { sign: 'Virgo', start: '08-23', end: '09-22' },
    { sign: 'Libra', start: '09-23', end: '10-22' },
    { sign: 'Scorpio', start: '10-23', end: '11-21' },
    { sign: 'Sagittarius', start: '11-22', end: '12-21' },
];

// Simplified Moon Signs array (as per original logic)
const moonSigns = [
    'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius',
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus',
    'Gemini', 'Cancer'
];

// Motivational Messages
const messages = {
    sun: {
        aries: "Your courage and initiative will help you conquer new challenges this week!",
        taurus: "Your patience and determination will attract abundance in unexpected ways.",
        gemini: "Your curiosity will open doors to exciting opportunities - stay adaptable!",
        cancer: "Trust your intuition - it's guiding you toward emotional fulfillment.",
        leo: "Your creativity is peaking - share your unique gifts with the world!",
        virgo: "Organization meets inspiration - your perfect balance this month.",
        libra: "Seek harmony in partnerships - your diplomacy will create breakthroughs.",
        scorpio: "Deep transformation awaits - embrace change fearlessly.",
        sagittarius: "Adventure calls! Your optimism will light the path forward.",
        capricorn: "Discipline meets innovation - your efforts will yield lasting results.",
        aquarius: "Your unconventional ideas will revolutionize your approach to challenges.",
        pisces: "Emotional intelligence is your superpower - use it wisely."
    },
    moon: {
        leo: "Lead with heart - your warmth will inspire others.",
        virgo: "Attention to detail will prevent potential setbacks.",
        libra: "Seek balance in all things - it's the key to your happiness.",
        scorpio: "Trust your instincts in matters of the heart.",
        sagittarius: "Stay open-minded - growth comes from unexpected places.",
        capricorn: "Patience in planning will ensure success.",
        aquarius: "Embrace your uniqueness - it's your greatest asset.",
        pisces: "Listen to your dreams - they hold hidden wisdom.",
        aries: "Channel your energy into constructive action.",
        taurus: "Appreciate life's simple pleasures - they're your strength.",
        gemini: "Clear communication resolves all conflicts.",
        cancer: "Nurture your connections - they're your foundation."
    }
};

// Function to get Sun Sign
function getSunSign(dob) {
    if (!(dob instanceof Date) || isNaN(dob)) return 'Unknown';
    const month = dob.getMonth() + 1;
    const day = dob.getDate();
    // Format month and day to MM-DD for string comparison
    const monthDay = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    for (const signInfo of zodiacSignsData) {
        // Handle Capricorn separately due to year wrap-around
        if (signInfo.sign === 'Capricorn') {
            if (monthDay >= signInfo.start || monthDay <= signInfo.end) {
                return signInfo.sign;
            }
        } else {
            if (monthDay >= signInfo.start && monthDay <= signInfo.end) {
                return signInfo.sign;
            }
        }
    }
    return 'Unknown'; // Fallback
}

// Function to get Moon Sign (Simplified version from original logic)
function getMoonSign(dob) {
    if (!(dob instanceof Date) || isNaN(dob)) return 'Unknown';
    // Calculate day of the year (1-366)
    const startOfYear = new Date(dob.getFullYear(), 0, 0);
    const diff = dob.getTime() - startOfYear.getTime(); // Use getTime() for accurate difference
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay) + 1; // +1 because Jan 1st is day 1
    // Use modulo to cycle through the moonSigns array
    // Adjust index because array is 0-based and dayOfYear is 1-based
    return moonSigns[(dayOfYear - 1) % 12];
}

// --- End of Astro Data and Logic ---

// Add this at the end of src/astroUtils.js
export { getSunSign, getMoonSign, messages };