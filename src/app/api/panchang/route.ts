export const runtime = 'edge';

// Array of Tithis
const tithis = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
];

// Array of Nakshatras
const nakshatras = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Array of Yogas
const yogas = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula',
  'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
];

// Array of Karanas
const karanas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

function calculateJulianDay(date: Date): number {
  const time = date.getTime();
  return (time / 86400000) + 2440587.5;
}

function calculateRealPanchang(date: Date) {
  const jd = calculateJulianDay(date);
  const t = (jd - 2451545.0) / 36525.0; // Centuries since J2000.0

  // Geometric mean longitude of the Sun
  let l0 = 280.46646 + t * (36000.76983 + t * 0.0003032);
  l0 = l0 % 360;
  if (l0 < 0) l0 += 360;

  // Mean anomaly of the Sun
  let m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  m = m % 360;
  if (m < 0) m += 360;

  // Sun's equation of center
  const mRad = m * (Math.PI / 180);
  const c = Math.sin(mRad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
            Math.sin(2 * mRad) * (0.019993 - 0.000101 * t) +
            Math.sin(3 * mRad) * 0.000289;
  
  let sunTrueLong = l0 + c;
  sunTrueLong = sunTrueLong % 360;
  if (sunTrueLong < 0) sunTrueLong += 360;

  // Moon's mean longitude
  let moonLong = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
  moonLong = moonLong % 360;
  if (moonLong < 0) moonLong += 360;

  // Tithi calculation (Moon - Sun)
  let diff = moonLong - sunTrueLong;
  if (diff < 0) diff += 360;
  const tithiIndex = Math.floor(diff / 12);
  const paksha = diff < 180 ? 'Shukla Paksha' : 'Krishna Paksha';
  let tithiName = tithis[tithiIndex % 15];
  if (tithiName === 'Purnima / Amavasya') {
    tithiName = diff < 180 ? 'Purnima' : 'Amavasya';
  }
  const tithi = `${tithiName} (${paksha})`;

  // Nakshatra calculation (Moon longitude / 13.333...)
  const nakshatraIndex = Math.floor(moonLong / (360 / 27));
  const nakshatra = nakshatras[nakshatraIndex % 27];

  // Yoga calculation ((Sun + Moon) / 13.333...)
  const yogaIndex = Math.floor((sunTrueLong + moonLong) / (360 / 27));
  const yoga = yogas[yogaIndex % 27];

  // Karana calculation (Half of a Tithi = 6 degrees)
  const karanaIndex = Math.floor(diff / 6);
  // Fixed Karanas are at the end/beginning of cycle, others repeat
  let karana = '';
  if (karanaIndex === 0) karana = 'Kintughna';
  else if (karanaIndex === 57) karana = 'Shakuni';
  else if (karanaIndex === 58) karana = 'Chatushpada';
  else if (karanaIndex === 59) karana = 'Naga';
  else {
    karana = karanas[(karanaIndex - 1) % 7];
  }

  return {
    tithi,
    nakshatra,
    yoga,
    karana,
    sunrise: '06:00', // Approximate
    sunset: '18:30', // Approximate
    sunTrueLong: sunTrueLong.toFixed(2),
    moonLong: moonLong.toFixed(2),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr + 'T12:00:00Z');

    const panchang = calculateRealPanchang(date);

    return Response.json({
      date: dateStr,
      ...panchang,
      source: 'computed',
    });
  } catch (err) {
    return Response.json({
      error: 'Failed to calculate panchang',
      details: String(err)
    }, { status: 500 });
  }
}
