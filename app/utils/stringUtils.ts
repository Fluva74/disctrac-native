export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeUsername = (username: string): string => {
  if (!username) return '';
  return username.charAt(0).toUpperCase() + username.slice(1);
};

const STREET_ABBREVIATIONS: { [key: string]: string } = {
  'st': 'St.',
  'rd': 'Rd.',
  'dr': 'Dr.',
  'ln': 'Ln.',
  'ave': 'Ave.',
  'blvd': 'Blvd.',
  'cir': 'Cir.',
  'ct': 'Ct.',
  'pl': 'Pl.',
  'trl': 'Trl.',
  'pkwy': 'Pkwy.',
  'hwy': 'Hwy.',
  'ste': 'Ste.',
  'apt': 'Apt.',
};

const DIRECTIONAL_ABBREVIATIONS: { [key: string]: string } = {
  'n': 'N.',
  's': 'S.',
  'e': 'E.',
  'w': 'W.',
  'nw': 'N.W.',
  'ne': 'N.E.',
  'sw': 'S.W.',
  'se': 'S.E.',
};

const STATE_ABBREVIATIONS: { [key: string]: string } = {
  'al': 'AL.',
  'ak': 'AK.',
  'az': 'AZ.',
  'ar': 'AR.',
  'ca': 'CA.',
  'co': 'CO.',
  'ct': 'CT.',
  'de': 'DE.',
  'fl': 'FL.',
  'ga': 'GA.',
  'hi': 'HI.',
  'id': 'ID.',
  'il': 'IL.',
  'in': 'IN.',
  'ia': 'IA.',
  'ks': 'KS.',
  'ky': 'KY.',
  'la': 'LA.',
  'me': 'ME.',
  'md': 'MD.',
  'ma': 'MA.',
  'mi': 'MI.',
  'mn': 'MN.',
  'ms': 'MS.',
  'mo': 'MO.',
  'mt': 'MT.',
  'ne': 'NE.',
  'nv': 'NV.',
  'nh': 'NH.',
  'nj': 'NJ.',
  'nm': 'NM.',
  'ny': 'NY.',
  'nc': 'NC.',
  'nd': 'ND.',
  'oh': 'OH.',
  'ok': 'OK.',
  'or': 'OR.',
  'pa': 'PA.',
  'ri': 'RI.',
  'sc': 'SC.',
  'sd': 'SD.',
  'tn': 'TN.',
  'tx': 'TX.',
  'ut': 'UT.',
  'vt': 'VT.',
  'va': 'VA.',
  'wa': 'WA.',
  'wv': 'WV.',
  'wi': 'WI.',
  'wy': 'WY.'
};

// Combine all abbreviations for address formatting
const ADDRESS_ABBREVIATIONS: { [key: string]: string } = {
  ...STREET_ABBREVIATIONS,
  ...DIRECTIONAL_ABBREVIATIONS,
  ...STATE_ABBREVIATIONS
};

export const formatAddress = (
  street?: string,
  city?: string,
  state?: string,
  zipCode?: string
): string => {
  const parts: string[] = [];

  // Format street address
  if (street) {
    parts.push(
      street
        .split(' ')
        .map(word => {
          const lowerWord = word.toLowerCase();
          // Check if word is an abbreviation that needs a period
          if (ADDRESS_ABBREVIATIONS[lowerWord]) {
            return ADDRESS_ABBREVIATIONS[lowerWord];
          }
          // Otherwise capitalize first letter
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ')
    );
  }

  // Format city, state
  if (city && state) {
    const formattedState = ADDRESS_ABBREVIATIONS[state.toLowerCase()] || state.toUpperCase() + '.';
    parts.push(`${city.charAt(0).toUpperCase() + city.slice(1)}, ${formattedState}`);
  }

  // Add zip code
  if (zipCode) {
    parts.push(zipCode);
  }

  return parts.join(' ') || '-';
};

export const formatPhoneNumber = (phoneNumber?: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as XXX-XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  return phoneNumber; // Return original if it doesn't match pattern
};

export const formatTime = (time: string, period: 'AM' | 'PM'): string => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hourNum = parseInt(hours, 10);
  
  if (period === 'PM' && hourNum !== 12) {
    return `${hourNum + 12}:${minutes}`;
  } else if (period === 'AM' && hourNum === 12) {
    return `00:${minutes}`;
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`;
};

export const format12Hour = (time: string, period: 'AM' | 'PM'): string => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hourNum = parseInt(hours, 10);
  
  let hour12 = hourNum;
  if (hourNum === 0) {
    hour12 = 12;
  } else if (hourNum > 12) {
    hour12 = hourNum - 12;
  }
  
  return `${hour12}:${minutes} ${period}`;
}; 