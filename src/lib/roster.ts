export interface Player {
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  specificPosition: 'GK' | 'LB' | 'CB' | 'RB' | 'LCM' | 'CDM' | 'RCM' | 'LW' | 'ST' | 'RW';
  rating: number;
  team: string;
  flag: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

export const PLAYER_SILHOUETTE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%231F2937"/><circle cx="50" cy="38" r="16" fill="%239CA3AF"/><path d="M46 52h8v10h-8z" fill="%239CA3AF"/><path d="M25 76c0-12 10-16 25-16s25 4 25 16v8H25v-8z" fill="%239CA3AF"/></svg>`;

const PLAYER_IDS: Record<string, number> = {
  'Bukayo Saka': 1459,
  'Cole Palmer': 152982,
  'Declan Rice': 2933,
  'Phil Foden': 645,
  'Erling Haaland': 1102,
  'Martin Ødegaard': 303,
  'Mohamed Salah': 306,
  'Virgil van Dijk': 290,
  'Bruno Fernandes': 635,
  'Bernardo Silva': 633,
  'Alisson Becker': 280,
  'Casemiro': 282,
  'Rodri': 35882,
  'Luis Díaz': 1478,
  'Jeremy Doku': 16055,
  'Leandro Trossard': 207421,
};

const VERIFIED_PLAYERS = new Set(Object.keys(PLAYER_IDS));

export function getPlayerImageUrl(playerName: string): string {
  if (VERIFIED_PLAYERS.has(playerName)) {
    const id = PLAYER_IDS[playerName];
    if (id) {
      return `https://media.api-sports.io/football/players/${id}.png`;
    }
  }
  return PLAYER_SILHOUETTE;
}

export const TEAM_ROSTERS: Record<string, { name: string; position: 'GK' | 'DEF' | 'MID' | 'FWD'; specificPosition: 'GK' | 'LB' | 'CB' | 'RB' | 'LCM' | 'CDM' | 'RCM' | 'LW' | 'ST' | 'RW'; rating: number; team: string; flag: string }[]> = {
  "Arsenal": [
    { name: "David Raya", position: "GK", specificPosition: "GK", rating: 86, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "William Saliba", position: "DEF", specificPosition: "CB", rating: 88, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Gabriel Magalhães", position: "DEF", specificPosition: "CB", rating: 86, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Riccardo Calafiori", position: "DEF", specificPosition: "LB", rating: 83, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Jurriën Timber", position: "DEF", specificPosition: "RB", rating: 84, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Ben White", position: "DEF", specificPosition: "RB", rating: 83, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Declan Rice", position: "MID", specificPosition: "CDM", rating: 89, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Martín Zubimendi", position: "MID", specificPosition: "CDM", rating: 86, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Martin Ødegaard", position: "MID", specificPosition: "RCM", rating: 88, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Bukayo Saka", position: "FWD", specificPosition: "RW", rating: 90, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Kai Havertz", position: "FWD", specificPosition: "ST", rating: 85, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Gabriel Martinelli", position: "FWD", specificPosition: "LW", rating: 85, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Leandro Trossard", position: "FWD", specificPosition: "LW", rating: 83, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Mikel Merino", position: "MID", specificPosition: "LCM", rating: 84, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Gabriel Jesus", position: "FWD", specificPosition: "ST", rating: 82, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Myles Lewis-Skelly", position: "DEF", specificPosition: "LB", rating: 78, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Ethan Nwaneri", position: "MID", specificPosition: "RCM", rating: 77, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
    { name: "Kepa Arrizabalaga", position: "GK", specificPosition: "GK", rating: 78, team: "Arsenal", flag: "https://crests.football-data.org/57.png" },
  ],
  "Aston Villa": [
    { name: "Emiliano Martínez", position: "GK", specificPosition: "GK", rating: 87, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Pau Torres", position: "DEF", specificPosition: "CB", rating: 84, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Ezri Konsa", position: "DEF", specificPosition: "CB", rating: 83, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Lucas Digne", position: "DEF", specificPosition: "LB", rating: 80, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Matty Cash", position: "DEF", specificPosition: "RB", rating: 80, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Amadou Onana", position: "MID", specificPosition: "CDM", rating: 83, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Youri Tielemans", position: "MID", specificPosition: "LCM", rating: 83, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "John McGinn", position: "MID", specificPosition: "RCM", rating: 82, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Morgan Rogers", position: "FWD", specificPosition: "LW", rating: 85, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Ollie Watkins", position: "FWD", specificPosition: "ST", rating: 86, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Leon Bailey", position: "FWD", specificPosition: "RW", rating: 81, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Jacob Ramsey", position: "MID", specificPosition: "LCM", rating: 80, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Ian Maatsen", position: "DEF", specificPosition: "LB", rating: 79, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Emiliano Buendía", position: "MID", specificPosition: "RCM", rating: 78, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Jhon Durán", position: "FWD", specificPosition: "ST", rating: 80, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
    { name: "Robin Olsen", position: "GK", specificPosition: "GK", rating: 76, team: "Aston Villa", flag: "https://crests.football-data.org/58.png" },
  ],
  "AFC Bournemouth": [
    { name: "Kepa", position: "GK", specificPosition: "GK", rating: 78, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Illia Zabarnyi", position: "DEF", specificPosition: "CB", rating: 82, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Marcos Senesi", position: "DEF", specificPosition: "CB", rating: 80, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Milos Kerkez", position: "DEF", specificPosition: "LB", rating: 81, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Adam Smith", position: "DEF", specificPosition: "RB", rating: 76, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Tyler Adams", position: "MID", specificPosition: "CDM", rating: 80, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Alex Scott", position: "MID", specificPosition: "LCM", rating: 78, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Ryan Christie", position: "MID", specificPosition: "RCM", rating: 77, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Antoine Semenyo", position: "FWD", specificPosition: "RW", rating: 82, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Evanilson", position: "FWD", specificPosition: "ST", rating: 80, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Justin Kluivert", position: "FWD", specificPosition: "LW", rating: 80, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Marcus Tavernier", position: "MID", specificPosition: "RCM", rating: 78, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Lewis Cook", position: "MID", specificPosition: "CDM", rating: 77, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Dango Ouattara", position: "FWD", specificPosition: "LW", rating: 77, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Enes Ünal", position: "FWD", specificPosition: "ST", rating: 76, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
    { name: "Đorđe Petrović", position: "GK", specificPosition: "GK", rating: 77, team: "AFC Bournemouth", flag: "https://crests.football-data.org/1044.png" },
  ],
  "Brentford": [
    { name: "Mark Flekken", position: "GK", specificPosition: "GK", rating: 80, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Nathan Collins", position: "DEF", specificPosition: "CB", rating: 80, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Ethan Pinnock", position: "DEF", specificPosition: "CB", rating: 78, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Rico Henry", position: "DEF", specificPosition: "LB", rating: 78, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Kristoffer Ajer", position: "DEF", specificPosition: "RB", rating: 77, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Christian Nørgaard", position: "MID", specificPosition: "CDM", rating: 80, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Vitaly Janelt", position: "MID", specificPosition: "LCM", rating: 78, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Mathias Jensen", position: "MID", specificPosition: "RCM", rating: 79, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Bryan Mbeumo", position: "FWD", specificPosition: "RW", rating: 85, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Yoane Wissa", position: "FWD", specificPosition: "ST", rating: 82, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Kevin Schade", position: "FWD", specificPosition: "LW", rating: 79, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Mikkel Damsgaard", position: "MID", specificPosition: "LCM", rating: 78, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Keane Lewis-Potter", position: "FWD", specificPosition: "LW", rating: 76, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Igor Thiago", position: "FWD", specificPosition: "ST", rating: 78, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Sepp van den Berg", position: "DEF", specificPosition: "CB", rating: 77, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
    { name: "Hákon Valdimarsson", position: "GK", specificPosition: "GK", rating: 74, team: "Brentford", flag: "https://crests.football-data.org/402.png" },
  ],
  "Brighton & Hove Albion": [
    { name: "Bart Verbruggen", position: "GK", specificPosition: "GK", rating: 80, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Lewis Dunk", position: "DEF", specificPosition: "CB", rating: 81, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Jan Paul van Hecke", position: "DEF", specificPosition: "CB", rating: 80, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Pervis Estupiñán", position: "DEF", specificPosition: "LB", rating: 81, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Tariq Lamptey", position: "DEF", specificPosition: "RB", rating: 77, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Carlos Baleba", position: "MID", specificPosition: "CDM", rating: 82, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Mats Wieffer", position: "MID", specificPosition: "LCM", rating: 78, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Yankuba Minteh", position: "FWD", specificPosition: "RW", rating: 80, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Kaoru Mitoma", position: "FWD", specificPosition: "LW", rating: 84, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Danny Welbeck", position: "FWD", specificPosition: "ST", rating: 79, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Georginio Rutter", position: "FWD", specificPosition: "ST", rating: 78, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "João Pedro", position: "FWD", specificPosition: "ST", rating: 82, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "James Milner", position: "MID", specificPosition: "RCM", rating: 75, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Ferdi Kadıoğlu", position: "DEF", specificPosition: "LB", rating: 80, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Jason Steele", position: "GK", specificPosition: "GK", rating: 75, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
    { name: "Yasin Ayari", position: "MID", specificPosition: "RCM", rating: 76, team: "Brighton & Hove Albion", flag: "https://crests.football-data.org/397.png" },
  ],
  "Chelsea": [
    { name: "Robert Sánchez", position: "GK", specificPosition: "GK", rating: 80, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Levi Colwill", position: "DEF", specificPosition: "CB", rating: 83, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Wesley Fofana", position: "DEF", specificPosition: "CB", rating: 81, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Marc Cucurella", position: "DEF", specificPosition: "LB", rating: 81, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Reece James", position: "DEF", specificPosition: "RB", rating: 85, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Moisés Caicedo", position: "MID", specificPosition: "CDM", rating: 87, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Enzo Fernández", position: "MID", specificPosition: "LCM", rating: 85, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Cole Palmer", position: "MID", specificPosition: "RCM", rating: 89, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Pedro Neto", position: "FWD", specificPosition: "RW", rating: 83, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Nicolas Jackson", position: "FWD", specificPosition: "ST", rating: 81, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Jadon Sancho", position: "FWD", specificPosition: "LW", rating: 80, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Noni Madueke", position: "FWD", specificPosition: "RW", rating: 80, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Malo Gusto", position: "DEF", specificPosition: "RB", rating: 80, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Romeo Lavia", position: "MID", specificPosition: "CDM", rating: 80, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Christopher Nkunku", position: "FWD", specificPosition: "ST", rating: 82, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
    { name: "Filip Jörgensen", position: "GK", specificPosition: "GK", rating: 77, team: "Chelsea", flag: "https://crests.football-data.org/61.png" },
  ],
  "Coventry City": [
    { name: "Oliver Dovin", position: "GK", specificPosition: "GK", rating: 74, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Bobby Thomas", position: "DEF", specificPosition: "CB", rating: 73, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Liam Kitching", position: "DEF", specificPosition: "CB", rating: 72, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Jake Bidwell", position: "DEF", specificPosition: "LB", rating: 71, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Milan van Ewijk", position: "DEF", specificPosition: "RB", rating: 75, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Matt Grimes", position: "MID", specificPosition: "CDM", rating: 76, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Ben Sheaf", position: "MID", specificPosition: "LCM", rating: 74, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Jack Rudoni", position: "MID", specificPosition: "RCM", rating: 75, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Haji Wright", position: "FWD", specificPosition: "ST", rating: 76, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Ellis Simms", position: "FWD", specificPosition: "ST", rating: 73, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Tatsuhiro Sakamoto", position: "FWD", specificPosition: "RW", rating: 74, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Ephron Mason-Clark", position: "FWD", specificPosition: "LW", rating: 73, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Josh Eccles", position: "MID", specificPosition: "RCM", rating: 72, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Jay Dasilva", position: "DEF", specificPosition: "LB", rating: 71, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Brandon Thomas-Asante", position: "FWD", specificPosition: "ST", rating: 72, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
    { name: "Bradley Collins", position: "GK", specificPosition: "GK", rating: 70, team: "Coventry City", flag: "https://crests.football-data.org/1076.png" },
  ],
  "Crystal Palace": [
    { name: "Dean Henderson", position: "GK", specificPosition: "GK", rating: 82, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Marc Guéhi", position: "DEF", specificPosition: "CB", rating: 83, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Maxence Lacroix", position: "DEF", specificPosition: "CB", rating: 80, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Tyrick Mitchell", position: "DEF", specificPosition: "LB", rating: 79, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Daniel Muñoz", position: "DEF", specificPosition: "RB", rating: 81, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Adam Wharton", position: "MID", specificPosition: "CDM", rating: 83, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Jefferson Lerma", position: "MID", specificPosition: "LCM", rating: 78, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Eberechi Eze", position: "FWD", specificPosition: "LW", rating: 86, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Ismaïla Sarr", position: "FWD", specificPosition: "RW", rating: 82, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Jean-Philippe Mateta", position: "FWD", specificPosition: "ST", rating: 81, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Eddie Nketiah", position: "FWD", specificPosition: "ST", rating: 77, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Will Hughes", position: "MID", specificPosition: "LCM", rating: 76, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Chris Richards", position: "DEF", specificPosition: "CB", rating: 77, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Daichi Kamada", position: "MID", specificPosition: "RCM", rating: 78, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Chadi Riad", position: "DEF", specificPosition: "LB", rating: 75, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
    { name: "Matt Turner", position: "GK", specificPosition: "GK", rating: 74, team: "Crystal Palace", flag: "https://crests.football-data.org/354.png" },
  ],
  "Everton": [
    { name: "Jordan Pickford", position: "GK", specificPosition: "GK", rating: 84, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "James Tarkowski", position: "DEF", specificPosition: "CB", rating: 80, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Jarrad Branthwaite", position: "DEF", specificPosition: "CB", rating: 82, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Vitaliy Mykolenko", position: "DEF", specificPosition: "LB", rating: 78, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Ashley Young", position: "DEF", specificPosition: "RB", rating: 74, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Idrissa Gueye", position: "MID", specificPosition: "CDM", rating: 78, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "James Garner", position: "MID", specificPosition: "LCM", rating: 77, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Iliman Ndiaye", position: "FWD", specificPosition: "RW", rating: 80, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Dwight McNeil", position: "FWD", specificPosition: "LW", rating: 78, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Beto", position: "FWD", specificPosition: "ST", rating: 76, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Dominic Calvert-Lewin", position: "FWD", specificPosition: "ST", rating: 77, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Abdoulaye Doucouré", position: "MID", specificPosition: "RCM", rating: 76, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Jake O'Brien", position: "DEF", specificPosition: "CB", rating: 76, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Jack Harrison", position: "FWD", specificPosition: "RW", rating: 75, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "Tim Iroegbunam", position: "MID", specificPosition: "CDM", rating: 74, team: "Everton", flag: "https://crests.football-data.org/62.png" },
    { name: "João Virgínia", position: "GK", specificPosition: "GK", rating: 72, team: "Everton", flag: "https://crests.football-data.org/62.png" },
  ],
  "Fulham": [
    { name: "Bernd Leno", position: "GK", specificPosition: "GK", rating: 82, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Joachim Andersen", position: "DEF", specificPosition: "CB", rating: 81, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Calvin Bassey", position: "DEF", specificPosition: "CB", rating: 79, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Antonee Robinson", position: "DEF", specificPosition: "LB", rating: 82, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Kenny Tete", position: "DEF", specificPosition: "RB", rating: 78, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Sander Berge", position: "MID", specificPosition: "CDM", rating: 80, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Andreas Pereira", position: "MID", specificPosition: "LCM", rating: 78, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Emile Smith Rowe", position: "MID", specificPosition: "RCM", rating: 80, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Alex Iwobi", position: "FWD", specificPosition: "LW", rating: 80, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Raúl Jiménez", position: "FWD", specificPosition: "ST", rating: 78, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Adama Traoré", position: "FWD", specificPosition: "RW", rating: 76, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Harry Wilson", position: "FWD", specificPosition: "RW", rating: 77, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Harrison Reed", position: "MID", specificPosition: "CDM", rating: 75, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Timothy Castagne", position: "DEF", specificPosition: "RB", rating: 76, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Rodrigo Muniz", position: "FWD", specificPosition: "ST", rating: 77, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
    { name: "Steven Benda", position: "GK", specificPosition: "GK", rating: 72, team: "Fulham", flag: "https://crests.football-data.org/63.png" },
  ],
  "Hull City": [
    { name: "Ivor Pandur", position: "GK", specificPosition: "GK", rating: 73, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Alfie Jones", position: "DEF", specificPosition: "CB", rating: 72, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Sean McLoughlin", position: "DEF", specificPosition: "CB", rating: 71, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Ryan Giles", position: "DEF", specificPosition: "LB", rating: 73, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Lewie Coyle", position: "DEF", specificPosition: "RB", rating: 72, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Regan Slater", position: "MID", specificPosition: "CDM", rating: 73, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Gustavo Puerta", position: "MID", specificPosition: "LCM", rating: 74, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Abdülkadir Ömür", position: "MID", specificPosition: "RCM", rating: 75, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Mohamed Belloumi", position: "FWD", specificPosition: "RW", rating: 74, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "João Pedro", position: "FWD", specificPosition: "ST", rating: 73, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Kyle Joseph", position: "FWD", specificPosition: "ST", rating: 72, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Liam Millar", position: "FWD", specificPosition: "LW", rating: 73, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Cody Drameh", position: "DEF", specificPosition: "RB", rating: 71, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Xavier Simons", position: "MID", specificPosition: "CDM", rating: 70, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Mason Burstow", position: "FWD", specificPosition: "ST", rating: 70, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
    { name: "Thimothée Lo-Tutala", position: "GK", specificPosition: "GK", rating: 69, team: "Hull City", flag: "https://crests.football-data.org/322.png" },
  ],
  "Ipswich Town": [
    { name: "Arijanet Muric", position: "GK", specificPosition: "GK", rating: 76, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Dara O'Shea", position: "DEF", specificPosition: "CB", rating: 77, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Jacob Greaves", position: "DEF", specificPosition: "CB", rating: 77, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Leif Davis", position: "DEF", specificPosition: "LB", rating: 78, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Axel Tuanzebe", position: "DEF", specificPosition: "RB", rating: 74, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Sam Morsy", position: "MID", specificPosition: "CDM", rating: 75, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Kalvin Phillips", position: "MID", specificPosition: "LCM", rating: 76, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Omari Hutchinson", position: "MID", specificPosition: "RCM", rating: 78, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Liam Delap", position: "FWD", specificPosition: "ST", rating: 79, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Sammie Szmodics", position: "FWD", specificPosition: "LW", rating: 76, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Wes Burns", position: "FWD", specificPosition: "RW", rating: 73, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Jack Clarke", position: "FWD", specificPosition: "LW", rating: 75, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Cameron Burgess", position: "DEF", specificPosition: "CB", rating: 73, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Jens Cajuste", position: "MID", specificPosition: "CDM", rating: 75, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "George Hirst", position: "FWD", specificPosition: "ST", rating: 72, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
    { name: "Christian Walton", position: "GK", specificPosition: "GK", rating: 71, team: "Ipswich Town", flag: "https://crests.football-data.org/349.png" },
  ],
  "Leeds United": [
    { name: "Illan Meslier", position: "GK", specificPosition: "GK", rating: 76, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Pascal Struijk", position: "DEF", specificPosition: "CB", rating: 77, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Joe Rodon", position: "DEF", specificPosition: "CB", rating: 76, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Junior Firpo", position: "DEF", specificPosition: "LB", rating: 74, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Jayden Bogle", position: "DEF", specificPosition: "RB", rating: 75, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Ao Tanaka", position: "MID", specificPosition: "CDM", rating: 78, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Ethan Ampadu", position: "MID", specificPosition: "LCM", rating: 79, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Brenden Aaronson", position: "MID", specificPosition: "RCM", rating: 76, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Wilfried Gnonto", position: "FWD", specificPosition: "RW", rating: 77, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Joel Piroe", position: "FWD", specificPosition: "ST", rating: 77, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Daniel James", position: "FWD", specificPosition: "LW", rating: 75, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Manor Solomon", position: "FWD", specificPosition: "LW", rating: 76, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Joe Rothwell", position: "MID", specificPosition: "RCM", rating: 73, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Ethan Horvath", position: "GK", specificPosition: "GK", rating: 72, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Patrick Bamford", position: "FWD", specificPosition: "ST", rating: 72, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
    { name: "Sam Byram", position: "DEF", specificPosition: "RB", rating: 71, team: "Leeds United", flag: "https://crests.football-data.org/341.png" },
  ],
  "Liverpool": [
    { name: "Alisson Becker", position: "GK", specificPosition: "GK", rating: 89, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Virgil van Dijk", position: "DEF", specificPosition: "CB", rating: 89, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Ibrahima Konaté", position: "DEF", specificPosition: "CB", rating: 85, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Andy Robertson", position: "DEF", specificPosition: "LB", rating: 83, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Trent Alexander-Arnold", position: "DEF", specificPosition: "RB", rating: 87, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Alexis Mac Allister", position: "MID", specificPosition: "CDM", rating: 86, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Ryan Gravenberch", position: "MID", specificPosition: "LCM", rating: 84, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Dominik Szoboszlai", position: "MID", specificPosition: "RCM", rating: 85, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Mohamed Salah", position: "FWD", specificPosition: "RW", rating: 90, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Luis Díaz", position: "FWD", specificPosition: "LW", rating: 86, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Darwin Núñez", position: "FWD", specificPosition: "ST", rating: 82, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Cody Gakpo", position: "FWD", specificPosition: "LW", rating: 83, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Curtis Jones", position: "MID", specificPosition: "LCM", rating: 80, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Wataru Endo", position: "MID", specificPosition: "CDM", rating: 78, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Diogo Jota", position: "FWD", specificPosition: "ST", rating: 83, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
    { name: "Caoimhín Kelleher", position: "GK", specificPosition: "GK", rating: 80, team: "Liverpool", flag: "https://crests.football-data.org/64.png" },
  ],
  "Manchester City": [
    { name: "Ederson", position: "GK", specificPosition: "GK", rating: 88, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Rúben Dias", position: "DEF", specificPosition: "CB", rating: 88, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Josko Gvardiol", position: "DEF", specificPosition: "CB", rating: 86, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Nico O'Reilly", position: "DEF", specificPosition: "LB", rating: 76, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Rico Lewis", position: "DEF", specificPosition: "RB", rating: 80, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Rodri", position: "MID", specificPosition: "CDM", rating: 91, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Tijjani Reijnders", position: "MID", specificPosition: "LCM", rating: 85, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Phil Foden", position: "MID", specificPosition: "RCM", rating: 89, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Savinho", position: "FWD", specificPosition: "RW", rating: 83, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Erling Haaland", position: "FWD", specificPosition: "ST", rating: 93, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Jeremy Doku", position: "FWD", specificPosition: "LW", rating: 84, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Bernardo Silva", position: "MID", specificPosition: "RCM", rating: 87, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Mateo Kovačić", position: "MID", specificPosition: "LCM", rating: 83, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Omar Marmoush", position: "FWD", specificPosition: "ST", rating: 84, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "John Stones", position: "DEF", specificPosition: "CB", rating: 84, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
    { name: "Stefan Ortega", position: "GK", specificPosition: "GK", rating: 80, team: "Manchester City", flag: "https://crests.football-data.org/65.png" },
  ],
  "Manchester United": [
    { name: "André Onana", position: "GK", specificPosition: "GK", rating: 82, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Lisandro Martínez", position: "DEF", specificPosition: "CB", rating: 84, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Matthijs de Ligt", position: "DEF", specificPosition: "CB", rating: 84, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Luke Shaw", position: "DEF", specificPosition: "LB", rating: 80, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Diogo Dalot", position: "DEF", specificPosition: "RB", rating: 80, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Casemiro", position: "MID", specificPosition: "CDM", rating: 83, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Kobbie Mainoo", position: "MID", specificPosition: "LCM", rating: 83, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Bruno Fernandes", position: "MID", specificPosition: "RCM", rating: 88, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Amad Diallo", position: "FWD", specificPosition: "RW", rating: 82, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Rasmus Højlund", position: "FWD", specificPosition: "ST", rating: 80, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Alejandro Garnacho", position: "FWD", specificPosition: "LW", rating: 81, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Mason Mount", position: "MID", specificPosition: "LCM", rating: 79, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Noussair Mazraoui", position: "DEF", specificPosition: "RB", rating: 80, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Joshua Zirkzee", position: "FWD", specificPosition: "ST", rating: 78, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Manuel Ugarte", position: "MID", specificPosition: "CDM", rating: 80, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
    { name: "Altay Bayındır", position: "GK", specificPosition: "GK", rating: 76, team: "Manchester United", flag: "https://crests.football-data.org/66.png" },
  ],
  "Newcastle United": [
    { name: "Nick Pope", position: "GK", specificPosition: "GK", rating: 83, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Sven Botman", position: "DEF", specificPosition: "CB", rating: 83, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Fabian Schär", position: "DEF", specificPosition: "CB", rating: 80, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Dan Burn", position: "DEF", specificPosition: "LB", rating: 78, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Tino Livramento", position: "DEF", specificPosition: "RB", rating: 81, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Bruno Guimarães", position: "MID", specificPosition: "CDM", rating: 86, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Sandro Tonali", position: "MID", specificPosition: "LCM", rating: 84, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Joelinton", position: "MID", specificPosition: "RCM", rating: 81, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Anthony Gordon", position: "FWD", specificPosition: "LW", rating: 83, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Alexander Isak", position: "FWD", specificPosition: "ST", rating: 88, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Jacob Murphy", position: "FWD", specificPosition: "RW", rating: 78, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Harvey Barnes", position: "FWD", specificPosition: "LW", rating: 79, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Lewis Hall", position: "DEF", specificPosition: "LB", rating: 78, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Joe Willock", position: "MID", specificPosition: "RCM", rating: 78, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Callum Wilson", position: "FWD", specificPosition: "ST", rating: 76, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
    { name: "Odysseas Vlachodimos", position: "GK", specificPosition: "GK", rating: 75, team: "Newcastle United", flag: "https://crests.football-data.org/67.png" },
  ],
  "Nottingham Forest": [
    { name: "Matz Sels", position: "GK", specificPosition: "GK", rating: 82, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Murillo", position: "DEF", specificPosition: "CB", rating: 82, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Nikola Milenković", position: "DEF", specificPosition: "CB", rating: 81, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Ola Aina", position: "DEF", specificPosition: "RB", rating: 80, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Neco Williams", position: "DEF", specificPosition: "LB", rating: 78, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Elliot Anderson", position: "MID", specificPosition: "CDM", rating: 80, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Morgan Gibbs-White", position: "MID", specificPosition: "RCM", rating: 83, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Ibrahim Sangaré", position: "MID", specificPosition: "LCM", rating: 79, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Callum Hudson-Odoi", position: "FWD", specificPosition: "LW", rating: 79, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Chris Wood", position: "FWD", specificPosition: "ST", rating: 81, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Anthony Elanga", position: "FWD", specificPosition: "RW", rating: 79, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Taiwo Awoniyi", position: "FWD", specificPosition: "ST", rating: 76, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Ryan Yates", position: "MID", specificPosition: "CDM", rating: 76, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Nicolò Savona", position: "DEF", specificPosition: "RB", rating: 75, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Jota Silva", position: "FWD", specificPosition: "LW", rating: 75, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
    { name: "Carlos Miguel", position: "GK", specificPosition: "GK", rating: 73, team: "Nottingham Forest", flag: "https://crests.football-data.org/351.png" },
  ],
  "Sunderland": [
    { name: "Anthony Patterson", position: "GK", specificPosition: "GK", rating: 76, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Dan Ballard", position: "DEF", specificPosition: "CB", rating: 75, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Luke O'Nien", position: "DEF", specificPosition: "CB", rating: 74, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Dennis Cirkin", position: "DEF", specificPosition: "LB", rating: 73, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Trai Hume", position: "DEF", specificPosition: "RB", rating: 75, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Dan Neil", position: "MID", specificPosition: "CDM", rating: 75, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Jobe Bellingham", position: "MID", specificPosition: "LCM", rating: 77, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Patrick Roberts", position: "FWD", specificPosition: "RW", rating: 75, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Romaine Mundle", position: "FWD", specificPosition: "LW", rating: 74, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Wilson Isidor", position: "FWD", specificPosition: "ST", rating: 75, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Eliezer Mayenda", position: "FWD", specificPosition: "ST", rating: 73, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Chris Rigg", position: "MID", specificPosition: "RCM", rating: 74, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Aji Alese", position: "DEF", specificPosition: "LB", rating: 72, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Salis Abdul Samed", position: "MID", specificPosition: "CDM", rating: 73, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Simon Moore", position: "GK", specificPosition: "GK", rating: 70, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
    { name: "Aaron Connolly", position: "FWD", specificPosition: "ST", rating: 71, team: "Sunderland", flag: "https://crests.football-data.org/71.png" },
  ],
  "Tottenham Hotspur": [
    { name: "Guglielmo Vicario", position: "GK", specificPosition: "GK", rating: 84, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Cristian Romero", position: "DEF", specificPosition: "CB", rating: 86, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Micky van de Ven", position: "DEF", specificPosition: "CB", rating: 85, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Destiny Udogie", position: "DEF", specificPosition: "LB", rating: 81, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Pedro Porro", position: "DEF", specificPosition: "RB", rating: 82, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Yves Bissouma", position: "MID", specificPosition: "CDM", rating: 80, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "James Maddison", position: "MID", specificPosition: "LCM", rating: 83, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Dejan Kulusevski", position: "MID", specificPosition: "RCM", rating: 84, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Brennan Johnson", position: "FWD", specificPosition: "RW", rating: 80, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Dominic Solanke", position: "FWD", specificPosition: "ST", rating: 81, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Son Heung-min", position: "FWD", specificPosition: "LW", rating: 86, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Pape Matar Sarr", position: "MID", specificPosition: "CDM", rating: 80, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Richarlison", position: "FWD", specificPosition: "ST", rating: 79, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Djed Spence", position: "DEF", specificPosition: "RB", rating: 76, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Archie Gray", position: "MID", specificPosition: "LCM", rating: 77, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
    { name: "Fraser Forster", position: "GK", specificPosition: "GK", rating: 74, team: "Tottenham Hotspur", flag: "https://crests.football-data.org/73.png" },
  ],
};

export function getRosterForTeam(teamName: string, flag: string): Player[] {
  const cleanStr = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

  const normClean = cleanStr(teamName);
  let key = Object.keys(TEAM_ROSTERS).find(k => cleanStr(k) === normClean);
  if (!key) {
    key = Object.keys(TEAM_ROSTERS).find(k => {
      const kNorm = cleanStr(k);
      return normClean.includes(kNorm) || kNorm.includes(normClean);
    });
  }

  if (key && TEAM_ROSTERS[key] && TEAM_ROSTERS[key].length > 0) {
    return TEAM_ROSTERS[key].map(p => ({ ...p, flag, team: teamName }));
  }

  const positions: ('GK' | 'DEF' | 'MID' | 'FWD')[] = ['GK','DEF','DEF','DEF','DEF','MID','MID','MID','FWD','FWD','FWD'];
  const specificPositions: ('GK' | 'LB' | 'CB' | 'RB' | 'LCM' | 'CDM' | 'RCM' | 'LW' | 'ST' | 'RW')[] = ['GK','LB','CB','CB','RB','LCM','CDM','RCM','LW','ST','RW'];
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const squadNames = ["Silva","Santos","Fernandez","Rodriguez","Smith","Jones"];
  const roster = [];
  for (let i = 0; i < 11; i++) {
    roster.push({
      name: `${String.fromCharCode(65 + Math.abs((hash + i * 13) % 26))}. ${squadNames[Math.abs((hash + i * 3) % squadNames.length)]}`,
      position: positions[i],
      specificPosition: specificPositions[i],
      rating: 75 + Math.abs((hash + i * 7) % 15),
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
