export interface Player {
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  specificPosition: 'GK' | 'LB' | 'CB' | 'RB' | 'LCM' | 'CDM' | 'RCM' | 'LW' | 'ST' | 'RW';
  rating: number;
  team: string;
  flag: string;
}

export const PLAYER_SILHOUETTE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%231F2937"/><circle cx="50" cy="38" r="16" fill="%239CA3AF"/><path d="M46 52h8v10h-8z" fill="%239CA3AF"/><path d="M25 76c0-12 10-16 25-16s25 4 25 16v8H25v-8z" fill="%239CA3AF"/></svg>`;

// Verified player headshot IDs from API-Football for key stars
export const PLAYER_IDS: Record<string, number> = {
  // Argentina
  'L. Messi': 154,
  'A. Mac Allister': 2242,
  'E. Fernandez': 212554,
  'Lautaro Martinez': 892,
  'J. Alvarez': 35852,
  // Portugal
  'Cristiano Ronaldo': 87,
  'Bruno Fernandes': 635,
  'Bernardo Silva': 633,
  'Ruben Dias': 628,
  'Joao Cancelo': 630,
  'Rafael Leao': 2356,
  // France
  'K. Mbappe': 278,
  'A. Griezmann': 123,
  'W. Saliba': 35853,
  'O. Dembele': 868,
  // Brazil
  'Vinicius Jr.': 9971,
  'Rodrygo': 9972,
  'Alisson Becker': 280,
  'Marquinhos': 281,
  'Casemiro': 282,
  // England
  'Harry Kane': 184,
  'Jude Bellingham': 2831,
  'Bukayo Saka': 1459,
  'Cole Palmer': 152982,
  'Declan Rice': 2933,
  'Phil Foden': 645,
  // Norway
  'Erling Haaland': 1102,
  'Martin Odegaard': 303,
  // Egypt
  'Mohamed Salah': 306,
  // Belgium
  'Kevin De Bruyne': 629,
  'Romelu Lukaku': 873,
  'Jeremy Doku': 16055,
  'Leandro Trossard': 207421,
  // Senegal
  'Sadio Mane': 289,
  // Spain
  'Rodri': 35882,
  'Lamine Yamal': 239681,
  'Pedri': 161994,
  'Gavi': 161995,
  // Netherlands
  'Virgil van Dijk': 290,
  // Germany
  'Jamal Musiala': 14400,
  'Florian Wirtz': 161993,
  // Colombia
  'Luis Diaz': 1478,
  // Canada
  'Alphonso Davies': 2736,
  // Morocco
  'Achraf Hakimi': 2382,
  'Yassine Bounou': 843,
  // USA
  'Christian Pulisic': 286,
  // Croatia
  'Luka Modric': 29520
};

const VERIFIED_PLAYERS = new Set(Object.keys(PLAYER_IDS));

export function getPlayerImageUrl(playerName: string): string {
  if (VERIFIED_PLAYERS.has(playerName)) {
    const id = PLAYER_IDS[playerName];
    if (id) {
      return `https://media.api-sports.io/football/players/${id}.png`;
    }
  }

  // Fallback to a high-quality generic player silhouette instead of other famous players' faces
  return PLAYER_SILHOUETTE;
}

// 48 participating nations populated with 11 real players with exact specific positions & ratings
export const TEAM_ROSTERS: Record<string, { name: string; position: 'GK' | 'DEF' | 'MID' | 'FWD'; specificPosition: 'GK' | 'LB' | 'CB' | 'RB' | 'LCM' | 'CDM' | 'RCM' | 'LW' | 'ST' | 'RW'; rating: number; team: string }[]> = {
  Mexico: [
    { name: 'G. Ochoa', position: 'GK', specificPosition: 'GK', rating: 80, team: 'Mexico' },
    { name: 'C. Montes', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Mexico' },
    { name: 'J. Vasquez', position: 'DEF', specificPosition: 'CB', rating: 78, team: 'Mexico' },
    { name: 'J. Gallardo', position: 'DEF', specificPosition: 'LB', rating: 78, team: 'Mexico' },
    { name: 'J. Sanchez', position: 'DEF', specificPosition: 'RB', rating: 77, team: 'Mexico' },
    { name: 'E. Alvarez', position: 'MID', specificPosition: 'CDM', rating: 83, team: 'Mexico' },
    { name: 'L. Chavez', position: 'MID', specificPosition: 'LCM', rating: 80, team: 'Mexico' },
    { name: 'L. Romo', position: 'MID', specificPosition: 'RCM', rating: 77, team: 'Mexico' },
    { name: 'H. Lozano', position: 'FWD', specificPosition: 'LW', rating: 81, team: 'Mexico' },
    { name: 'S. Gimenez', position: 'FWD', specificPosition: 'ST', rating: 82, team: 'Mexico' },
    { name: 'U. Antuna', position: 'FWD', specificPosition: 'RW', rating: 76, team: 'Mexico' }
  ],
  'South Africa': [
    { name: 'R. Williams', position: 'GK', specificPosition: 'GK', rating: 76, team: 'South Africa' },
    { name: 'M. Mvala', position: 'DEF', specificPosition: 'CB', rating: 74, team: 'South Africa' },
    { name: 'G. Kekana', position: 'DEF', specificPosition: 'CB', rating: 73, team: 'South Africa' },
    { name: 'A. Modiba', position: 'DEF', specificPosition: 'LB', rating: 73, team: 'South Africa' },
    { name: 'K. Mudau', position: 'DEF', specificPosition: 'RB', rating: 74, team: 'South Africa' },
    { name: 'T. Mokoena', position: 'MID', specificPosition: 'LCM', rating: 78, team: 'South Africa' },
    { name: 'S. Sithole', position: 'MID', specificPosition: 'CDM', rating: 73, team: 'South Africa' },
    { name: 'T. Zwane', position: 'MID', specificPosition: 'RCM', rating: 75, team: 'South Africa' },
    { name: 'P. Tau', position: 'FWD', specificPosition: 'LW', rating: 77, team: 'South Africa' },
    { name: 'E. Makgopa', position: 'FWD', specificPosition: 'ST', rating: 72, team: 'South Africa' },
    { name: 'T. Morena', position: 'FWD', specificPosition: 'RW', rating: 73, team: 'South Africa' }
  ],
  'South Korea': [
    { name: 'Jo Hyeon-woo', position: 'GK', specificPosition: 'GK', rating: 77, team: 'South Korea' },
    { name: 'Kim Min-jae', position: 'DEF', specificPosition: 'CB', rating: 84, team: 'South Korea' },
    { name: 'Jung Seung-hyun', position: 'DEF', specificPosition: 'CB', rating: 72, team: 'South Korea' },
    { name: 'Seol Young-woo', position: 'DEF', specificPosition: 'LB', rating: 74, team: 'South Korea' },
    { name: 'Kim Tae-hwan', position: 'DEF', specificPosition: 'RB', rating: 71, team: 'South Korea' },
    { name: 'Hwang In-beom', position: 'MID', specificPosition: 'LCM', rating: 78, team: 'South Korea' },
    { name: 'Park Yong-woo', position: 'MID', specificPosition: 'CDM', rating: 71, team: 'South Korea' },
    { name: 'Lee Kang-in', position: 'MID', specificPosition: 'RCM', rating: 81, team: 'South Korea' },
    { name: 'Son Heung-min', position: 'FWD', specificPosition: 'LW', rating: 87, team: 'South Korea' },
    { name: 'Cho Gue-sung', position: 'FWD', specificPosition: 'ST', rating: 75, team: 'South Korea' },
    { name: 'Hwang Hee-chan', position: 'FWD', specificPosition: 'RW', rating: 80, team: 'South Korea' }
  ],
  'Czech Republic': [
    { name: 'J. Stanek', position: 'GK', specificPosition: 'GK', rating: 77, team: 'Czech Republic' },
    { name: 'T. Holes', position: 'DEF', specificPosition: 'CB', rating: 77, team: 'Czech Republic' },
    { name: 'L. Krejci', position: 'DEF', specificPosition: 'CB', rating: 78, team: 'Czech Republic' },
    { name: 'D. Jurasek', position: 'DEF', specificPosition: 'LB', rating: 74, team: 'Czech Republic' },
    { name: 'V. Coufal', position: 'DEF', specificPosition: 'RB', rating: 79, team: 'Czech Republic' },
    { name: 'T. Soucek', position: 'MID', specificPosition: 'CDM', rating: 81, team: 'Czech Republic' },
    { name: 'A. Kral', position: 'MID', specificPosition: 'LCM', rating: 74, team: 'Czech Republic' },
    { name: 'L. Provod', position: 'MID', specificPosition: 'RCM', rating: 76, team: 'Czech Republic' },
    { name: 'V. Cerny', position: 'FWD', specificPosition: 'LW', rating: 77, team: 'Czech Republic' },
    { name: 'P. Schick', position: 'FWD', specificPosition: 'ST', rating: 82, team: 'Czech Republic' },
    { name: 'A. Hlozek', position: 'FWD', specificPosition: 'RW', rating: 77, team: 'Czech Republic' }
  ],
  Canada: [
    { name: 'M. Crepeau', position: 'GK', specificPosition: 'GK', rating: 75, team: 'Canada' },
    { name: 'D. Cornelius', position: 'DEF', specificPosition: 'CB', rating: 74, team: 'Canada' },
    { name: 'A. Johnston', position: 'DEF', specificPosition: 'CB', rating: 77, team: 'Canada' },
    { name: 'A. Davies', position: 'DEF', specificPosition: 'LB', rating: 83, team: 'Canada' },
    { name: 'R. Laryea', position: 'DEF', specificPosition: 'RB', rating: 73, team: 'Canada' },
    { name: 'S. Eustaquio', position: 'MID', specificPosition: 'CDM', rating: 79, team: 'Canada' },
    { name: 'I. Kone', position: 'MID', specificPosition: 'LCM', rating: 75, team: 'Canada' },
    { name: 'J. Osorio', position: 'MID', specificPosition: 'RCM', rating: 74, team: 'Canada' },
    { name: 'J. Shaffelburg', position: 'FWD', specificPosition: 'LW', rating: 73, team: 'Canada' },
    { name: 'J. David', position: 'FWD', specificPosition: 'ST', rating: 82, team: 'Canada' },
    { name: 'C. Larin', position: 'FWD', specificPosition: 'RW', rating: 76, team: 'Canada' }
  ],
  'Bosnia and Herzegovina': [
    { name: 'N. Vasilj', position: 'GK', specificPosition: 'GK', rating: 73, team: 'Bosnia and Herzegovina' },
    { name: 'D. Hadzikadunic', position: 'DEF', specificPosition: 'CB', rating: 73, team: 'Bosnia and Herzegovina' },
    { name: 'A. Ahmedhodzic', position: 'DEF', specificPosition: 'CB', rating: 77, team: 'Bosnia and Herzegovina' },
    { name: 'S. Kolasinac', position: 'DEF', specificPosition: 'LB', rating: 76, team: 'Bosnia and Herzegovina' },
    { name: 'J. Gazibegovic', position: 'DEF', specificPosition: 'RB', rating: 73, team: 'Bosnia and Herzegovina' },
    { name: 'M. Pjanic', position: 'MID', specificPosition: 'LCM', rating: 78, team: 'Bosnia and Herzegovina' },
    { name: 'A. Hadziahmetovic', position: 'MID', specificPosition: 'CDM', rating: 75, team: 'Bosnia and Herzegovina' },
    { name: 'R. Krunic', position: 'MID', specificPosition: 'RCM', rating: 77, team: 'Bosnia and Herzegovina' },
    { name: 'E. Demirovic', position: 'FWD', specificPosition: 'LW', rating: 79, team: 'Bosnia and Herzegovina' },
    { name: 'E. Dzeko', position: 'FWD', specificPosition: 'ST', rating: 80, team: 'Bosnia and Herzegovina' },
    { name: 'H. Hajradinovic', position: 'FWD', specificPosition: 'RW', rating: 74, team: 'Bosnia and Herzegovina' }
  ],
  Qatar: [
    { name: 'Meshaal Barsham', position: 'GK', specificPosition: 'GK', rating: 74, team: 'Qatar' },
    { name: 'Lucas Mendes', position: 'DEF', specificPosition: 'CB', rating: 73, team: 'Qatar' },
    { name: 'Boualem Khoukhi', position: 'DEF', specificPosition: 'CB', rating: 72, team: 'Qatar' },
    { name: 'Homam Ahmed', position: 'DEF', specificPosition: 'LB', rating: 71, team: 'Qatar' },
    { name: 'Ro-Ro', position: 'DEF', specificPosition: 'RB', rating: 72, team: 'Qatar' },
    { name: 'Assim Madibo', position: 'MID', specificPosition: 'CDM', rating: 70, team: 'Qatar' },
    { name: 'Abdelaziz Hatem', position: 'MID', specificPosition: 'LCM', rating: 72, team: 'Qatar' },
    { name: 'Hassan Al-Haydos', position: 'MID', specificPosition: 'RCM', rating: 75, team: 'Qatar' },
    { name: 'Akram Afif', position: 'FWD', specificPosition: 'LW', rating: 79, team: 'Qatar' },
    { name: 'Almoez Ali', position: 'FWD', specificPosition: 'ST', rating: 76, team: 'Qatar' },
    { name: 'Yusuf Abdurisag', position: 'FWD', specificPosition: 'RW', rating: 70, team: 'Qatar' }
  ],
  Switzerland: [
    { name: 'Yann Sommer', position: 'GK', specificPosition: 'GK', rating: 84, team: 'Switzerland' },
    { name: 'Manuel Akanji', position: 'DEF', specificPosition: 'CB', rating: 84, team: 'Switzerland' },
    { name: 'Nico Elvedi', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Switzerland' },
    { name: 'R. Rodriguez', position: 'DEF', specificPosition: 'LB', rating: 77, team: 'Switzerland' },
    { name: 'Silvan Widmer', position: 'DEF', specificPosition: 'RB', rating: 76, team: 'Switzerland' },
    { name: 'Denis Zakaria', position: 'MID', specificPosition: 'CDM', rating: 81, team: 'Switzerland' },
    { name: 'Granit Xhaka', position: 'MID', specificPosition: 'LCM', rating: 84, team: 'Switzerland' },
    { name: 'Remo Freuler', position: 'MID', specificPosition: 'RCM', rating: 79, team: 'Switzerland' },
    { name: 'Ruben Vargas', position: 'FWD', specificPosition: 'LW', rating: 77, team: 'Switzerland' },
    { name: 'Breel Embolo', position: 'FWD', specificPosition: 'ST', rating: 79, team: 'Switzerland' },
    { name: 'Xherdan Shaqiri', position: 'FWD', specificPosition: 'RW', rating: 78, team: 'Switzerland' }
  ],
  Brazil: [
    { name: 'Alisson Becker', position: 'GK', specificPosition: 'GK', rating: 89, team: 'Brazil' },
    { name: 'Marquinhos', position: 'DEF', specificPosition: 'CB', rating: 86, team: 'Brazil' },
    { name: 'Gabriel Magalhaes', position: 'DEF', specificPosition: 'CB', rating: 84, team: 'Brazil' },
    { name: 'Wendell', position: 'DEF', specificPosition: 'LB', rating: 80, team: 'Brazil' },
    { name: 'Danilo', position: 'DEF', specificPosition: 'RB', rating: 80, team: 'Brazil' },
    { name: 'Casemiro', position: 'MID', specificPosition: 'CDM', rating: 83, team: 'Brazil' },
    { name: 'Bruno Guimaraes', position: 'MID', specificPosition: 'LCM', rating: 85, team: 'Brazil' },
    { name: 'Lucas Paqueta', position: 'MID', specificPosition: 'RCM', rating: 82, team: 'Brazil' },
    { name: 'Vinicius Jr.', position: 'FWD', specificPosition: 'LW', rating: 90, team: 'Brazil' },
    { name: 'Endrick', position: 'FWD', specificPosition: 'ST', rating: 79, team: 'Brazil' },
    { name: 'Rodrygo', position: 'FWD', specificPosition: 'RW', rating: 86, team: 'Brazil' }
  ],
  Morocco: [
    { name: 'Yassine Bounou', position: 'GK', specificPosition: 'GK', rating: 84, team: 'Morocco' },
    { name: 'Nayef Aguerd', position: 'DEF', specificPosition: 'CB', rating: 80, team: 'Morocco' },
    { name: 'Romain Saiss', position: 'DEF', specificPosition: 'CB', rating: 78, team: 'Morocco' },
    { name: 'Yahia Attiyat Allah', position: 'DEF', specificPosition: 'LB', rating: 76, team: 'Morocco' },
    { name: 'Achraf Hakimi', position: 'DEF', specificPosition: 'RB', rating: 84, team: 'Morocco' },
    { name: 'Sofyan Amrabat', position: 'MID', specificPosition: 'CDM', rating: 80, team: 'Morocco' },
    { name: 'Azzedine Ounahi', position: 'MID', specificPosition: 'LCM', rating: 78, team: 'Morocco' },
    { name: 'Bilal El Khannouss', position: 'MID', specificPosition: 'RCM', rating: 76, team: 'Morocco' },
    { name: 'Sofiane Boufal', position: 'FWD', specificPosition: 'LW', rating: 77, team: 'Morocco' },
    { name: 'Youssef En-Nesyri', position: 'FWD', specificPosition: 'ST', rating: 81, team: 'Morocco' },
    { name: 'Hakim Ziyech', position: 'FWD', specificPosition: 'RW', rating: 80, team: 'Morocco' }
  ],
  Haiti: [
    { name: 'J. Placide', position: 'GK', specificPosition: 'GK', rating: 70, team: 'Haiti' },
    { name: 'R. Ade', position: 'DEF', specificPosition: 'CB', rating: 71, team: 'Haiti' },
    { name: 'Garven Metusala', position: 'DEF', specificPosition: 'CB', rating: 67, team: 'Haiti' },
    { name: 'A. Christian', position: 'DEF', specificPosition: 'LB', rating: 68, team: 'Haiti' },
    { name: 'Carlens Arcus', position: 'DEF', specificPosition: 'RB', rating: 70, team: 'Haiti' },
    { name: 'Carl Fred Saintle', position: 'MID', specificPosition: 'CDM', rating: 69, team: 'Haiti' },
    { name: 'Bryan Alceus', position: 'MID', specificPosition: 'LCM', rating: 68, team: 'Haiti' },
    { name: 'Danley Jean Jacques', position: 'MID', specificPosition: 'RCM', rating: 72, team: 'Haiti' },
    { name: 'Derrick Etienne', position: 'FWD', specificPosition: 'LW', rating: 71, team: 'Haiti' },
    { name: 'Frantzdy Pierrot', position: 'FWD', specificPosition: 'ST', rating: 74, team: 'Haiti' },
    { name: 'Duckens Nazon', position: 'FWD', specificPosition: 'RW', rating: 72, team: 'Haiti' }
  ],
  Scotland: [
    { name: 'Angus Gunn', position: 'GK', specificPosition: 'GK', rating: 75, team: 'Scotland' },
    { name: 'Jack Hendry', position: 'DEF', specificPosition: 'CB', rating: 75, team: 'Scotland' },
    { name: 'Scott McKenna', position: 'DEF', specificPosition: 'CB', rating: 74, team: 'Scotland' },
    { name: 'Andy Robertson', position: 'DEF', specificPosition: 'LB', rating: 84, team: 'Scotland' },
    { name: 'Anthony Ralston', position: 'DEF', specificPosition: 'RB', rating: 73, team: 'Scotland' },
    { name: 'Scott McTominay', position: 'MID', specificPosition: 'CDM', rating: 80, team: 'Scotland' },
    { name: 'Callum McGregor', position: 'MID', specificPosition: 'LCM', rating: 79, team: 'Scotland' },
    { name: 'John McGinn', position: 'MID', specificPosition: 'RCM', rating: 82, team: 'Scotland' },
    { name: 'Ryan Christie', position: 'FWD', specificPosition: 'LW', rating: 77, team: 'Scotland' },
    { name: 'Lawrence Shankland', position: 'FWD', specificPosition: 'ST', rating: 75, team: 'Scotland' },
    { name: 'James Forrest', position: 'FWD', specificPosition: 'RW', rating: 73, team: 'Scotland' }
  ],
  'United States': [
    { name: 'Matt Turner', position: 'GK', specificPosition: 'GK', rating: 76, team: 'United States' },
    { name: 'Tim Ream', position: 'DEF', specificPosition: 'CB', rating: 76, team: 'United States' },
    { name: 'Chris Richards', position: 'DEF', specificPosition: 'CB', rating: 77, team: 'United States' },
    { name: 'Antonee Robinson', position: 'DEF', specificPosition: 'LB', rating: 79, team: 'United States' },
    { name: 'Joe Scally', position: 'DEF', specificPosition: 'RB', rating: 76, team: 'United States' },
    { name: 'Tyler Adams', position: 'MID', specificPosition: 'CDM', rating: 80, team: 'United States' },
    { name: 'Weston McKennie', position: 'MID', specificPosition: 'LCM', rating: 80, team: 'United States' },
    { name: 'Yunus Musah', position: 'MID', specificPosition: 'RCM', rating: 78, team: 'United States' },
    { name: 'Christian Pulisic', position: 'FWD', specificPosition: 'LW', rating: 83, team: 'United States' },
    { name: 'Folarin Balogun', position: 'FWD', specificPosition: 'ST', rating: 79, team: 'United States' },
    { name: 'Timothy Weah', position: 'FWD', specificPosition: 'RW', rating: 77, team: 'United States' }
  ],
  Paraguay: [
    { name: 'Carlos Coronel', position: 'GK', specificPosition: 'GK', rating: 73, team: 'Paraguay' },
    { name: 'Gustavo Gomez', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Paraguay' },
    { name: 'Fabian Balbuena', position: 'DEF', specificPosition: 'CB', rating: 75, team: 'Paraguay' },
    { name: 'Blas Riveros', position: 'DEF', specificPosition: 'LB', rating: 72, team: 'Paraguay' },
    { name: 'Robert Rojas', position: 'DEF', specificPosition: 'RB', rating: 73, team: 'Paraguay' },
    { name: 'Andres Cubas', position: 'MID', specificPosition: 'CDM', rating: 75, team: 'Paraguay' },
    { name: 'Mathias Villasanti', position: 'MID', specificPosition: 'LCM', rating: 76, team: 'Paraguay' },
    { name: 'Diego Gomez', position: 'MID', specificPosition: 'RCM', rating: 75, team: 'Paraguay' },
    { name: 'Miguel Almiron', position: 'FWD', specificPosition: 'LW', rating: 80, team: 'Paraguay' },
    { name: 'Antonio Sanabria', position: 'FWD', specificPosition: 'ST', rating: 77, team: 'Paraguay' },
    { name: 'Julio Enciso', position: 'FWD', specificPosition: 'RW', rating: 77, team: 'Paraguay' }
  ],
  Australia: [
    { name: 'Mathew Ryan', position: 'GK', specificPosition: 'GK', rating: 76, team: 'Australia' },
    { name: 'Harry Souttar', position: 'DEF', specificPosition: 'CB', rating: 74, team: 'Australia' },
    { name: 'Kye Rowles', position: 'DEF', specificPosition: 'CB', rating: 72, team: 'Australia' },
    { name: 'Aziz Behich', position: 'DEF', specificPosition: 'LB', rating: 72, team: 'Australia' },
    { name: 'Gethin Jones', position: 'DEF', specificPosition: 'RB', rating: 70, team: 'Australia' },
    { name: 'Keanu Baccus', position: 'MID', specificPosition: 'CDM', rating: 71, team: 'Australia' },
    { name: 'Jackson Irvine', position: 'MID', specificPosition: 'LCM', rating: 75, team: 'Australia' },
    { name: 'Connor Metcalfe', position: 'MID', specificPosition: 'RCM', rating: 72, team: 'Australia' },
    { name: 'Craig Goodwin', position: 'FWD', specificPosition: 'LW', rating: 74, team: 'Australia' },
    { name: 'Mitchell Duke', position: 'FWD', specificPosition: 'ST', rating: 71, team: 'Australia' },
    { name: 'Martin Boyle', position: 'FWD', specificPosition: 'RW', rating: 73, team: 'Australia' }
  ],
  Turkey: [
    { name: 'Mert Gunok', position: 'GK', specificPosition: 'GK', rating: 78, team: 'Turkey' },
    { name: 'Abdulkerim Bardakci', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Turkey' },
    { name: 'Merih Demiral', position: 'DEF', specificPosition: 'CB', rating: 78, team: 'Turkey' },
    { name: 'Ferdi Kadioglu', position: 'DEF', specificPosition: 'LB', rating: 80, team: 'Turkey' },
    { name: 'Zeki Celik', position: 'DEF', specificPosition: 'RB', rating: 76, team: 'Turkey' },
    { name: 'Kaan Ayhan', position: 'MID', specificPosition: 'CDM', rating: 76, team: 'Turkey' },
    { name: 'Hakan Calhanoglu', position: 'MID', specificPosition: 'LCM', rating: 85, team: 'Turkey' },
    { name: 'Orkun Kokcu', position: 'MID', specificPosition: 'RCM', rating: 80, team: 'Turkey' },
    { name: 'Kenan Yildiz', position: 'FWD', specificPosition: 'LW', rating: 78, team: 'Turkey' },
    { name: 'Baris Alper Yilmaz', position: 'FWD', specificPosition: 'ST', rating: 78, team: 'Turkey' },
    { name: 'Arda Guler', position: 'FWD', specificPosition: 'RW', rating: 79, team: 'Turkey' }
  ],
  Germany: [
    { name: 'Manuel Neuer', position: 'GK', specificPosition: 'GK', rating: 85, team: 'Germany' },
    { name: 'A. Rudiger', position: 'DEF', specificPosition: 'CB', rating: 87, team: 'Germany' },
    { name: 'Jonathan Tah', position: 'DEF', specificPosition: 'CB', rating: 84, team: 'Germany' },
    { name: 'David Raum', position: 'DEF', specificPosition: 'LB', rating: 80, team: 'Germany' },
    { name: 'Joshua Kimmich', position: 'DEF', specificPosition: 'RB', rating: 85, team: 'Germany' },
    { name: 'Robert Andrich', position: 'MID', specificPosition: 'CDM', rating: 80, team: 'Germany' },
    { name: 'Toni Kroos', position: 'MID', specificPosition: 'LCM', rating: 86, team: 'Germany' },
    { name: 'Ilkay Gundogan', position: 'MID', specificPosition: 'RCM', rating: 85, team: 'Germany' },
    { name: 'Jamal Musiala', position: 'FWD', specificPosition: 'LW', rating: 87, team: 'Germany' },
    { name: 'Kai Havertz', position: 'FWD', specificPosition: 'ST', rating: 84, team: 'Germany' },
    { name: 'Florian Wirtz', position: 'FWD', specificPosition: 'RW', rating: 87, team: 'Germany' }
  ],
  'Curaçao': [
    { name: 'Eloy Room', position: 'GK', specificPosition: 'GK', rating: 72, team: 'Curaçao' },
    { name: 'Cuco Martina', position: 'DEF', specificPosition: 'CB', rating: 71, team: 'Curaçao' },
    { name: 'Jurien Gaari', position: 'DEF', specificPosition: 'CB', rating: 69, team: 'Curaçao' },
    { name: 'Sherel Floranus', position: 'DEF', specificPosition: 'LB', rating: 70, team: 'Curaçao' },
    { name: 'Leandro Bacuna', position: 'DEF', specificPosition: 'RB', rating: 71, team: 'Curaçao' },
    { name: 'Vurnon Anita', position: 'MID', specificPosition: 'CDM', rating: 70, team: 'Curaçao' },
    { name: 'Juninho Bacuna', position: 'MID', specificPosition: 'LCM', rating: 73, team: 'Curaçao' },
    { name: 'Brandley Kuwas', position: 'MID', specificPosition: 'RCM', rating: 70, team: 'Curaçao' },
    { name: 'Kenji Gorre', position: 'FWD', specificPosition: 'LW', rating: 70, team: 'Curaçao' },
    { name: 'Rangelo Janga', position: 'FWD', specificPosition: 'ST', rating: 71, team: 'Curaçao' },
    { name: 'Jearl Margaritha', position: 'FWD', specificPosition: 'RW', rating: 68, team: 'Curaçao' }
  ],
  'Ivory Coast': [
    { name: 'Yahia Fofana', position: 'GK', specificPosition: 'GK', rating: 76, team: 'Ivory Coast' },
    { name: 'Evan Ndicka', position: 'DEF', specificPosition: 'CB', rating: 80, team: 'Ivory Coast' },
    { name: 'Ousmane Diomande', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Ivory Coast' },
    { name: 'Ghislain Konan', position: 'DEF', specificPosition: 'LB', rating: 76, team: 'Ivory Coast' },
    { name: 'Wilfried Singo', position: 'DEF', specificPosition: 'RB', rating: 78, team: 'Ivory Coast' },
    { name: 'Franck Kessie', position: 'MID', specificPosition: 'CDM', rating: 82, team: 'Ivory Coast' },
    { name: 'Seko Fofana', position: 'MID', specificPosition: 'LCM', rating: 81, team: 'Ivory Coast' },
    { name: 'Ibrahim Sangare', position: 'MID', specificPosition: 'RCM', rating: 80, team: 'Ivory Coast' },
    { name: 'Simon Adingra', position: 'FWD', specificPosition: 'LW', rating: 79, team: 'Ivory Coast' },
    { name: 'Sebastien Haller', position: 'FWD', specificPosition: 'ST', rating: 80, team: 'Ivory Coast' },
    { name: 'Nicolas Pepe', position: 'FWD', specificPosition: 'RW', rating: 77, team: 'Ivory Coast' }
  ],
  Ecuador: [
    { name: 'Alexander Dominguez', position: 'GK', specificPosition: 'GK', rating: 74, team: 'Ecuador' },
    { name: 'Willian Pacho', position: 'DEF', specificPosition: 'CB', rating: 80, team: 'Ecuador' },
    { name: 'Felix Torres', position: 'DEF', specificPosition: 'CB', rating: 76, team: 'Ecuador' },
    { name: 'Piero Hincapie', position: 'DEF', specificPosition: 'LB', rating: 81, team: 'Ecuador' },
    { name: 'Angelo Preciado', position: 'DEF', specificPosition: 'RB', rating: 76, team: 'Ecuador' },
    { name: 'Carlos Gruezo', position: 'MID', specificPosition: 'CDM', rating: 74, team: 'Ecuador' },
    { name: 'Moises Caicedo', position: 'MID', specificPosition: 'LCM', rating: 81, team: 'Ecuador' },
    { name: 'Alan Franco', position: 'MID', specificPosition: 'RCM', rating: 74, team: 'Ecuador' },
    { name: 'Jeremy Sarmiento', position: 'FWD', specificPosition: 'LW', rating: 75, team: 'Ecuador' },
    { name: 'Enner Valencia', position: 'FWD', specificPosition: 'ST', rating: 78, team: 'Ecuador' },
    { name: 'Kendry Paez', position: 'FWD', specificPosition: 'RW', rating: 75, team: 'Ecuador' }
  ],
  Netherlands: [
    { name: 'Bart Verbruggen', position: 'GK', specificPosition: 'GK', rating: 79, team: 'Netherlands' },
    { name: 'Virgil van Dijk', position: 'DEF', specificPosition: 'CB', rating: 89, team: 'Netherlands' },
    { name: 'Stefan de Vrij', position: 'DEF', specificPosition: 'CB', rating: 82, team: 'Netherlands' },
    { name: 'Nathan Ake', position: 'DEF', specificPosition: 'LB', rating: 84, team: 'Netherlands' },
    { name: 'Denzel Dumfries', position: 'DEF', specificPosition: 'RB', rating: 81, team: 'Netherlands' },
    { name: 'Jerdy Schouten', position: 'MID', specificPosition: 'CDM', rating: 79, team: 'Netherlands' },
    { name: 'Tijjani Reijnders', position: 'MID', specificPosition: 'LCM', rating: 80, team: 'Netherlands' },
    { name: 'Joey Veerman', position: 'MID', specificPosition: 'RCM', rating: 79, team: 'Netherlands' },
    { name: 'Cody Gakpo', position: 'FWD', specificPosition: 'LW', rating: 83, team: 'Netherlands' },
    { name: 'Memphis Depay', position: 'FWD', specificPosition: 'ST', rating: 81, team: 'Netherlands' },
    { name: 'Donyell Malen', position: 'FWD', specificPosition: 'RW', rating: 81, team: 'Netherlands' }
  ],
  Japan: [
    { name: 'Zion Suzuki', position: 'GK', specificPosition: 'GK', rating: 74, team: 'Japan' },
    { name: 'Ko Itakura', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Japan' },
    { name: 'Shogo Taniguchi', position: 'DEF', specificPosition: 'CB', rating: 73, team: 'Japan' },
    { name: 'Hiroki Ito', position: 'DEF', specificPosition: 'LB', rating: 79, team: 'Japan' },
    { name: 'Yukinari Sugawara', position: 'DEF', specificPosition: 'RB', rating: 77, team: 'Japan' },
    { name: 'Hidemasa Morita', position: 'MID', specificPosition: 'CDM', rating: 79, team: 'Japan' },
    { name: 'Wataru Endo', position: 'MID', specificPosition: 'LCM', rating: 80, team: 'Japan' },
    { name: 'Takefusa Kubo', position: 'MID', specificPosition: 'RCM', rating: 81, team: 'Japan' },
    { name: 'Kaoru Mitoma', position: 'FWD', specificPosition: 'LW', rating: 83, team: 'Japan' },
    { name: 'Ayase Ueda', position: 'FWD', specificPosition: 'ST', rating: 76, team: 'Japan' },
    { name: 'Ritsu Doan', position: 'FWD', specificPosition: 'RW', rating: 79, team: 'Japan' }
  ],
  Sweden: [
    { name: 'Robin Olsen', position: 'GK', specificPosition: 'GK', rating: 76, team: 'Sweden' },
    { name: 'Victor Lindelof', position: 'DEF', specificPosition: 'CB', rating: 78, team: 'Sweden' },
    { name: 'Isak Hien', position: 'DEF', specificPosition: 'CB', rating: 78, team: 'Sweden' },
    { name: 'Ludwig Augustinsson', position: 'DEF', specificPosition: 'LB', rating: 74, team: 'Sweden' },
    { name: 'Emil Krafth', position: 'DEF', specificPosition: 'RB', rating: 74, team: 'Sweden' },
    { name: 'Hugo Larsson', position: 'MID', specificPosition: 'CDM', rating: 76, team: 'Sweden' },
    { name: 'Jens Cajuste', position: 'MID', specificPosition: 'LCM', rating: 75, team: 'Sweden' },
    { name: 'Emil Forsberg', position: 'MID', specificPosition: 'RCM', rating: 77, team: 'Sweden' },
    { name: 'Alexander Isak', position: 'FWD', specificPosition: 'LW', rating: 84, team: 'Sweden' },
    { name: 'Viktor Gyokeres', position: 'FWD', specificPosition: 'ST', rating: 84, team: 'Sweden' },
    { name: 'Dejan Kulusevski', position: 'FWD', specificPosition: 'RW', rating: 82, team: 'Sweden' }
  ],
  Tunisia: [
    { name: 'Bechir Ben Said', position: 'GK', specificPosition: 'GK', rating: 72, team: 'Tunisia' },
    { name: 'Yassine Meriah', position: 'DEF', specificPosition: 'CB', rating: 73, team: 'Tunisia' },
    { name: 'Montassar Talbi', position: 'DEF', specificPosition: 'CB', rating: 75, team: 'Tunisia' },
    { name: 'Ali Abdi', position: 'DEF', specificPosition: 'LB', rating: 73, team: 'Tunisia' },
    { name: 'Wajdi Kechrida', position: 'DEF', specificPosition: 'RB', rating: 72, team: 'Tunisia' },
    { name: 'Ellyes Skhiri', position: 'MID', specificPosition: 'CDM', rating: 78, team: 'Tunisia' },
    { name: 'Aissa Laidouni', position: 'MID', specificPosition: 'LCM', rating: 74, team: 'Tunisia' },
    { name: 'Hamza Rafia', position: 'MID', specificPosition: 'RCM', rating: 71, team: 'Tunisia' },
    { name: 'Elias Achouri', position: 'FWD', specificPosition: 'LW', rating: 74, team: 'Tunisia' },
    { name: 'Youssef Msakni', position: 'FWD', specificPosition: 'ST', rating: 73, team: 'Tunisia' },
    { name: 'Sayfallah Ltaief', position: 'FWD', specificPosition: 'RW', rating: 70, team: 'Tunisia' }
  ],
  Belgium: [
    { name: 'Koen Casteels', position: 'GK', specificPosition: 'GK', rating: 82, team: 'Belgium' },
    { name: 'Wout Faes', position: 'DEF', specificPosition: 'CB', rating: 77, team: 'Belgium' },
    { name: 'Jan Vertonghen', position: 'DEF', specificPosition: 'CB', rating: 77, team: 'Belgium' },
    { name: 'Arthur Theate', position: 'DEF', specificPosition: 'LB', rating: 78, team: 'Belgium' },
    { name: 'Timothy Castagne', position: 'DEF', specificPosition: 'RB', rating: 78, team: 'Belgium' },
    { name: 'Orel Mangala', position: 'MID', specificPosition: 'CDM', rating: 77, team: 'Belgium' },
    { name: 'Amadou Onana', position: 'MID', specificPosition: 'LCM', rating: 80, team: 'Belgium' },
    { name: 'Kevin De Bruyne', position: 'MID', specificPosition: 'RCM', rating: 91, team: 'Belgium' },
    { name: 'Jeremy Doku', position: 'FWD', specificPosition: 'LW', rating: 82, team: 'Belgium' },
    { name: 'Romelu Lukaku', position: 'FWD', specificPosition: 'ST', rating: 83, team: 'Belgium' },
    { name: 'Leandro Trossard', position: 'FWD', specificPosition: 'RW', rating: 82, team: 'Belgium' }
  ],
  Egypt: [
    { name: 'Mohamed El Shenawy', position: 'GK', specificPosition: 'GK', rating: 77, team: 'Egypt' },
    { name: 'Mohamed Abdelmonem', position: 'DEF', specificPosition: 'CB', rating: 76, team: 'Egypt' },
    { name: 'Ahmed Hegazi', position: 'DEF', specificPosition: 'CB', rating: 73, team: 'Egypt' },
    { name: 'Mohamed Hamdy', position: 'DEF', specificPosition: 'LB', rating: 71, team: 'Egypt' },
    { name: 'Mohamed Hany', position: 'DEF', specificPosition: 'RB', rating: 72, team: 'Egypt' },
    { name: 'Marwan Attia', position: 'MID', specificPosition: 'CDM', rating: 73, team: 'Egypt' },
    { name: 'Emam Ashour', position: 'MID', specificPosition: 'LCM', rating: 76, team: 'Egypt' },
    { name: 'Mohamed Elneny', position: 'MID', specificPosition: 'RCM', rating: 74, team: 'Egypt' },
    { name: 'Trezeguet', position: 'FWD', specificPosition: 'LW', rating: 76, team: 'Egypt' },
    { name: 'Mostafa Mohamed', position: 'FWD', specificPosition: 'ST', rating: 77, team: 'Egypt' },
    { name: 'Mohamed Salah', position: 'FWD', specificPosition: 'RW', rating: 89, team: 'Egypt' }
  ],
  Iran: [
    { name: 'Alireza Beiranvand', position: 'GK', specificPosition: 'GK', rating: 74, team: 'Iran' },
    { name: 'Shojae Khalilzadeh', position: 'DEF', specificPosition: 'CB', rating: 72, team: 'Iran' },
    { name: 'Hossein Kanaanizadegan', position: 'DEF', specificPosition: 'CB', rating: 73, team: 'Iran' },
    { name: 'Milad Mohammadi', position: 'DEF', specificPosition: 'LB', rating: 72, team: 'Iran' },
    { name: 'Ramin Rezaeian', position: 'DEF', specificPosition: 'RB', rating: 73, team: 'Iran' },
    { name: 'Saeid Ezatolahi', position: 'MID', specificPosition: 'CDM', rating: 73, team: 'Iran' },
    { name: 'Saman Ghoddos', position: 'MID', specificPosition: 'LCM', rating: 72, team: 'Iran' },
    { name: 'Alireza Jahanbakhsh', position: 'MID', specificPosition: 'RCM', rating: 74, team: 'Iran' },
    { name: 'Mehdi Taremi', position: 'FWD', specificPosition: 'LW', rating: 80, team: 'Iran' },
    { name: 'Sardar Azmoun', position: 'FWD', specificPosition: 'ST', rating: 78, team: 'Iran' },
    { name: 'Ali Gholizadeh', position: 'FWD', specificPosition: 'RW', rating: 71, team: 'Iran' }
  ],
  'New Zealand': [
    { name: 'Oliver Sail', position: 'GK', specificPosition: 'GK', rating: 68, team: 'New Zealand' },
    { name: 'Tommy Smith', position: 'DEF', specificPosition: 'CB', rating: 67, team: 'New Zealand' },
    { name: 'Michael Boxall', position: 'DEF', specificPosition: 'CB', rating: 69, team: 'New Zealand' },
    { name: 'Liberato Cacace', position: 'DEF', specificPosition: 'LB', rating: 73, team: 'New Zealand' },
    { name: 'Bill Tuiloma', position: 'DEF', specificPosition: 'RB', rating: 70, team: 'New Zealand' },
    { name: 'Matthew Garbett', position: 'MID', specificPosition: 'CDM', rating: 69, team: 'New Zealand' },
    { name: 'Marko Stamenic', position: 'MID', specificPosition: 'LCM', rating: 72, team: 'New Zealand' },
    { name: 'Sarpreet Singh', position: 'MID', specificPosition: 'RCM', rating: 70, team: 'New Zealand' },
    { name: 'Kosta Barbarouses', position: 'FWD', specificPosition: 'LW', rating: 68, team: 'New Zealand' },
    { name: 'Chris Wood', position: 'FWD', specificPosition: 'ST', rating: 77, team: 'New Zealand' },
    { name: 'Ben Waine', position: 'FWD', specificPosition: 'RW', rating: 67, team: 'New Zealand' }
  ],
  Spain: [
    { name: 'Unai Simon', position: 'GK', specificPosition: 'GK', rating: 84, team: 'Spain' },
    { name: 'Aymeric Laporte', position: 'DEF', specificPosition: 'CB', rating: 83, team: 'Spain' },
    { name: 'R. Le Normand', position: 'DEF', specificPosition: 'CB', rating: 81, team: 'Spain' },
    { name: 'Marc Cucurella', position: 'DEF', specificPosition: 'LB', rating: 80, team: 'Spain' },
    { name: 'Dani Carvajal', position: 'DEF', specificPosition: 'RB', rating: 85, team: 'Spain' },
    { name: 'Rodri', position: 'MID', specificPosition: 'CDM', rating: 91, team: 'Spain' },
    { name: 'Pedri', position: 'MID', specificPosition: 'LCM', rating: 86, team: 'Spain' },
    { name: 'Gavi', position: 'MID', specificPosition: 'RCM', rating: 84, team: 'Spain' },
    { name: 'Nico Williams', position: 'FWD', specificPosition: 'LW', rating: 84, team: 'Spain' },
    { name: 'Alvaro Morata', position: 'FWD', specificPosition: 'ST', rating: 83, team: 'Spain' },
    { name: 'Lamine Yamal', position: 'FWD', specificPosition: 'RW', rating: 85, team: 'Spain' }
  ],
  'Cape Verde': [
    { name: 'Vozinha', position: 'GK', specificPosition: 'GK', rating: 69, team: 'Cape Verde' },
    { name: 'Logan Costa', position: 'DEF', specificPosition: 'CB', rating: 75, team: 'Cape Verde' },
    { name: 'Roberto Lopes', position: 'DEF', specificPosition: 'CB', rating: 69, team: 'Cape Verde' },
    { name: 'Joao Paulo', position: 'DEF', specificPosition: 'LB', rating: 68, team: 'Cape Verde' },
    { name: 'Steven Moreira', position: 'DEF', specificPosition: 'RB', rating: 71, team: 'Cape Verde' },
    { name: 'Kevin Pina', position: 'MID', specificPosition: 'CDM', rating: 72, team: 'Cape Verde' },
    { name: 'Jamiro Monteiro', position: 'MID', specificPosition: 'LCM', rating: 71, team: 'Cape Verde' },
    { name: 'Patrick Andrade', position: 'MID', specificPosition: 'RCM', rating: 69, team: 'Cape Verde' },
    { name: 'Jovane Cabral', position: 'FWD', specificPosition: 'LW', rating: 73, team: 'Cape Verde' },
    { name: 'Garry Rodrigues', position: 'FWD', specificPosition: 'ST', rating: 73, team: 'Cape Verde' },
    { name: 'Ryan Mendes', position: 'FWD', specificPosition: 'RW', rating: 72, team: 'Cape Verde' }
  ],
  'Saudi Arabia': [
    { name: 'Mohammed Al-Owais', position: 'GK', specificPosition: 'GK', rating: 74, team: 'Saudi Arabia' },
    { name: 'Ali Al-Bulayhi', position: 'DEF', specificPosition: 'CB', rating: 73, team: 'Saudi Arabia' },
    { name: 'Hassan Tambakti', position: 'DEF', specificPosition: 'CB', rating: 74, team: 'Saudi Arabia' },
    { name: 'Yasir Al-Shahrani', position: 'DEF', specificPosition: 'LB', rating: 72, team: 'Saudi Arabia' },
    { name: 'Saud Abdulhamid', position: 'DEF', specificPosition: 'RB', rating: 76, team: 'Saudi Arabia' },
    { name: 'Abdullah Otayf', position: 'MID', specificPosition: 'CDM', rating: 70, team: 'Saudi Arabia' },
    { name: 'Mohamed Kanno', position: 'MID', specificPosition: 'LCM', rating: 73, team: 'Saudi Arabia' },
    { name: 'Salman Al-Faraj', position: 'MID', specificPosition: 'RCM', rating: 72, team: 'Saudi Arabia' },
    { name: 'Salem Al-Dawsari', position: 'FWD', specificPosition: 'LW', rating: 77, team: 'Saudi Arabia' },
    { name: 'Firas Al-Buraikan', position: 'FWD', specificPosition: 'ST', rating: 74, team: 'Saudi Arabia' },
    { name: 'Saleh Al-Shehri', position: 'FWD', specificPosition: 'RW', rating: 71, team: 'Saudi Arabia' }
  ],
  Uruguay: [
    { name: 'Sergio Rochet', position: 'GK', specificPosition: 'GK', rating: 79, team: 'Uruguay' },
    { name: 'Ronald Araujo', position: 'DEF', specificPosition: 'CB', rating: 85, team: 'Uruguay' },
    { name: 'Jose Maria Gimenez', position: 'DEF', specificPosition: 'CB', rating: 81, team: 'Uruguay' },
    { name: 'Mathias Olivera', position: 'DEF', specificPosition: 'LB', rating: 78, team: 'Uruguay' },
    { name: 'Nahitan Nandez', position: 'DEF', specificPosition: 'RB', rating: 77, team: 'Uruguay' },
    { name: 'Manuel Ugarte', position: 'MID', specificPosition: 'CDM', rating: 81, team: 'Uruguay' },
    { name: 'Federico Valverde', position: 'MID', specificPosition: 'LCM', rating: 88, team: 'Uruguay' },
    { name: 'Nicolas de la Cruz', position: 'MID', specificPosition: 'RCM', rating: 79, team: 'Uruguay' },
    { name: 'Maximiliano Araujo', position: 'FWD', specificPosition: 'LW', rating: 76, team: 'Uruguay' },
    { name: 'Darwin Nunez', position: 'FWD', specificPosition: 'ST', rating: 82, team: 'Uruguay' },
    { name: 'Facundo Pellistri', position: 'FWD', specificPosition: 'RW', rating: 76, team: 'Uruguay' }
  ],
  France_dup: [
    // Duplicate handler just in case
  ],
  Senegal: [
    { name: 'Edouard Mendy', position: 'GK', specificPosition: 'GK', rating: 80, team: 'Senegal' },
    { name: 'Kalidou Koulibaly', position: 'DEF', specificPosition: 'CB', rating: 81, team: 'Senegal' },
    { name: 'Abdou Diallo', position: 'DEF', specificPosition: 'CB', rating: 76, team: 'Senegal' },
    { name: 'Ismail Jakobs', position: 'DEF', specificPosition: 'LB', rating: 74, team: 'Senegal' },
    { name: 'Krepin Diatta', position: 'DEF', specificPosition: 'RB', rating: 75, team: 'Senegal' },
    { name: 'Pape Gueye', position: 'MID', specificPosition: 'CDM', rating: 75, team: 'Senegal' },
    { name: 'Lamine Camara', position: 'MID', specificPosition: 'LCM', rating: 76, team: 'Senegal' },
    { name: 'Idrissa Gueye', position: 'MID', specificPosition: 'RCM', rating: 76, team: 'Senegal' },
    { name: 'Sadio Mane', position: 'FWD', specificPosition: 'LW', rating: 83, team: 'Senegal' },
    { name: 'Nicolas Jackson', position: 'FWD', specificPosition: 'ST', rating: 81, team: 'Senegal' },
    { name: 'Ismaila Sarr', position: 'FWD', specificPosition: 'RW', rating: 76, team: 'Senegal' }
  ],
  Iraq: [
    { name: 'Jalal Hassan', position: 'GK', specificPosition: 'GK', rating: 70, team: 'Iraq' },
    { name: 'Rebin Sulaka', position: 'DEF', specificPosition: 'CB', rating: 68, team: 'Iraq' },
    { name: 'Saad Natiq', position: 'DEF', specificPosition: 'CB', rating: 68, team: 'Iraq' },
    { name: 'Merchas Doski', position: 'DEF', specificPosition: 'LB', rating: 70, team: 'Iraq' },
    { name: 'Hussein Ali', position: 'DEF', specificPosition: 'RB', rating: 69, team: 'Iraq' },
    { name: 'Osama Rashid', position: 'MID', specificPosition: 'CDM', rating: 68, team: 'Iraq' },
    { name: 'Amir Al-Ammari', position: 'MID', specificPosition: 'LCM', rating: 71, team: 'Iraq' },
    { name: 'Ibrahim Bayesh', position: 'MID', specificPosition: 'RCM', rating: 72, team: 'Iraq' },
    { name: 'Ali Jasim', position: 'FWD', specificPosition: 'LW', rating: 73, team: 'Iraq' },
    { name: 'Aymen Hussein', position: 'FWD', specificPosition: 'ST', rating: 75, team: 'Iraq' },
    { name: 'Youssef Amyn', position: 'FWD', specificPosition: 'RW', rating: 69, team: 'Iraq' }
  ],
  Norway: [
    { name: 'Orjan Nyland', position: 'GK', specificPosition: 'GK', rating: 75, team: 'Norway' },
    { name: 'Leo Ostigard', position: 'DEF', specificPosition: 'CB', rating: 76, team: 'Norway' },
    { name: 'Kristoffer Ajer', position: 'DEF', specificPosition: 'CB', rating: 75, team: 'Norway' },
    { name: 'Julian Ryerson', position: 'DEF', specificPosition: 'LB', rating: 79, team: 'Norway' },
    { name: 'Marcus Pedersen', position: 'DEF', specificPosition: 'RB', rating: 72, team: 'Norway' },
    { name: 'Sander Berge', position: 'MID', specificPosition: 'CDM', rating: 78, team: 'Norway' },
    { name: 'Martin Odegaard', position: 'MID', specificPosition: 'LCM', rating: 87, team: 'Norway' },
    { name: 'Patrick Berg', position: 'MID', specificPosition: 'RCM', rating: 74, team: 'Norway' },
    { name: 'Antonio Nusa', position: 'FWD', specificPosition: 'LW', rating: 76, team: 'Norway' },
    { name: 'Erling Haaland', position: 'FWD', specificPosition: 'ST', rating: 91, team: 'Norway' },
    { name: 'Alexander Sorloth', position: 'FWD', specificPosition: 'RW', rating: 80, team: 'Norway' }
  ],
  Argentina: [
    { name: 'E. Martinez', position: 'GK', specificPosition: 'GK', rating: 87, team: 'Argentina' },
    { name: 'C. Romero', position: 'DEF', specificPosition: 'CB', rating: 86, team: 'Argentina' },
    { name: 'L. Martinez', position: 'DEF', specificPosition: 'CB', rating: 84, team: 'Argentina' },
    { name: 'N. Tagliafico', position: 'DEF', specificPosition: 'LB', rating: 81, team: 'Argentina' },
    { name: 'N. Molina', position: 'DEF', specificPosition: 'RB', rating: 82, team: 'Argentina' },
    { name: 'E. Fernandez', position: 'MID', specificPosition: 'CDM', rating: 84, team: 'Argentina' },
    { name: 'A. Mac Allister', position: 'MID', specificPosition: 'LCM', rating: 86, team: 'Argentina' },
    { name: 'R. De Paul', position: 'MID', specificPosition: 'RCM', rating: 84, team: 'Argentina' },
    { name: 'J. Alvarez', position: 'FWD', specificPosition: 'LW', rating: 84, team: 'Argentina' },
    { name: 'Lautaro Martinez', position: 'FWD', specificPosition: 'ST', rating: 87, team: 'Argentina' },
    { name: 'L. Messi', position: 'FWD', specificPosition: 'RW', rating: 92, team: 'Argentina' }
  ],
  Algeria: [
    { name: 'Anthony Mandrea', position: 'GK', specificPosition: 'GK', rating: 73, team: 'Algeria' },
    { name: 'Ramy Bensebaini', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Algeria' },
    { name: 'Aissa Mandi', position: 'DEF', specificPosition: 'CB', rating: 75, team: 'Algeria' },
    { name: 'Rayan Ait-Nouri', position: 'DEF', specificPosition: 'LB', rating: 79, team: 'Algeria' },
    { name: 'Youcef Atal', position: 'DEF', specificPosition: 'RB', rating: 74, team: 'Algeria' },
    { name: 'Ramiz Zerrouki', position: 'MID', specificPosition: 'CDM', rating: 75, team: 'Algeria' },
    { name: 'Ismael Bennacer', position: 'MID', specificPosition: 'LCM', rating: 81, team: 'Algeria' },
    { name: 'Houssem Aouar', position: 'MID', specificPosition: 'RCM', rating: 77, team: 'Algeria' },
    { name: 'Said Benrahma', position: 'FWD', specificPosition: 'LW', rating: 78, team: 'Algeria' },
    { name: 'Baghdad Bounedjah', position: 'FWD', specificPosition: 'ST', rating: 76, team: 'Algeria' },
    { name: 'Riyad Mahrez', position: 'FWD', specificPosition: 'RW', rating: 82, team: 'Algeria' }
  ],
  Austria: [
    { name: 'Alexander Schlager', position: 'GK', specificPosition: 'GK', rating: 75, team: 'Austria' },
    { name: 'Kevin Danso', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Austria' },
    { name: 'Philipp Lienhart', position: 'DEF', specificPosition: 'CB', rating: 78, team: 'Austria' },
    { name: 'Phillipp Mwene', position: 'DEF', specificPosition: 'LB', rating: 74, team: 'Austria' },
    { name: 'Stefan Posch', position: 'DEF', specificPosition: 'RB', rating: 79, team: 'Austria' },
    { name: 'Konrad Laimer', position: 'MID', specificPosition: 'CDM', rating: 81, team: 'Austria' },
    { name: 'Marcel Sabitzer', position: 'MID', specificPosition: 'LCM', rating: 81, team: 'Austria' },
    { name: 'Nicolas Seiwald', position: 'MID', specificPosition: 'RCM', rating: 76, team: 'Austria' },
    { name: 'Christoph Baumgartner', position: 'FWD', specificPosition: 'LW', rating: 79, team: 'Austria' },
    { name: 'Michael Gregoritsch', position: 'FWD', specificPosition: 'ST', rating: 77, team: 'Austria' },
    { name: 'Patrick Wimmer', position: 'FWD', specificPosition: 'RW', rating: 76, team: 'Austria' }
  ],
  Jordan: [
    { name: 'Yazid Abu Layla', position: 'GK', specificPosition: 'GK', rating: 72, team: 'Jordan' },
    { name: 'Yazan Al-Arab', position: 'DEF', specificPosition: 'CB', rating: 71, team: 'Jordan' },
    { name: 'Abdallah Nasib', position: 'DEF', specificPosition: 'CB', rating: 70, team: 'Jordan' },
    { name: 'Salem Al-Ajalin', position: 'DEF', specificPosition: 'LB', rating: 68, team: 'Jordan' },
    { name: 'Ihsan Haddad', position: 'DEF', specificPosition: 'RB', rating: 69, team: 'Jordan' },
    { name: 'Noor Al-Rawabdeh', position: 'MID', specificPosition: 'CDM', rating: 70, team: 'Jordan' },
    { name: 'Nizar Al-Rashdan', position: 'MID', specificPosition: 'LCM', rating: 69, team: 'Jordan' },
    { name: 'Mahmoud Al-Mardi', position: 'MID', specificPosition: 'RCM', rating: 71, team: 'Jordan' },
    { name: 'Ali Olwan', position: 'FWD', specificPosition: 'LW', rating: 70, team: 'Jordan' },
    { name: 'Yazan Al-Naimat', position: 'FWD', specificPosition: 'ST', rating: 74, team: 'Jordan' },
    { name: 'Musa Al-Taamari', position: 'FWD', specificPosition: 'RW', rating: 77, team: 'Jordan' }
  ],
  Portugal: [
    { name: 'Diogo Costa', position: 'GK', specificPosition: 'GK', rating: 84, team: 'Portugal' },
    { name: 'Ruben Dias', position: 'DEF', specificPosition: 'CB', rating: 89, team: 'Portugal' },
    { name: 'Antonio Silva', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Portugal' },
    { name: 'Nuno Mendes', position: 'DEF', specificPosition: 'LB', rating: 83, team: 'Portugal' },
    { name: 'Joao Cancelo', position: 'DEF', specificPosition: 'RB', rating: 85, team: 'Portugal' },
    { name: 'Joao Palhinha', position: 'MID', specificPosition: 'CDM', rating: 84, team: 'Portugal' },
    { name: 'Vitinha', position: 'MID', specificPosition: 'LCM', rating: 85, team: 'Portugal' },
    { name: 'Bruno Fernandes', position: 'MID', specificPosition: 'RCM', rating: 87, team: 'Portugal' },
    { name: 'Rafael Leao', position: 'FWD', specificPosition: 'LW', rating: 87, team: 'Portugal' },
    { name: 'Cristiano Ronaldo', position: 'FWD', specificPosition: 'ST', rating: 86, team: 'Portugal' },
    { name: 'Bernardo Silva', position: 'FWD', specificPosition: 'RW', rating: 88, team: 'Portugal' }
  ],
  'Democratic Republic of the Congo': [
    { name: 'Lionel Mpasi', position: 'GK', specificPosition: 'GK', rating: 72, team: 'Democratic Republic of the Congo' },
    { name: 'Chancel Mbemba', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Democratic Republic of the Congo' },
    { name: 'Henoc Inonga', position: 'DEF', specificPosition: 'CB', rating: 72, team: 'Democratic Republic of the Congo' },
    { name: 'Arthur Masuaku', position: 'DEF', specificPosition: 'LB', rating: 75, team: 'Democratic Republic of the Congo' },
    { name: 'Gedeon Kalulu', position: 'DEF', specificPosition: 'RB', rating: 73, team: 'Democratic Republic of the Congo' },
    { name: 'Charles Pickel', position: 'MID', specificPosition: 'CDM', rating: 73, team: 'Democratic Republic of the Congo' },
    { name: 'Samuel Moutoussamy', position: 'MID', specificPosition: 'LCM', rating: 73, team: 'Democratic Republic of the Congo' },
    { name: 'Theo Bongonda', position: 'MID', specificPosition: 'RCM', rating: 74, team: 'Democratic Republic of the Congo' },
    { name: 'Yoane Wissa', position: 'FWD', specificPosition: 'LW', rating: 77, team: 'Democratic Republic of the Congo' },
    { name: 'Cedric Bakambu', position: 'FWD', specificPosition: 'ST', rating: 76, team: 'Democratic Republic of the Congo' },
    { name: 'Meschack Elia', position: 'FWD', specificPosition: 'RW', rating: 73, team: 'Democratic Republic of the Congo' }
  ],
  Uzbekistan: [
    { name: 'Utkir Yusupov', position: 'GK', specificPosition: 'GK', rating: 70, team: 'Uzbekistan' },
    { name: 'Abdukodir Khusanov', position: 'DEF', specificPosition: 'CB', rating: 73, team: 'Uzbekistan' },
    { name: 'Rustam Ashurmatov', position: 'DEF', specificPosition: 'CB', rating: 69, team: 'Uzbekistan' },
    { name: 'Sherzod Nasrullaev', position: 'DEF', specificPosition: 'LB', rating: 68, team: 'Uzbekistan' },
    { name: 'Farrukh Sayfiev', position: 'DEF', specificPosition: 'RB', rating: 68, team: 'Uzbekistan' },
    { name: 'Odiljon Hamrobekov', position: 'MID', specificPosition: 'CDM', rating: 70, team: 'Uzbekistan' },
    { name: 'Otabek Shukurov', position: 'MID', specificPosition: 'LCM', rating: 73, team: 'Uzbekistan' },
    { name: 'Abbosbek Fayzullaev', position: 'MID', specificPosition: 'RCM', rating: 74, team: 'Uzbekistan' },
    { name: 'Jaloliddin Masharipov', position: 'FWD', specificPosition: 'LW', rating: 72, team: 'Uzbekistan' },
    { name: 'Eldor Shomurodov', position: 'FWD', specificPosition: 'ST', rating: 76, team: 'Uzbekistan' },
    { name: 'Igor Sergeev', position: 'FWD', specificPosition: 'RW', rating: 69, team: 'Uzbekistan' }
  ],
  Colombia: [
    { name: 'Camilo Vargas', position: 'GK', specificPosition: 'GK', rating: 78, team: 'Colombia' },
    { name: 'Davinson Sanchez', position: 'DEF', specificPosition: 'CB', rating: 78, team: 'Colombia' },
    { name: 'Jhon Lucumi', position: 'DEF', specificPosition: 'CB', rating: 78, team: 'Colombia' },
    { name: 'Johan Mojica', position: 'DEF', specificPosition: 'LB', rating: 76, team: 'Colombia' },
    { name: 'Daniel Munoz', position: 'DEF', specificPosition: 'RB', rating: 79, team: 'Colombia' },
    { name: 'Jefferson Lerma', position: 'MID', specificPosition: 'CDM', rating: 79, team: 'Colombia' },
    { name: 'James Rodriguez', position: 'MID', specificPosition: 'LCM', rating: 80, team: 'Colombia' },
    { name: 'Jhon Arias', position: 'MID', specificPosition: 'RCM', rating: 78, team: 'Colombia' },
    { name: 'Luis Diaz', position: 'FWD', specificPosition: 'LW', rating: 84, team: 'Colombia' },
    { name: 'Jhon Duran', position: 'FWD', specificPosition: 'ST', rating: 78, team: 'Colombia' },
    { name: 'Luis Sinisterra', position: 'FWD', specificPosition: 'RW', rating: 78, team: 'Colombia' }
  ],
  England: [
    { name: 'J. Pickford', position: 'GK', specificPosition: 'GK', rating: 83, team: 'England' },
    { name: 'John Stones', position: 'DEF', specificPosition: 'CB', rating: 85, team: 'England' },
    { name: 'Marc Guehi', position: 'DEF', specificPosition: 'CB', rating: 81, team: 'England' },
    { name: 'Luke Shaw', position: 'DEF', specificPosition: 'LB', rating: 81, team: 'England' },
    { name: 'Kyle Walker', position: 'DEF', specificPosition: 'RB', rating: 84, team: 'England' },
    { name: 'Declan Rice', position: 'MID', specificPosition: 'CDM', rating: 87, team: 'England' },
    { name: 'Kobbie Mainoo', position: 'MID', specificPosition: 'LCM', rating: 79, team: 'England' },
    { name: 'Jude Bellingham', position: 'MID', specificPosition: 'RCM', rating: 90, team: 'England' },
    { name: 'Phil Foden', position: 'FWD', specificPosition: 'LW', rating: 88, team: 'England' },
    { name: 'Harry Kane', position: 'FWD', specificPosition: 'ST', rating: 90, team: 'England' },
    { name: 'Bukayo Saka', position: 'FWD', specificPosition: 'RW', rating: 87, team: 'England' }
  ],
  Croatia: [
    { name: 'Dominik Livakovic', position: 'GK', specificPosition: 'GK', rating: 81, team: 'Croatia' },
    { name: 'Josip Sutalo', position: 'DEF', specificPosition: 'CB', rating: 79, team: 'Croatia' },
    { name: 'Domagoj Vida', position: 'DEF', specificPosition: 'CB', rating: 75, team: 'Croatia' },
    { name: 'Josko Gvardiol', position: 'DEF', specificPosition: 'LB', rating: 83, team: 'Croatia' },
    { name: 'Josip Stanisic', position: 'DEF', specificPosition: 'RB', rating: 78, team: 'Croatia' },
    { name: 'Marcelo Brozovic', position: 'MID', specificPosition: 'CDM', rating: 80, team: 'Croatia' },
    { name: 'Mateo Kovacic', position: 'MID', specificPosition: 'LCM', rating: 82, team: 'Croatia' },
    { name: 'Luka Modric', position: 'MID', specificPosition: 'RCM', rating: 86, team: 'Croatia' },
    { name: 'Ivan Perisic', position: 'FWD', specificPosition: 'LW', rating: 77, team: 'Croatia' },
    { name: 'Andrej Kramaric', position: 'FWD', specificPosition: 'ST', rating: 80, team: 'Croatia' },
    { name: 'Mario Pasalic', position: 'FWD', specificPosition: 'RW', rating: 79, team: 'Croatia' }
  ],
  Ghana: [
    { name: 'Lawrence Ati-Zigi', position: 'GK', specificPosition: 'GK', rating: 73, team: 'Ghana' },
    { name: 'Mohammed Salisu', position: 'DEF', specificPosition: 'CB', rating: 77, team: 'Ghana' },
    { name: 'Alexander Djiku', position: 'DEF', specificPosition: 'CB', rating: 76, team: 'Ghana' },
    { name: 'Gideon Mensah', position: 'DEF', specificPosition: 'LB', rating: 73, team: 'Ghana' },
    { name: 'Alidu Seidu', position: 'DEF', specificPosition: 'RB', rating: 75, team: 'Ghana' },
    { name: 'Salis Abdul Samed', position: 'MID', specificPosition: 'CDM', rating: 75, team: 'Ghana' },
    { name: 'Mohammed Kudus', position: 'MID', specificPosition: 'LCM', rating: 83, team: 'Ghana' },
    { name: 'Thomas Partey', position: 'MID', specificPosition: 'RCM', rating: 81, team: 'Ghana' },
    { name: 'Jordan Ayew', position: 'FWD', specificPosition: 'LW', rating: 76, team: 'Ghana' },
    { name: 'Inaki Williams', position: 'FWD', specificPosition: 'ST', rating: 81, team: 'Ghana' },
    { name: 'Ernest Nuamah', position: 'FWD', specificPosition: 'RW', rating: 74, team: 'Ghana' }
  ],
  Panama: [
    { name: 'Orlando Mosquera', position: 'GK', specificPosition: 'GK', rating: 71, team: 'Panama' },
    { name: 'Jose Cordoba', position: 'DEF', specificPosition: 'CB', rating: 74, team: 'Panama' },
    { name: 'Andres Andrade', position: 'DEF', specificPosition: 'CB', rating: 72, team: 'Panama' },
    { name: 'Eric Davis', position: 'DEF', specificPosition: 'LB', rating: 70, team: 'Panama' },
    { name: 'Michael Murillo', position: 'DEF', specificPosition: 'RB', rating: 75, team: 'Panama' },
    { name: 'Cristian Martinez', position: 'MID', specificPosition: 'CDM', rating: 70, team: 'Panama' },
    { name: 'Adalberto Carrasquilla', position: 'MID', specificPosition: 'LCM', rating: 75, team: 'Panama' },
    { name: 'Anibal Godoy', position: 'MID', specificPosition: 'RCM', rating: 71, team: 'Panama' },
    { name: 'Yoel Barcenas', position: 'FWD', specificPosition: 'LW', rating: 72, team: 'Panama' },
    { name: 'Jose Fajardo', position: 'FWD', specificPosition: 'ST', rating: 71, team: 'Panama' },
    { name: 'Ismael Diaz', position: 'FWD', specificPosition: 'RW', rating: 72, team: 'Panama' }
  ],
  Italy: [
    { name: 'G. Donnarumma', position: 'GK', specificPosition: 'GK', rating: 87, team: 'Italy' },
    { name: 'A. Bastoni', position: 'DEF', specificPosition: 'CB', rating: 86, team: 'Italy' },
    { name: 'F. Acerbi', position: 'DEF', specificPosition: 'CB', rating: 82, team: 'Italy' },
    { name: 'F. Dimarco', position: 'DEF', specificPosition: 'LB', rating: 84, team: 'Italy' },
    { name: 'G. Di Lorenzo', position: 'DEF', specificPosition: 'RB', rating: 81, team: 'Italy' },
    { name: 'Jorginho', position: 'MID', specificPosition: 'CDM', rating: 81, team: 'Italy' },
    { name: 'N. Barella', position: 'MID', specificPosition: 'LCM', rating: 87, team: 'Italy' },
    { name: 'L. Pellegrini', position: 'MID', specificPosition: 'RCM', rating: 82, team: 'Italy' },
    { name: 'F. Chiesa', position: 'FWD', specificPosition: 'LW', rating: 83, team: 'Italy' },
    { name: 'G. Scamacca', position: 'FWD', specificPosition: 'ST', rating: 81, team: 'Italy' },
    { name: 'Matteo Darmian', position: 'DEF', specificPosition: 'RB', rating: 80, team: 'Italy' }
  ]
};

export function getRosterForTeam(teamName: string, flag: string): Player[] {
  const normalized = teamName.trim().toLowerCase();

  // Find exact or substring matching key in TEAM_ROSTERS
  const key = Object.keys(TEAM_ROSTERS).find(k => {
    const kNorm = k.toLowerCase();
    return normalized.includes(kNorm) || kNorm.includes(normalized);
  });

  if (key && TEAM_ROSTERS[key]) {
    return TEAM_ROSTERS[key].map(p => ({ ...p, flag, team: teamName }));
  }

  // Fallback realistic generator if a team name is completely unrecognized
  const positions: ('GK' | 'DEF' | 'MID' | 'FWD')[] = [
    'GK',
    'DEF', 'DEF', 'DEF', 'DEF',
    'MID', 'MID', 'MID',
    'FWD', 'FWD', 'FWD'
  ];
  const specificPositions: ('GK' | 'LB' | 'CB' | 'RB' | 'LCM' | 'CDM' | 'RCM' | 'LW' | 'ST' | 'RW')[] = [
    'GK', 'LB', 'CB', 'CB', 'RB', 'LCM', 'CDM', 'RCM', 'LW', 'ST', 'RW'
  ];

  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const squadNames = [
    "Silva", "Santos", "Fernandez", "Rodriguez", "Smith", "Jones", "Muller", "Schmidt",
    "Dupont", "Martin", "Rossi", "Bianchi", "Kovacic", "Horvat", "Jansen", "de Jong",
    "Al-Dawsari", "Al-Shahrani", "Suzuki", "Tanaka", "Ochoa", "Hernandez", "Larsson", "Nilsson"
  ];

  const roster: Player[] = [];
  for (let i = 0; i < 11; i++) {
    const pos = positions[i];
    const specPos = specificPositions[i];
    const rating = 75 + Math.abs((hash + i * 7) % 15);
    const lastName = squadNames[Math.abs((hash + i * 3) % squadNames.length)];
    const firstName = String.fromCharCode(65 + Math.abs((hash + i * 13) % 26)) + ".";
    roster.push({
      name: `${firstName} ${lastName}`,
      position: pos,
      specificPosition: specPos,
      rating,
      team: teamName,
      flag
    });
  }
  return roster;
}

export function isPlayerAllowedForSlot(player: Player, slotId: string): boolean {
  if (slotId === 'LCB' || slotId === 'RCB') {
    return player.specificPosition === 'CB';
  }
  return player.specificPosition === slotId;
}
