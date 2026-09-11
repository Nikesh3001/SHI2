import { AuthorizedTeamMember } from '../types';

// Helper to generate customized tactical SVG portraits matching the 6 team member photos
function createTacticalPortraitSvg(config: {
  bg: string;
  skin: string;
  hair: string;
  hairStyle: 'female_center_part' | 'female_bun' | 'male_wavy' | 'male_short' | 'male_side_sweep' | 'male_curly';
  shirtColor: string;
  shirtPattern?: 'checkered' | 'striped' | 'collar_accent' | 'plain' | 'embroidery';
  hasBeard?: boolean;
  hasMustache?: boolean;
  hasBindi?: boolean;
  hasNecklace?: boolean;
}): string {
  const {
    bg,
    skin,
    hair,
    hairStyle,
    shirtColor,
    shirtPattern = 'plain',
    hasBeard = false,
    hasMustache = false,
    hasBindi = false,
    hasNecklace = false,
  } = config;

  let hairSvg = '';
  if (hairStyle === 'female_center_part') {
    hairSvg = `
      <!-- Long Hair falling on shoulders -->
      <path d="M 45 45 C 30 50 20 85 22 135 C 28 140 42 140 44 110 C 44 80 46 65 48 55 Z" fill="${hair}" />
      <path d="M 115 45 C 130 50 140 85 138 135 C 132 140 118 140 116 110 C 116 80 114 65 112 55 Z" fill="${hair}" />
      <!-- Top Crown with center part -->
      <path d="M 45 60 C 40 30 60 15 80 18 C 100 15 120 30 115 60 C 110 32 95 24 80 26 C 65 24 50 32 45 60 Z" fill="${hair}" />
      <line x1="80" y1="18" x2="80" y2="35" stroke="#1e293b" stroke-width="1.5" />
    `;
  } else if (hairStyle === 'female_bun') {
    hairSvg = `
      <!-- Sleek Tied Back Hair -->
      <path d="M 46 62 C 40 32 60 18 80 19 C 100 18 120 32 114 62 C 108 30 94 25 80 25 C 66 25 52 30 46 62 Z" fill="${hair}" />
      <ellipse cx="80" cy="18" rx="22" ry="8" fill="${hair}" />
    `;
  } else if (hairStyle === 'male_wavy') {
    hairSvg = `
      <!-- Dense Wavy Dark Volume Hair -->
      <path d="M 44 55 C 38 35 45 12 65 8 C 80 5 95 6 108 12 C 122 20 124 40 118 55 C 115 40 105 28 80 26 C 58 28 48 38 44 55 Z" fill="${hair}" />
      <path d="M 52 14 C 62 8 75 9 82 12 C 90 9 105 10 112 16" stroke="#0f172a" stroke-width="2" fill="none" />
    `;
  } else if (hairStyle === 'male_side_sweep') {
    hairSvg = `
      <!-- Side swept stylish hair -->
      <path d="M 45 52 C 42 30 52 12 75 10 C 95 8 115 16 116 50 C 112 30 98 22 75 22 C 55 24 48 36 45 52 Z" fill="${hair}" />
      <path d="M 58 14 C 70 12 90 15 105 24" stroke="#0f172a" stroke-width="2" fill="none" />
    `;
  } else {
    // short classic cut
    hairSvg = `
      <path d="M 46 54 C 42 32 55 18 80 18 C 105 18 118 32 114 54 C 110 32 98 25 80 25 C 62 25 50 32 46 54 Z" fill="${hair}" />
    `;
  }

  let patternSvg = '';
  if (shirtPattern === 'checkered') {
    patternSvg = `
      <g stroke="rgba(255,255,255,0.18)" stroke-width="1.5">
        <line x1="30" y1="125" x2="130" y2="125" />
        <line x1="20" y1="145" x2="140" y2="145" />
        <line x1="50" y1="105" x2="50" y2="160" />
        <line x1="70" y1="105" x2="70" y2="160" />
        <line x1="90" y1="105" x2="90" y2="160" />
        <line x1="110" y1="105" x2="110" y2="160" />
      </g>
    `;
  } else if (shirtPattern === 'striped') {
    patternSvg = `
      <g stroke="rgba(255,255,255,0.4)" stroke-width="2.5">
        <line x1="45" y1="110" x2="45" y2="160" />
        <line x1="57" y1="110" x2="57" y2="160" />
        <line x1="69" y1="110" x2="69" y2="160" />
        <line x1="91" y1="110" x2="91" y2="160" />
        <line x1="103" y1="110" x2="103" y2="160" />
        <line x1="115" y1="110" x2="115" y2="160" />
      </g>
    `;
  } else if (shirtPattern === 'embroidery') {
    patternSvg = `
      <!-- Lace / Neck Embroidery -->
      <path d="M 68 112 Q 80 126 92 112" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-dasharray="3,2" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="100%" height="100%">
      <rect width="160" height="160" fill="${bg}" />
      <!-- Subtle tactical grid background -->
      <line x1="0" y1="80" x2="160" y2="80" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
      <line x1="80" y1="0" x2="80" y2="160" stroke="rgba(255,255,200,0.05)" stroke-width="1" />
      
      <!-- Torso / Attire -->
      <path d="M 22 160 C 24 125 45 106 80 106 C 115 106 136 125 138 160 Z" fill="${shirtColor}" />
      ${patternSvg}

      <!-- Neck & Chest -->
      <path d="M 66 85 L 66 112 C 66 118 94 118 94 112 L 94 85 Z" fill="${skin}" />

      ${hasNecklace ? `
        <!-- Necklace / Pendant -->
        <path d="M 70 102 Q 80 118 90 102" stroke="#e2e8f0" stroke-width="1" fill="none" />
        <path d="M 78 116 L 82 116 L 80 120 Z" fill="#0f172a" />
      ` : ''}

      <!-- Face Shape -->
      <ellipse cx="80" cy="65" rx="30" ry="36" fill="${skin}" />
      
      <!-- Ears -->
      <ellipse cx="49" cy="67" rx="4" ry="7" fill="${skin}" />
      <ellipse cx="111" cy="67" rx="4" ry="7" fill="${skin}" />

      <!-- Eyes -->
      <ellipse cx="69" cy="62" rx="4.5" ry="3.2" fill="#ffffff" />
      <circle cx="69" cy="62" r="2.2" fill="#1e293b" />
      <ellipse cx="91" cy="62" rx="4.5" ry="3.2" fill="#ffffff" />
      <circle cx="91" cy="62" r="2.2" fill="#1e293b" />

      <!-- Eyebrows -->
      <path d="M 63 56 Q 69 53 75 56" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M 85 56 Q 91 53 97 56" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />

      <!-- Nose -->
      <path d="M 80 62 L 78 72 L 83 72" stroke="#946142" stroke-width="1.6" fill="none" stroke-linecap="round" />

      <!-- Mouth -->
      <path d="M 73 80 Q 80 83 87 80" stroke="#78350f" stroke-width="2" fill="none" stroke-linecap="round" />

      ${hasMustache ? `
        <!-- Mustache -->
        <path d="M 71 76 Q 80 73 89 76" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round" />
      ` : ''}

      ${hasBeard ? `
        <!-- Trimmed Stubble / Beard -->
        <path d="M 58 72 C 60 92 70 102 80 102 C 90 102 100 92 102 72" stroke="#0f172a" stroke-width="2.2" fill="none" stroke-dasharray="1.5,1.5" />
      ` : ''}

      ${hasBindi ? `
        <!-- Forehead Bindi -->
        <circle cx="80" cy="49" r="1.8" fill="#991b1b" />
      ` : ''}

      <!-- Hair on Top -->
      ${hairSvg}

      <!-- Defense Security Clearance Watermark Badge -->
      <rect x="4" y="4" width="38" height="12" rx="2" fill="rgba(15,23,42,0.85)" stroke="rgba(16,185,129,0.7)" stroke-width="0.8" />
      <text x="23" y="12.5" fill="#10b981" font-size="6.5" font-family="monospace" font-weight="bold" text-anchor="middle">AUTH-C2</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

// Generate normalized 128-d pseudo-vector with unique cluster signature for each member
function generateVector(seed: number): number[] {
  const vec: number[] = [];
  let sumSq = 0;
  for (let i = 0; i < 128; i++) {
    // Deterministic pseudo-random based on seed and dimension
    const val = Math.sin(seed * 9301 + i * 49297) * 0.8 + Math.cos(seed * 233280 + i) * 0.2;
    vec.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map(v => Number((v / norm).toFixed(5)));
}

export const INITIAL_AUTHORIZED_TEAM: AuthorizedTeamMember[] = [
  {
    id: 'SEC-LBRCE-01',
    name: 'Nikesh Reddy',
    role: 'Lead System Architect & AI Engineer',
    department: 'LBRCE Sutlej Defense Command',
    clearanceLevel: 'LEVEL_4_COMMAND',
    status: 'AUTHORIZED',
    enrolledDate: '2026-09-01',
    photoUrl: createTacticalPortraitSvg({
      bg: '#2563eb', // Matches blue photo background
      skin: '#c68642',
      hair: '#111827',
      hairStyle: 'male_short',
      shirtColor: '#475569',
      shirtPattern: 'checkered',
      hasMustache: true,
      hasBeard: true,
    }),
    photoDescription: 'Checkered shirt, trimmed beard and mustache, LBRCE portal credentials',
    biometricVector: generateVector(101),
    recognitionThreshold: 0.72,
    detectionCount: 142,
    lastSeenCamera: 'cam-bop-01',
    lastSeenTimestamp: '10:42:15 IST',
    notes: 'Primary System Architect with root C2 authorization and multi-sensor override privileges.'
  },
  {
    id: 'SEC-LBRCE-02',
    name: 'K. Sravani',
    role: 'Computer Vision & Biometrics Specialist',
    department: 'LBRCE Sutlej Defense Command',
    clearanceLevel: 'LEVEL_3_TACTICAL',
    status: 'AUTHORIZED',
    enrolledDate: '2026-09-01',
    photoUrl: createTacticalPortraitSvg({
      bg: '#3b82f6',
      skin: '#d99058',
      hair: '#0f172a',
      hairStyle: 'female_center_part',
      shirtColor: '#fde68a',
      shirtPattern: 'embroidery',
      hasBindi: true,
      hasNecklace: true,
    }),
    photoDescription: 'Center-part dark hair, forehead bindi, beige/cream kurti with black swan necklace',
    biometricVector: generateVector(102),
    recognitionThreshold: 0.74,
    detectionCount: 98,
    lastSeenCamera: 'cam-bop-02',
    lastSeenTimestamp: '09:15:30 IST',
    notes: 'Facial recognition model trainer and neural pipeline lead.'
  },
  {
    id: 'SEC-LBRCE-03',
    name: 'B. Rajesh Kumar',
    role: 'Edge Pipeline & Backend Engineer',
    department: 'LBRCE Sutlej Defense Command',
    clearanceLevel: 'LEVEL_3_TACTICAL',
    status: 'AUTHORIZED',
    enrolledDate: '2026-09-02',
    photoUrl: createTacticalPortraitSvg({
      bg: '#2563eb',
      skin: '#b87333',
      hair: '#111827',
      hairStyle: 'male_short',
      shirtColor: '#78350f',
      shirtPattern: 'checkered',
      hasMustache: true,
    }),
    photoDescription: 'Short dark hair, mustache, brown checked plaid shirt',
    biometricVector: generateVector(103),
    recognitionThreshold: 0.72,
    detectionCount: 84,
    lastSeenCamera: 'cam-bop-03',
    lastSeenTimestamp: '08:50:12 IST',
    notes: 'Specialist in low-latency RTSP decoding and edge neural quantization.'
  },
  {
    id: 'SEC-LBRCE-04',
    name: 'M. Harika',
    role: 'GIS Geospatial & Threat Evaluator',
    department: 'LBRCE Sutlej Defense Command',
    clearanceLevel: 'LEVEL_3_TACTICAL',
    status: 'AUTHORIZED',
    enrolledDate: '2026-09-02',
    photoUrl: createTacticalPortraitSvg({
      bg: '#3b82f6',
      skin: '#c68642',
      hair: '#0f172a',
      hairStyle: 'female_bun',
      shirtColor: '#059669',
      shirtPattern: 'checkered',
      hasBindi: true,
    }),
    photoDescription: 'Tied-back dark hair, green/teal patterned kurti & shawl, bindi',
    biometricVector: generateVector(104),
    recognitionThreshold: 0.75,
    detectionCount: 112,
    lastSeenCamera: 'cam-bop-01',
    lastSeenTimestamp: '11:02:40 IST',
    notes: 'Zero-line coordinate boundary verification and geospatial telemetry.'
  },
  {
    id: 'SEC-LBRCE-05',
    name: 'P. Sai Teja',
    role: 'Hardware & Sensor Interfacing Specialist',
    department: 'LBRCE Sutlej Defense Command',
    clearanceLevel: 'LEVEL_3_TACTICAL',
    status: 'AUTHORIZED',
    enrolledDate: '2026-09-03',
    photoUrl: createTacticalPortraitSvg({
      bg: '#2563eb',
      skin: '#b87333',
      hair: '#020617',
      hairStyle: 'male_wavy',
      shirtColor: '#f8fafc',
      shirtPattern: 'collar_accent',
      hasMustache: true,
    }),
    photoDescription: 'Voluminous dense wavy dark hair, mustache, white collared shirt with blue collar trim',
    biometricVector: generateVector(105),
    recognitionThreshold: 0.71,
    detectionCount: 76,
    lastSeenCamera: 'cam-bop-04',
    lastSeenTimestamp: '07:30:00 IST',
    notes: 'Thermal and PTZ optoelectronic payload integration officer.'
  },
  {
    id: 'SEC-LBRCE-06',
    name: 'V. Karthik',
    role: 'Tactical C2 Operations & Field Interface',
    department: 'LBRCE Sutlej Defense Command',
    clearanceLevel: 'LEVEL_3_TACTICAL',
    status: 'AUTHORIZED',
    enrolledDate: '2026-09-03',
    photoUrl: createTacticalPortraitSvg({
      bg: '#2563eb',
      skin: '#c68642',
      hair: '#111827',
      hairStyle: 'male_side_sweep',
      shirtColor: '#1d4ed8',
      shirtPattern: 'striped',
      hasMustache: true,
    }),
    photoDescription: 'Side-swept dark hair, mustache, blue and white vertically striped shirt',
    biometricVector: generateVector(106),
    recognitionThreshold: 0.73,
    detectionCount: 65,
    lastSeenCamera: 'cam-bop-02',
    lastSeenTimestamp: '09:44:18 IST',
    notes: 'QRF response orchestration and field deployment supervisor.'
  }
];
