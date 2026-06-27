export interface Fanbase {
  name: string;
  category: string;
  threat: string;
  nickname: string;
}

export interface Achievement {
  title: string;
  desc: string;
  badge: string;
}

export interface CaseOfDay {
  id: string;
  defendant: string;
  charge: string;
  verdict: string;
  sentence: string;
  badge: string;
  achievement: string;
}

export interface Stat {
  label: string;
  name: string;
  val: number;
}

export interface VerdictData {
  id?: string;
  text: string;
  mode: 'take' | 'rival' | 'humble' | 'court';
  caseId: number;
  fanbase: Fanbase | null;
  isRivalry: boolean;
  rarity: string;
  ovr: number;
  rulingText: string; // Chef, Delusion, Terrorist etc.
  verdict: string;
  charge: string;
  sentence: string;
  ach: Achievement;
  stats: Stat[];
  cardTheme?: string;
  countryFlag?: string;
  playerName?: string;
  playerPosition?: string;
  clubBadge?: string;
  clubName?: string;
  avatarStyle?: string;
  avatarSeed?: string;
  aiImageUrl?: string;
  matchScore?: string;
  matchTitle?: string;
}

export interface ProphecyData {
  id?: string;
  question: string;
  title: string;
  date: string;
  author: string;
  leadParagraph: string;
  analysisSections: any;
  verdictSummary: string;
  probabilityScore: number;
  stadiumContext: string;
}

export const TRIBUNAL_DB = {
  fanbases: {
    "ronaldo": { name: "Ronaldo Fans", category: "Superfans", threat: "High", nickname: "SIUUU Choir" },
    "cr7": { name: "Ronaldo Fans", category: "Superfans", threat: "High", nickname: "SIUUU Choir" },
    "messi": { name: "Messi Fans", category: "Superfans", threat: "High", nickname: "GOAT Believers" },
    "argentina": { name: "Argentina Fans", category: "National Base", threat: "Medium", nickname: "Champions" },
    "brazil": { name: "Brazil Fans", category: "National Base", threat: "Medium", nickname: "Samba Boys" },
    "england": { name: "England Fans", category: "Hopefuls", threat: "Extreme", nickname: "Homecoming Choir" },
    "france": { name: "France Fans", category: "Contenders", threat: "High", nickname: "Les Bleus" },
    "germany": { name: "Germany Fans", category: "Contenders", threat: "Medium", nickname: "The Machine" },
    "spain": { name: "Spain Fans", category: "Passers", threat: "Medium", nickname: "Tiki-Taka Spammers" },
    "kane": { name: "Harry Kane Fans", category: "Trophy-less", threat: "Medium", nickname: "Curse Keepers" },
    "arsenal": { name: "Arsenal Fans", category: "Hopefuls", threat: "High", nickname: "Next Year FC" },
    "chelsea": { name: "Chelsea Fans", category: "Spenders", threat: "High", nickname: " Boehly's Bank" },
    "man united": { name: "United Fans", category: "Nostalgic", threat: "High", nickname: "1999 Fans" },
    "man city": { name: "City Fans", category: "Accountants", threat: "Extreme", nickname: "115 Lawyers" },
    "var": { name: "VAR Room", category: "Referees", threat: "Critical", nickname: "Line Drawers" },
    "referee": { name: "VAR Room", category: "Referees", threat: "Critical", nickname: "Line Drawers" }
  } as Record<string, Fanbase>,

  charges: {
    ronaldo: [
      "Using goals scored in friendlies to argue GOAT status.",
      "Claiming the Saudi Pro League is harder than the European Champions League.",
      "Tweeting 'Factos' under random Lionel Messi highlight videos."
    ],
    messi: [
      "Defending MLS defender positions as 'highly tactical low blocks'.",
      "Asserting World Cup penalty calls were written by football destiny.",
      "Claiming Messi walking 5km per game is a masterclass in space creation."
    ],
    england: [
      "Singing 'It's Coming Home' after beating a team ranked 120th in the world.",
      "Blaming the grass, the referee, and the balls for another penalty shootout exit.",
      "Stating English players are worth £150 million based on one pre-season friendly."
    ],
    var: [
      "Drawing red and blue lines for 8 minutes only to get the call completely wrong.",
      "Apologizing to national managers on Monday morning after ruining their World Cup dream."
    ],
    general: [
      "Claiming a World Cup legend is finished after one bad half of football.",
      "Valuing expected goals (xG) statistics more than actual goals in the net.",
      "Using video game ratings to settle real-world World Cup debates.",
      "Claiming your team was robbed when they failed to register a single shot on target."
    ]
  } as Record<string, string[]>,

  sentences: {
    ronaldo: [
      "Sentenced to watch Messi lift the World Cup trophy on loop for 24 hours.",
      "Forced to write a 1,000-word apology letter to the Ballon d'Or committee."
    ],
    messi: [
      "Sentenced to watch PSG Champions League bottlejobs on repeat.",
      "Banished to play in the MLS reserves behind Gonzalo Higuain."
    ],
    england: [
      "Sentenced to 4 more years of extreme tournament optimism followed by a shootout exit.",
      "Forced to listen to a 5-hour podcast detailing the beauty of defensive passing."
    ],
    var: [
      "Sentenced to explain offside lines to a stadium of angry fans without stuttering.",
      "Banished to referee local Sunday league games with no video assistant."
    ],
    general: [
      "Sentenced to listen to a rival fan commentate on your daily errors in real time.",
      "Banned from using the words 'Aura', 'Cooked', or 'Finished' for six calendar months.",
      "Forced to play football with a controller that only lets you pass backwards.",
      "Sentenced to be the designated water carrier for your local Sunday league team."
    ]
  } as Record<string, string[]>,

  verdicts: [
    { text: "GUILTY OF SUPREME DELUSION", severity: "Extreme" },
    { text: "VAR SCANDAL CONFIRMED", severity: "Critical" },
    { text: "ACQUITTED (PURE BALL KNOWLEDGE)", severity: "Low" },
    { text: "GENERATIONAL HATING APPROVED", severity: "Severe" },
    { text: "AURA BANKRUPT: IMMEDIATELY GUILTY", severity: "Critical" }
  ],

  achievements: [
    { title: "Certified Chef", desc: "Awarded for elite tactical takes.", badge: "🔥" },
    { title: "Repeat Offender", desc: "Awarded for posting zero-IQ takes consecutive times.", badge: "⚖️" },
    { title: "Delusion Legend", desc: "Awarded for takes with Copium levels exceeding 90%.", badge: "🏆" },
    { title: "Football Terrorist", desc: "Awarded for defending defensive play.", badge: "💀" },
    { title: "Tactical Professor", desc: "Awarded for exceptional football knowledge.", badge: "🧠" }
  ] as Achievement[],

  casesOfDay: [
    {
      id: "4812",
      defendant: "England Penalty Shootouts",
      charge: "Claiming 'It's Coming Home' since 1966 despite constant penalty collapses.",
      verdict: "GUILTY OF DELUSION",
      sentence: "Mandatory 2-hour daily penalty practice under Ivan Toney.",
      badge: "💀",
      achievement: "Football Terrorist"
    },
    {
      id: "5921",
      defendant: "Neymar Diving Incidents",
      charge: "Performing 14 rolling motions after light contact in the box.",
      verdict: "VAR SCANDAL CONFIRMED",
      sentence: "Banished to a carnival in Rio for 30 business days.",
      badge: "🏆",
      achievement: "Certified Hater"
    }
  ] as CaseOfDay[],

  placeholders: [
    "England will bottle the World Cup final on penalties",
    "Messi is the undisputed GOAT after Qatar",
    "Ronaldo was holding Portugal back in the knockouts",
    "VAR has ruined the tournament's best goal",
    "Real Madrid has Champions League plot armor",
    "Chelsea spent £1 billion just to qualify for the conference league"
  ]
};
