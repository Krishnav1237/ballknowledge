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

export function generateVerdict(
  text: string,
  mode: 'take' | 'rival' | 'humble' | 'court',
  overrides?: Partial<VerdictData>
): VerdictData {
  const normalizedText = text.toLowerCase();
  
  // 1. Fanbase Detection
  let fanbaseMatch: Fanbase | null = null;
  let isRivalry = false;

  const rivalries = [
    { keys: ["messi", "ronaldo"], label: "Messi vs Ronaldo" },
    { keys: ["cr7", "leo messi"], label: "Messi vs Ronaldo" },
    { keys: ["barca", "real madrid"], label: "El Clasico" },
    { keys: ["barcelona", "madrid"], label: "El Clasico" },
    { keys: ["england", "germany"], label: "England vs Germany" }
  ];

  for (const rival of rivalries) {
    if (rival.keys.every(k => normalizedText.includes(k))) {
      isRivalry = true;
      fanbaseMatch = { name: rival.label, category: "Rivalry", threat: "Maximum", nickname: "World War" };
      break;
    }
  }

  if (!fanbaseMatch) {
    for (const key in TRIBUNAL_DB.fanbases) {
      if (normalizedText.includes(key)) {
        fanbaseMatch = TRIBUNAL_DB.fanbases[key];
        break;
      }
    }
  }

  // 2. Rarity Tier determination
  const roll = Math.random();
  let rarity = "COMMON";
  if (isRivalry) {
    rarity = roll > 0.4 ? "GENERATIONAL HATING" : "RARE DELUSION";
  } else if (normalizedText.includes("hate") || normalizedText.includes("trash") || normalizedText.includes("finished") || normalizedText.includes("fraud")) {
    rarity = roll > 0.5 ? "GENERATIONAL HATING" : "COMMON";
  } else {
    if (roll > 0.9) rarity = "HISTORICALLY CORRECT";
    else if (roll > 0.7) rarity = "GENERATIONAL HATING";
    else if (roll > 0.45) rarity = "RARE DELUSION";
    else rarity = "COMMON";
  }

  // 3. Compute stats
  let ballKnowledge = 0;
  let copium = 0;
  let bottlePotential = 0;
  let varVictim = 0;
  let auraInflation = 0;

  if (rarity === "HISTORICALLY CORRECT") {
    ballKnowledge = Math.floor(Math.random() * 10) + 90;
    copium = Math.floor(Math.random() * 20);
    bottlePotential = Math.floor(Math.random() * 30);
    varVictim = Math.floor(Math.random() * 40);
    auraInflation = Math.floor(Math.random() * 15) + 80;
  } else if (rarity === "RARE DELUSION") {
    ballKnowledge = Math.floor(Math.random() * 25);
    copium = Math.floor(Math.random() * 15) + 85;
    bottlePotential = Math.floor(Math.random() * 15) + 85;
    varVictim = Math.floor(Math.random() * 20) + 70;
    auraInflation = Math.floor(Math.random() * 15) + 80;
  } else {
    ballKnowledge = Math.floor(Math.random() * 50) + 20;
    copium = Math.floor(Math.random() * 60) + 30;
    bottlePotential = Math.floor(Math.random() * 50) + 40;
    varVictim = Math.floor(Math.random() * 70) + 20;
    auraInflation = Math.floor(Math.random() * 50) + 40;
  }

  // Custom adjustments based on keyword overrides
  if (normalizedText.includes("antony")) {
    ballKnowledge = 2;
    auraInflation = 99;
    copium = 99;
  }
  if (normalizedText.includes("kane")) {
    bottlePotential = 99;
  }
  if (normalizedText.includes("england") || normalizedText.includes("coming home")) {
    bottlePotential = 95;
    copium = 98;
  }

  const variableStat = Math.floor(Math.random() * 50) + 45;

  // 4. Resolve Charge
  let chargeKey = "general";
  if (fanbaseMatch) {
    for (const key in TRIBUNAL_DB.charges) {
      if (fanbaseMatch.name.toLowerCase().includes(key) || key.includes(fanbaseMatch.name.toLowerCase())) {
        chargeKey = key;
        break;
      }
    }
  }
  const chargeList = TRIBUNAL_DB.charges[chargeKey] || TRIBUNAL_DB.charges.general;
  const charge = chargeList[Math.floor(Math.random() * chargeList.length)];

  // 5. Resolve Sentence
  let sentenceKey = "general";
  if (fanbaseMatch) {
    for (const key in TRIBUNAL_DB.sentences) {
      if (fanbaseMatch.name.toLowerCase().includes(key) || key.includes(fanbaseMatch.name.toLowerCase())) {
        sentenceKey = key;
        break;
      }
    }
  }
  const sentenceList = TRIBUNAL_DB.sentences[sentenceKey] || TRIBUNAL_DB.sentences.general;
  let sentence = sentenceList[Math.floor(Math.random() * sentenceList.length)];

  // 6. Verdict text & OVR selection
  let verdictText = "";
  let ovrScore = 50;

  if (mode === "humble") {
    verdictText = "HIGH BOTTLE RISK";
    ovrScore = bottlePotential;
    sentence = `Humbling Risk: ${ovrScore}%. Verdict: Prepare apology posts. The bottling is scheduled.`;
  } else if (mode === "rival") {
    verdictText = "RIVALRY GRADED";
    ovrScore = Math.floor((copium + varVictim + auraInflation) / 3);
  } else if (mode === "court") {
    verdictText = ballKnowledge < 35 ? "GUILTY OF FOOTBALL CRIMES" : "ACQUITTED (CASE DISMISSED)";
    ovrScore = Math.floor((copium + bottlePotential + varVictim) / 3);
  } else {
    verdictText = ballKnowledge > 70 ? "CERTIFIED COOKING APPROVED" : "PURE DELUSION RATED";
    ovrScore = ballKnowledge;
  }

  // Rephrase sentences to avoid court terms for hot take grading
  let sentenceText = sentence;
  if (mode !== 'court') {
    sentenceText = sentenceText
      .replace(/Sentenced to/g, "Recommended to")
      .replace(/Banished to/g, "Forced to");
  }

  // Handle manual OVR override
  const finalOvr = overrides?.ovr !== undefined ? overrides.ovr : ovrScore;

  // 7. Dynamic Hooky Ruling text based on OVR
  let rulingText = "Casual Fan";
  if (finalOvr >= 90) rulingText = "🔥 Certified Chef";
  else if (finalOvr >= 70) rulingText = "🧠 Elite Ball IQ";
  else if (finalOvr >= 40) rulingText = "⚠️ Mid Take";
  else if (finalOvr >= 15) rulingText = "❌ Pure Delusion";
  else rulingText = "💀 Football Terrorist";

  // 8. Resolve Achievement
  let ach = TRIBUNAL_DB.achievements[0];
  if (finalOvr >= 90) {
    ach = TRIBUNAL_DB.achievements.find(a => a.title === "Certified Chef") || TRIBUNAL_DB.achievements[0];
  } else if (finalOvr >= 70) {
    ach = TRIBUNAL_DB.achievements.find(a => a.title === "Tactical Professor") || TRIBUNAL_DB.achievements[4];
  } else if (copium > 85) {
    ach = TRIBUNAL_DB.achievements.find(a => a.title === "Delusion Legend") || TRIBUNAL_DB.achievements[2];
  } else if (bottlePotential > 85) {
    ach = TRIBUNAL_DB.achievements.find(a => a.title === "Football Terrorist") || TRIBUNAL_DB.achievements[3];
  } else {
    ach = TRIBUNAL_DB.achievements.find(a => a.title === "Repeat Offender") || TRIBUNAL_DB.achievements[1];
  }

  // Guess country flag locally
  let guessedFlag = '🌍';
  const textLower = normalizedText;
  if (textLower.includes("messi") || textLower.includes("argentina") || textLower.includes("maradona") || textLower.includes("scaloni")) guessedFlag = '🇦🇷';
  else if (textLower.includes("ronaldo") || textLower.includes("portugal") || textLower.includes("cr7") || textLower.includes("martinez") || textLower.includes("al nassr")) guessedFlag = '🇵🇹';
  else if (textLower.includes("england") || textLower.includes("kane") || textLower.includes("bellingham") || textLower.includes("southgate") || textLower.includes("coming home") || textLower.includes("saka")) guessedFlag = '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  else if (textLower.includes("france") || textLower.includes("mbappe") || textLower.includes("zidane") || textLower.includes("griezmann")) guessedFlag = '🇫🇷';
  else if (textLower.includes("brazil") || textLower.includes("neymar") || textLower.includes("vinicius") || textLower.includes("vini") || textLower.includes("pele")) guessedFlag = '🇧🇷';
  else if (textLower.includes("spain") || textLower.includes("yamal") || textLower.includes("rodri") || textLower.includes("pedri") || textLower.includes("iniesta") || textLower.includes("xavi")) guessedFlag = '🇪🇸';
  else if (textLower.includes("germany") || textLower.includes("kroos") || textLower.includes("musiala") || textLower.includes("wirtz") || textLower.includes("muller")) guessedFlag = '🇩🇪';
  else if (textLower.includes("italy")) guessedFlag = '🇮🇹';
  else if (textLower.includes("morocco")) guessedFlag = '🇲🇦';
  else if (textLower.includes("japan")) guessedFlag = '🇯🇵';
  else if (textLower.includes("uruguay") || textLower.includes("suarez")) guessedFlag = '🇺🇾';
  else if (textLower.includes("mexico")) guessedFlag = '🇲🇽';
  else if (textLower.includes("india")) guessedFlag = '🇮🇳';
  else if (textLower.includes("usa") || textLower.includes("pulisic") || textLower.includes("america")) guessedFlag = '🇺🇸';

  // Guess club badge and name locally
  let guessedClubBadge = '⚽';
  let guessedClubName = 'VAR';
  if (textLower.includes("city") || textLower.includes("pep") || textLower.includes("115") || textLower.includes("haaland") || textLower.includes("guardiola")) {
    guessedClubBadge = '🛢️';
    guessedClubName = 'VAR CITY';
  } else if (textLower.includes("united") || textLower.includes("ten hag") || textLower.includes("mufc") || textLower.includes("rashford") || textLower.includes("bruno")) {
    guessedClubBadge = '👹';
    guessedClubName = '1999 FC';
  } else if (textLower.includes("arsenal") || textLower.includes("arteta") || textLower.includes("gunners") || textLower.includes("saliba") || textLower.includes("odegaard")) {
    guessedClubBadge = '🤡';
    guessedClubName = 'BANTER FC';
  } else if (textLower.includes("chelsea") || textLower.includes("boehly") || textLower.includes("cole palmer") || textLower.includes("palmer") || textLower.includes("recruitment")) {
    guessedClubBadge = '🔵';
    guessedClubName = 'SPEND FC';
  } else if (textLower.includes("real madrid") || textLower.includes("madrid") || textLower.includes("ancelotti") || textLower.includes("champions league") || textLower.includes("ucl")) {
    guessedClubBadge = '👑';
    guessedClubName = 'PLOT ARMOR';
  } else if (textLower.includes("barcelona") || textLower.includes("barca") || textLower.includes("lewandowski") || textLower.includes("lever") || textLower.includes("laporta")) {
    guessedClubBadge = '🚜';
    guessedClubName = 'LEVER FC';
  } else if (textLower.includes("antony") || textLower.includes("spin")) {
    guessedClubBadge = '🌀';
    guessedClubName = 'SPINNER FC';
  } else if (textLower.includes("kane") || textLower.includes("spurs") || textLower.includes("tottenham") || textLower.includes("trophy")) {
    guessedClubBadge = '🚫';
    guessedClubName = 'EMPTY CASE';
  } else if (textLower.includes("psg") || textLower.includes("mbappe")) {
    guessedClubBadge = '🗼';
    guessedClubName = 'BOTTLE RM';
  }

  // Guess player position locally
  let guessedPosition = 'TKT';
  if (finalOvr < 45) guessedPosition = 'BOT'; // Bottler
  else if (textLower.includes("messi") || textLower.includes("ronaldo") || textLower.includes("goat")) guessedPosition = 'GOT'; // GOAT candidate
  else if (textLower.includes("fraud") || textLower.includes("cooked") || textLower.includes("hate") || textLower.includes("trash")) guessedPosition = 'HTR'; // Hater
  else if (textLower.includes("tactical") || textLower.includes("manager") || textLower.includes("southgate") || textLower.includes("pep") || textLower.includes("ten hag") || textLower.includes("arteta")) guessedPosition = 'MGR'; // Manager
  else if (finalOvr >= 85) guessedPosition = 'CF'; // Chef Cooking
  else guessedPosition = 'DM'; // Delusion Merchant

  const baseStats = [
    { label: "IQ", name: "Football IQ", val: ballKnowledge },
    { label: "DEL", name: "Delusion", val: Math.min(100, Math.max(1, 100 - ballKnowledge + Math.floor(Math.random() * 10) - 5)) },
    { label: "COP", name: "Copium", val: copium },
    { label: "BOT", name: "Bottle Risk", val: bottlePotential },
    { label: "AUR", name: "Aura", val: auraInflation },
    { label: "TRIG", name: "Trigger Rate", val: variableStat }
  ];

  // Merge stats if overrides provide custom stat values
  let finalStats = baseStats;
  if (overrides?.stats) {
    finalStats = baseStats.map(bs => {
      const match = overrides.stats?.find(os => os.label === bs.label);
      return match ? { ...bs, val: match.val } : bs;
    });
  }

  const resultData: VerdictData = {
    id: overrides?.id,
    text,
    mode,
    caseId: overrides?.caseId || Math.floor(Math.random() * 9000) + 1000,
    fanbase: fanbaseMatch,
    isRivalry,
    rarity: overrides?.rarity || rarity,
    ovr: finalOvr,
    rulingText,
    verdict: overrides?.verdict || verdictText,
    charge: overrides?.charge || charge,
    sentence: overrides?.sentence || sentenceText,
    ach: overrides?.ach || ach,
    stats: finalStats,
    cardTheme: overrides?.cardTheme,
    countryFlag: overrides?.countryFlag || guessedFlag,
    playerName: overrides?.playerName || (mode === 'court' ? 'ACCUSED' : 'TAKE MAKER'),
    playerPosition: overrides?.playerPosition || guessedPosition,
    clubBadge: overrides?.clubBadge || guessedClubBadge,
    clubName: overrides?.clubName || guessedClubName,
    avatarStyle: overrides?.avatarStyle || 'fun-emoji',
    avatarSeed: overrides?.avatarSeed || (mode === 'court' ? 'ACCUSED' : 'TAKE MAKER')
  };

  return resultData;
}

// Prophet Match Prediction Logic (Simplified)
export function generateProphecy(question: string, id?: string): ProphecyData {
  const normalizedText = question.toLowerCase();
  
  let title = "WORLD CUP ORACLE PREDICTION";
  let leadParagraph = "";
  let sections: { heading: string; body: string }[] = [];
  let verdictSummary = "";
  let probabilityScore = 50;
  const stadiumContext = "stadium_bg.png";

  const author = "VAR Chief Official";

  if (normalizedText.includes("england") || normalizedText.includes("bottle") || normalizedText.includes("coming home")) {
    title = "PROPHECY: THE PENALTY BOTTLE CURSE";
    leadParagraph = "The sky turns grey. As England prepares to declare football is coming home, the alignment of the stars points to a familiar script in a penalty box.";
    sections = [
      {
        heading: "Tactical Caution",
        body: "Calculations indicate a high probability of a defensive block against a lower-seeded team. Midfield creativity will be traded for tactical stiffness."
      },
      {
        heading: "119th Minute Sub",
        body: "A late penalty specialist will be subbed in with frozen legs. The ball is destined to hit the crossbar, ending the dream."
      }
    ];
    verdictSummary = "THE ORACLE DECIDES: It is not coming home. Prepare the apology letters and blame the ball design.";
    probabilityScore = 95;
  } else if (normalizedText.includes("argentina") || normalizedText.includes("messi")) {
    title = "PROPHECY: THE CHAMPIONS ROAD MAP";
    leadParagraph = "A gentle breeze blows through the stadium. A small figure walks at a slow pace, yet the entire opposing backline is in a state of sheer panic.";
    sections = [
      {
        heading: "The Walking Threat",
        body: "While the god-king walks, his midfielders will run tireless miles, sacrificing their joints to keep the ball safe."
      },
      {
        heading: "89th Minute Penalty",
        body: "A slight brush in the box, a theatrical fall, and the referee points to the spot. A cool penalty seals the match."
      }
    ];
    verdictSummary = "THE ORACLE DECIDES: Victory is pre-ordained. The coronation will proceed, supported by a convenient VAR decision.";
    probabilityScore = 88;
  } else {
    title = "PROPHECY: THE TOURNAMENT BUBBLE BURST";
    leadParagraph = "The pitch is wet, the stadium lights are bright. A tactical fraudulence is spreading in the dressing room, setting the stage for a tragic collapse.";
    sections = [
      {
        heading: "The Wet Pitch Trap",
        body: "Stats mean nothing tonight. A defensive team will park the bus and score from a corner, completely defying possession logic."
      },
      {
        heading: "The Apology Post",
        body: "Following a 1-0 defeat with 78% possession, the club PR will draft a heartfelt apology post for the fans."
      }
    ];
    verdictSummary = "THE ORACLE DECIDES: Humbling is imminent. Delete your predictions and log off Twitter.";
    probabilityScore = 65;
  }

  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = currentDate.toLocaleDateString('en-US', options);

  const finalScore = probabilityScore;
  const isBottle = title.includes("BOTTLE");
  const verdictText = isBottle ? 'BOTTLE RISK CRITICAL' : (finalScore > 80 ? 'THE CROWN SURVIVES' : 'WORLD CUP READY');

  return {
    id,
    question,
    title,
    date: dateStr,
    author,
    leadParagraph,
    analysisSections: {
      sections,
      metrics: {
        confidence: finalScore,
        bottleRisk: isBottle ? 96 : Math.floor(Math.random() * 40) + 30,
        narrativeRisk: Math.floor(Math.random() * 30) + 60,
        delusionFactor: normalizedText.includes("coming home") ? 98 : Math.floor(Math.random() * 50) + 30,
        mediaHype: Math.floor(Math.random() * 40) + 55,
        glory: finalScore,
        heartbreak: 100 - finalScore,
        chaos: Math.floor(Math.random() * 40) + 40,
        aura: Math.floor(Math.random() * 30) + 60,
        upset: Math.floor(Math.random() * 50) + 20
      },
      headline: title.replace("PROPHECY: ", ""),
      projectedFinish: finalScore > 80 ? 'Champion' : finalScore > 65 ? 'Final' : 'Quarter Final',
      threats: {
        biggestThreat: normalizedText.includes("messi") ? "France" : "Brazil",
        dangerousOpponent: "Spain",
        potentialUpset: "Morocco",
        criticalWeakness: "Defensive transition block"
      },
      oracleVerdict: verdictText,
      timeMachine: {
        predictionDate: new Date().toISOString().split('T')[0],
        tournamentDate: "July 2026",
        status: "PENDING"
      },
      votes: {
        agree: Math.floor(Math.random() * 200) + 50,
        disagree: Math.floor(Math.random() * 100) + 20
      },
      challenge: null
    },
    verdictSummary,
    probabilityScore,
    stadiumContext
  };
}
