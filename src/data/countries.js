// Countries for the signup dropdown: name + ISO 3166-1 alpha-2 code.
// The code is used to fetch each country's flag image from flagcdn.com,
// e.g. https://flagcdn.com/w40/in.png for India.
const COUNTRIES = [
  { code: 'in', name: 'India' },
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'it', name: 'Italy' },
  { code: 'es', name: 'Spain' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
  { code: 'dk', name: 'Denmark' },
  { code: 'fi', name: 'Finland' },
  { code: 'ie', name: 'Ireland' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'at', name: 'Austria' },
  { code: 'be', name: 'Belgium' },
  { code: 'pt', name: 'Portugal' },
  { code: 'pl', name: 'Poland' },
  { code: 'gr', name: 'Greece' },
  { code: 'ru', name: 'Russia' },
  { code: 'tr', name: 'Turkey' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'qa', name: 'Qatar' },
  { code: 'il', name: 'Israel' },
  { code: 'za', name: 'South Africa' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'eg', name: 'Egypt' },
  { code: 'ke', name: 'Kenya' },
  { code: 'cn', name: 'China' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'South Korea' },
  { code: 'sg', name: 'Singapore' },
  { code: 'my', name: 'Malaysia' },
  { code: 'id', name: 'Indonesia' },
  { code: 'th', name: 'Thailand' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'ph', name: 'Philippines' },
  { code: 'bd', name: 'Bangladesh' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'lk', name: 'Sri Lanka' },
  { code: 'np', name: 'Nepal' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'br', name: 'Brazil' },
  { code: 'mx', name: 'Mexico' },
  { code: 'ar', name: 'Argentina' },
  { code: 'cl', name: 'Chile' },
  { code: 'co', name: 'Colombia' },
  { code: 'pe', name: 'Peru' },
]

COUNTRIES.sort((a, b) => a.name.localeCompare(b.name))

export default COUNTRIES

// Small flag image URL for a given ISO code (e.g. 'in' -> India's flag).
export function flagUrl(code, width = 24) {
  return `https://flagcdn.com/w${width}/${code}.png`
}
