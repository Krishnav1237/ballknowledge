export interface Player {
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  rating: number;
  team: string;
  flag: string;
}

export const TEAM_ROSTERS: Record<string, { name: string; position: 'GK' | 'DEF' | 'MID' | 'FWD'; rating: number; team: string }[]> = {
  Argentina: [
    { name: 'E. Martinez', position: 'GK', rating: 87, team: 'Argentina' },
    { name: 'C. Romero', position: 'DEF', rating: 86, team: 'Argentina' },
    { name: 'L. Martinez', position: 'DEF', rating: 84, team: 'Argentina' },
    { name: 'N. Molina', position: 'DEF', rating: 82, team: 'Argentina' },
    { name: 'N. Tagliafico', position: 'DEF', rating: 81, team: 'Argentina' },
    { name: 'A. Mac Allister', position: 'MID', rating: 86, team: 'Argentina' },
    { name: 'E. Fernandez', position: 'MID', rating: 84, team: 'Argentina' },
    { name: 'R. De Paul', position: 'MID', rating: 84, team: 'Argentina' },
    { name: 'L. Messi', position: 'FWD', rating: 92, team: 'Argentina' },
    { name: 'J. Alvarez', position: 'FWD', rating: 84, team: 'Argentina' },
    { name: 'Lautaro Martinez', position: 'FWD', rating: 87, team: 'Argentina' }
  ],
  France: [
    { name: 'M. Maignan', position: 'GK', rating: 86, team: 'France' },
    { name: 'W. Saliba', position: 'DEF', rating: 87, team: 'France' },
    { name: 'I. Konate', position: 'DEF', rating: 83, team: 'France' },
    { name: 'J. Kounde', position: 'DEF', rating: 84, team: 'France' },
    { name: 'T. Hernandez', position: 'DEF', rating: 85, team: 'France' },
    { name: 'E. Camavinga', position: 'MID', rating: 84, team: 'France' },
    { name: 'A. Tchouameni', position: 'MID', rating: 84, team: 'France' },
    { name: 'A. Rabiot', position: 'MID', rating: 82, team: 'France' },
    { name: 'K. Mbappe', position: 'FWD', rating: 91, team: 'France' },
    { name: 'A. Griezmann', position: 'FWD', rating: 87, team: 'France' },
    { name: 'O. Dembele', position: 'FWD', rating: 86, team: 'France' }
  ],
  Brazil: [
    { name: 'Alisson Becker', position: 'GK', rating: 89, team: 'Brazil' },
    { name: 'Marquinhos', position: 'DEF', rating: 86, team: 'Brazil' },
    { name: 'Gabriel Magalhaes', position: 'DEF', rating: 84, team: 'Brazil' },
    { name: 'Eder Militao', position: 'DEF', rating: 85, team: 'Brazil' },
    { name: 'Danilo', position: 'DEF', rating: 80, team: 'Brazil' },
    { name: 'B. Guimaraes', position: 'MID', rating: 85, team: 'Brazil' },
    { name: 'L. Paqueta', position: 'MID', rating: 82, team: 'Brazil' },
    { name: 'Casemiro', position: 'MID', rating: 83, team: 'Brazil' },
    { name: 'Vinicius Jr.', position: 'FWD', rating: 90, team: 'Brazil' },
    { name: 'Rodrygo', position: 'FWD', rating: 86, team: 'Brazil' },
    { name: 'Endrick', position: 'FWD', rating: 79, team: 'Brazil' }
  ],
  Portugal: [
    { name: 'Diogo Costa', position: 'GK', rating: 84, team: 'Portugal' },
    { name: 'Ruben Dias', position: 'DEF', rating: 89, team: 'Portugal' },
    { name: 'Joao Cancelo', position: 'DEF', rating: 85, team: 'Portugal' },
    { name: 'Diogo Dalot', position: 'DEF', rating: 82, team: 'Portugal' },
    { name: 'Nuno Mendes', position: 'DEF', rating: 83, team: 'Portugal' },
    { name: 'Vitinha', position: 'MID', rating: 85, team: 'Portugal' },
    { name: 'Palhinha', position: 'MID', rating: 84, team: 'Portugal' },
    { name: 'Bernardo Silva', position: 'MID', rating: 88, team: 'Portugal' },
    { name: 'Cristiano Ronaldo', position: 'FWD', rating: 86, team: 'Portugal' },
    { name: 'Rafael Leao', position: 'FWD', rating: 87, team: 'Portugal' },
    { name: 'Bruno Fernandes', position: 'MID', rating: 87, team: 'Portugal' }
  ],
  England: [
    { name: 'J. Pickford', position: 'GK', rating: 83, team: 'England' },
    { name: 'John Stones', position: 'DEF', rating: 85, team: 'England' },
    { name: 'Kyle Walker', position: 'DEF', rating: 84, team: 'England' },
    { name: 'K. Trippier', position: 'DEF', rating: 82, team: 'England' },
    { name: 'Luke Shaw', position: 'DEF', rating: 81, team: 'England' },
    { name: 'Declan Rice', position: 'MID', rating: 87, team: 'England' },
    { name: 'J. Bellingham', position: 'MID', rating: 90, team: 'England' },
    { name: 'Cole Palmer', position: 'MID', rating: 85, team: 'England' },
    { name: 'Harry Kane', position: 'FWD', rating: 90, team: 'England' },
    { name: 'Bukayo Saka', position: 'FWD', rating: 87, team: 'England' },
    { name: 'Phil Foden', position: 'FWD', rating: 88, team: 'England' }
  ],
  Germany: [
    { name: 'Manuel Neuer', position: 'GK', rating: 85, team: 'Germany' },
    { name: 'A. Rudiger', position: 'DEF', rating: 87, team: 'Germany' },
    { name: 'Jonathan Tah', position: 'DEF', rating: 84, team: 'Germany' },
    { name: 'N. Schlotterbeck', position: 'DEF', rating: 82, team: 'Germany' },
    { name: 'David Raum', position: 'DEF', rating: 80, team: 'Germany' },
    { name: 'Toni Kroos', position: 'MID', rating: 86, team: 'Germany' },
    { name: 'I. Gundogan', position: 'MID', rating: 85, team: 'Germany' },
    { name: 'Joshua Kimmich', position: 'MID', rating: 85, team: 'Germany' },
    { name: 'Jamal Musiala', position: 'FWD', rating: 87, team: 'Germany' },
    { name: 'Florian Wirtz', position: 'FWD', rating: 87, team: 'Germany' },
    { name: 'Kai Havertz', position: 'FWD', rating: 84, team: 'Germany' }
  ],
  Spain: [
    { name: 'Unai Simon', position: 'GK', rating: 84, team: 'Spain' },
    { name: 'Dani Carvajal', position: 'DEF', rating: 85, team: 'Spain' },
    { name: 'Aymeric Laporte', position: 'DEF', rating: 83, team: 'Spain' },
    { name: 'R. Le Normand', position: 'DEF', rating: 81, team: 'Spain' },
    { name: 'Marc Cucurella', position: 'DEF', rating: 80, team: 'Spain' },
    { name: 'Rodri', position: 'MID', rating: 91, team: 'Spain' },
    { name: 'Pedri', position: 'MID', rating: 86, team: 'Spain' },
    { name: 'Gavi', position: 'MID', rating: 84, team: 'Spain' },
    { name: 'Lamine Yamal', position: 'FWD', rating: 85, team: 'Spain' },
    { name: 'Nico Williams', position: 'FWD', rating: 84, team: 'Spain' },
    { name: 'Dani Olmo', position: 'MID', rating: 84, team: 'Spain' }
  ],
  Italy: [
    { name: 'G. Donnarumma', position: 'GK', rating: 87, team: 'Italy' },
    { name: 'A. Bastoni', position: 'DEF', rating: 86, team: 'Italy' },
    { name: 'F. Acerbi', position: 'DEF', rating: 82, team: 'Italy' },
    { name: 'F. Dimarco', position: 'DEF', rating: 84, team: 'Italy' },
    { name: 'G. Di Lorenzo', position: 'DEF', rating: 81, team: 'Italy' },
    { name: 'N. Barella', position: 'MID', rating: 87, team: 'Italy' },
    { name: 'Jorginho', position: 'MID', rating: 81, team: 'Italy' },
    { name: 'L. Pellegrini', position: 'MID', rating: 82, team: 'Italy' },
    { name: 'F. Chiesa', position: 'FWD', rating: 83, team: 'Italy' },
    { name: 'G. Scamacca', position: 'FWD', rating: 81, team: 'Italy' },
    { name: 'Matteo Darmian', position: 'DEF', rating: 80, team: 'Italy' }
  ]
};

export function getRosterForTeam(teamName: string, flag: string): Player[] {
  const normalized = teamName.trim().toLowerCase();
  let key = '';
  if (normalized.includes('arg')) key = 'Argentina';
  else if (normalized.includes('fra')) key = 'France';
  else if (normalized.includes('bra')) key = 'Brazil';
  else if (normalized.includes('por')) key = 'Portugal';
  else if (normalized.includes('eng') || normalized.includes('great britain')) key = 'England';
  else if (normalized.includes('ger')) key = 'Germany';
  else if (normalized.includes('spa') || normalized.includes('esp')) key = 'Spain';
  else if (normalized.includes('ita')) key = 'Italy';

  if (key && TEAM_ROSTERS[key]) {
    return TEAM_ROSTERS[key].map(p => ({ ...p, flag }));
  }

  // Generate deterministic squad of 11 players for this country
  const positions: ('GK' | 'DEF' | 'MID' | 'FWD')[] = [
    'GK',
    'DEF', 'DEF', 'DEF', 'DEF',
    'MID', 'MID', 'MID',
    'FWD', 'FWD', 'FWD'
  ];
  const positionNames = [
    'GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'CDM', 'RCM', 'LW', 'ST', 'RW'
  ];

  // Some common last names by teamName hash
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
    const rating = 78 + Math.abs((hash + i * 7) % 12);
    const lastName = squadNames[Math.abs((hash + i * 3) % squadNames.length)];
    const firstName = String.fromCharCode(65 + Math.abs((hash + i * 13) % 26)) + ".";
    roster.push({
      name: `${firstName} ${lastName}`,
      position: pos,
      rating,
      team: teamName,
      flag
    });
  }
  return roster;
}
