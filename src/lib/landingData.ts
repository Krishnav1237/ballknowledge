export const BREAKING_NEWS = [
  'ROUND OF 32 IS LIVE: 16 knockout fixtures. Submit predictions before kickoff.',
  'FOOTBALL IQ: Build your reputation, one knockout prediction at a time.',
  'COLLECT VERDICTS: Every R32 fixture graded yields a custom VAR Match Card.',
  'LOCK IN NOW: Round of 32 runs June 28 – July 3. Predictions close at kickoff.',
  'VIRAL CARD ALBUM: Predict R32 matches, claim cards, and share your binder.',
  'KNOCKOUT STAGE: Group standings are final. The Round of 32 begins today.',
];

export const PLAYERS = [
  {
    src: '/images/messi.jpeg',
    alt: 'Lionel Messi World Cup Ceremony',
    flag: '🇦🇷',
    name: 'MESSI',
    country: 'Argentina',
    verdict: 'CORONATION CONFIRMED',
    hook: 'He lifted the trophy in Qatar. Yet, half the football world is still filing appeals. Grade whether the 2026 script is already written.',
    cardHook: 'Predict Argentina fixture →',
    href: '/world-cup-hub',
    accent: '#43AAFF',
    border: '#43AAFF',
  },
  {
    src: '/images/ronaldo.jpg',
    alt: 'Cristiano Ronaldo celebration',
    flag: '🇵🇹',
    name: 'RONALDO',
    country: 'Portugal',
    verdict: '47 FACTOS PENDING',
    hook: 'Benched in Qatar. Now compiling desert stats to defend an empire. Grade the final appeal of Cristiano\'s legacy before the final whistle.',
    cardHook: 'Predict Portugal fixture →',
    href: '/world-cup-hub',
    accent: '#E42313',
    border: '#E42313',
  },
  {
    src: '/images/neymar.jpeg',
    alt: 'Neymar Jr Brazil',
    flag: '🇧🇷',
    name: 'NEYMAR',
    country: 'Brazil',
    verdict: 'PERMANENTLY INJURED',
    hook: '1,847 career days lost to injury. A suspicious number coinciding with Rio carnival season. Summon the Samba Prince to the match day dock.',
    cardHook: 'Predict Brazil fixture →',
    href: '/world-cup-hub',
    accent: '#009739',
    border: '#009739',
  },
  {
    src: '/images/media__1781514653491.jpg',
    alt: 'Kylian Mbappe France',
    flag: '🇫🇷',
    name: 'MBAPPÉ',
    country: 'France',
    verdict: 'VETO POWER REVOKED',
    hook: 'Vetoed two national coaches. Demanded a sovereign buyout. Then walked away on a free. Read the tactical prophecy of his Madrid era.',
    cardHook: 'Predict France fixture →',
    href: '/world-cup-hub',
    accent: '#002395',
    border: '#002395',
  },
  {
    src: '/images/stadium_bg.webp',
    alt: 'Erling Haaland Norway',
    flag: '🇳🇴',
    name: 'HAALAND',
    country: 'Norway',
    verdict: 'GHOST IN BIG GAMES',
    hook: 'Scored 50+ goals in a calendar year. Vanished in three consecutive finals. Generational phenomenon or tap-in merchant?',
    cardHook: 'Predict Norway fixture →',
    href: '/world-cup-hub',
    accent: '#0EA5E9',
    border: '#0EA5E9',
  },
  {
    src: '/images/debate_bg.webp',
    alt: 'Jude Bellingham England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    name: 'BELLINGHAM',
    country: 'England',
    verdict: 'PR CAMPAIGN PENDING',
    hook: 'Broke records, won Madrid crowns, celebrated with arms wide open. Yet, went silent in the Euro knockout stages. Summon him.',
    cardHook: 'Predict England fixture →',
    href: '/world-cup-hub',
    accent: '#E0A96D',
    border: '#E0A96D',
  },
  {
    src: '/images/chaos_crowd.webp',
    alt: 'Vinicius Jr Brazil',
    flag: '🇧🇷',
    name: 'VINÍCIUS',
    country: 'Brazil',
    verdict: 'BALLON D\'OR VETO',
    hook: 'Dribbled past whole defenses, declared himself king. Yet, boycotted the Ballon d\'Or ceremony after a shocking veto.',
    cardHook: 'Predict Brazil fixture →',
    href: '/world-cup-hub',
    accent: '#FBBF24',
    border: '#FBBF24',
  },
  {
    src: '/images/last_dance.webp',
    alt: 'Harry Kane England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    name: 'KANE',
    country: 'England',
    verdict: 'THE ETERNAL CURSE',
    hook: 'Scored 400+ career goals, broke German scoring records, yet still has zero trophies. The curse is mathematically proven. Summon him.',
    cardHook: 'Predict England fixture →',
    href: '/world-cup-hub',
    accent: '#64748B',
    border: '#64748B',
  },
];

// Exactly the 32 Round of 32 qualified nations
export const COUNTRIES = [
  // Group A
  { flag: '🇲🇽', name: 'Mexico',                group: 'A', fifa: 'MEX', qualified: 'Group A Winner',   color: '#006847', verdict: 'AZTEC NARRATIVE', story: 'Co-hosts and Group A winners. Can El Tri survive the pressure of a home crowd?', href: '/world-cup-hub' },
  { flag: '🇿🇦', name: 'South Africa',          group: 'A', fifa: 'RSA', qualified: 'Group A Runner-up', color: '#007A4D', verdict: 'BAFANA SHOCK',     story: 'Qualified from Group A alongside Mexico. The rainbow nation is roaring on the world stage.', href: '/world-cup-hub' },

  // Group B
  { flag: '🇨🇦', name: 'Canada',                 group: 'B', fifa: 'CAN', qualified: 'Group B Winner',   color: '#FF0000', verdict: 'MAPLE UPRISING',  story: 'Co-hosts Canada make history by winning Group B. The maple leaf is shining bright.', href: '/world-cup-hub' },
  { flag: '🇨🇭', name: 'Switzerland',            group: 'B', fifa: 'SUI', qualified: 'Group B Runner-up', color: '#D52B1E', verdict: 'CLOCKWORK SWISS', story: 'Solid, professional, and through from Group B. Always a threat in the knockouts.', href: '/world-cup-hub' },
  { flag: '🇧🇦', name: 'Bosnia & Herzegovina',  group: 'B', fifa: 'BIH', qualified: 'Best 3rd Place',   color: '#002F6C', verdict: 'DRAGON GLORY',    story: 'Squeezed through from Group B. The Dragons are dangerous and have nothing to lose.', href: '/world-cup-hub' },

  // Group C
  { flag: '🇧🇷', name: 'Brazil',                 group: 'C', fifa: 'BRA', qualified: 'Group C Winner',   color: '#009739', verdict: 'SAMBA EXILE',     story: 'Group C winners. The Selecao march through with five stars on their chest and gold in their sights.', href: '/world-cup-hub' },
  { flag: '🇲🇦', name: 'Morocco',                group: 'C', fifa: 'MAR', qualified: 'Group C Runner-up', color: '#C1272D', verdict: 'ATLAS STRIKES',   story: 'Qualified from Group C. The 2022 semi-finalists are back to defend their African narrative.', href: '/world-cup-hub' },

  // Group D
  { flag: '🇺🇸', name: 'United States',          group: 'D', fifa: 'USA', qualified: 'Group D Winner',   color: '#B22234', verdict: 'SLEEPING GIANT',  story: 'Group D winners on home soil. Pulisic leads a generation ready to own the narrative.', href: '/world-cup-hub' },
  { flag: '🇦🇺', name: 'Australia',              group: 'D', fifa: 'AUS', qualified: 'Group D Runner-up', color: '#FFCD00', verdict: 'SOCCEROO PUNCH',  story: 'Qualified from Group D. Built for knockout warfare, the Socceroos fear no one.', href: '/world-cup-hub' },
  { flag: '🇵🇾', name: 'Paraguay',               group: 'D', fifa: 'PAR', qualified: 'Best 3rd Place',   color: '#D52B1E', verdict: 'GUARANI SHOCK',   story: 'Squeezed through from Group D. Grit, passion, and a nightmare draw for any opponent.', href: '/world-cup-hub' },

  // Group E
  { flag: '🇩🇪', name: 'Germany',                group: 'E', fifa: 'GER', qualified: 'Group E Winner',   color: '#222222', verdict: 'ENGINE REBORN',   story: 'Group E winners. The Prussian machine has been rebuilt and is firing on all cylinders.', href: '/world-cup-hub' },
  { flag: '🇨🇮', name: 'Ivory Coast',            group: 'E', fifa: 'CIV', qualified: 'Group E Runner-up', color: '#F77F00', verdict: 'ELEPHANTS CHARGE', story: 'Qualified from Group E. A physical, powerful side carrying the weight of a continent.', href: '/world-cup-hub' },
  { flag: '🇪🇨', name: 'Ecuador',                group: 'E', fifa: 'ECU', qualified: 'Best 3rd Place',   color: '#FFD100', verdict: 'LA TRI TRAP',     story: 'Squeezed through from Group E. Built to spoil and dangerous on the counter.', href: '/world-cup-hub' },

  // Group F
  { flag: '🇳🇱', name: 'Netherlands',            group: 'F', fifa: 'NED', qualified: 'Group F Winner',   color: '#FF6600', verdict: 'ORANJE SURVIVE',  story: 'Group F winners. The Oranje march on with a point to prove and the quality to back it up.', href: '/world-cup-hub' },
  { flag: '🇯🇵', name: 'Japan',                  group: 'F', fifa: 'JPN', qualified: 'Group F Runner-up', color: '#BC002D', verdict: 'SUPREME CLASS',   story: 'Qualified from Group F. The Samurai Blue are clean, clinical, and ready to slay giants.', href: '/world-cup-hub' },
  { flag: '🇸🇪', name: 'Sweden',                 group: 'F', fifa: 'SWE', qualified: 'Best 3rd Place',   color: '#006AA7', verdict: 'SWEDISH MACHINE', story: 'Squeezed through from Group F. Scandinavia\'s finest, organized and clinical in the knockouts.', href: '/world-cup-hub' },

  // Group G
  { flag: '🇧🇪', name: 'Belgium',                group: 'G', fifa: 'BEL', qualified: 'Group G Winner',   color: '#EF3340', verdict: 'GOLDEN FAREWELL', story: 'Group G winners. De Bruyne\'s golden generation gets one final shot at immortality.', href: '/world-cup-hub' },
  { flag: '🇪🇬', name: 'Egypt',                  group: 'G', fifa: 'EGY', qualified: 'Group G Runner-up', color: '#C1272D', verdict: 'PHARAOH REIGN',   story: 'Qualified from Group G. The Pharaohs are through and looking to conquer the Americas.', href: '/world-cup-hub' },

  // Group H
  { flag: '🇪🇸', name: 'Spain',                  group: 'H', fifa: 'ESP', qualified: 'Group H Winner',   color: '#AA151B', verdict: 'AUDACITY TEST',   story: 'Group H winners. Tiki-taka mastery and absolute clinical execution in the final third.', href: '/world-cup-hub' },
  { flag: '🇨🇻', name: 'Cape Verde',             group: 'H', fifa: 'CPV', qualified: 'Group H Runner-up', color: '#002A8F', verdict: 'BLUE SHARK MIRACLE', story: 'Qualified from Group H in a historic run. The Blue Sharks are ready to bite.', href: '/world-cup-hub' },

  // Group I
  { flag: '🇫🇷', name: 'France',                 group: 'I', fifa: 'FRA', qualified: 'Group I Winner',   color: '#002395', verdict: 'ROYAL MUTINY',    story: 'Group I winners. World-class talent, Madrid veto power, and a squad built to dominate.', href: '/world-cup-hub' },
  { flag: '🇳🇴', name: 'Norway',                 group: 'I', fifa: 'NOR', qualified: 'Group I Runner-up', color: '#EF2B2D', verdict: 'HAALAND MODE',     story: 'Qualified from Group I. Erling Haaland is at a World Cup and ready to detonate.', href: '/world-cup-hub' },
  { flag: '🇸🇳', name: 'Senegal',                group: 'I', fifa: 'SEN', qualified: 'Best 3rd Place',   color: '#00A859', verdict: 'TERANGA ROAR',    story: 'Squeezed through from Group I. The Lions of Teranga bring speed, power, and flair.', href: '/world-cup-hub' },

  // Group J
  { flag: '🇦🇷', name: 'Argentina',              group: 'J', fifa: 'ARG', qualified: 'Group J Winner',   color: '#43AAFF', verdict: 'CHAMPIONS MARCH', story: 'Group J winners. Defending champions led by Lionel Messi on his final tour.', href: '/world-cup-hub' },
  { flag: '🇩🇿', name: 'Algeria',                group: 'J', fifa: 'ALG', qualified: 'Group J Runner-up', color: '#006233', verdict: 'DESERT WARRIORS',  story: 'Qualified from Group J. Fearless, technical, and carrying the pride of North Africa.', href: '/world-cup-hub' },
  { flag: '🇦🇹', name: 'Austria',                group: 'J', fifa: 'AUT', qualified: 'Best 3rd Place',   color: '#ED2939', verdict: 'RANGNICK PRESS',  story: 'Squeezed through from Group J. Rangnick\'s high-press system is built to destroy giants.', href: '/world-cup-hub' },

  // Group K
  { flag: '🇨🇴', name: 'Colombia',               group: 'K', fifa: 'COL', qualified: 'Group K Winner',   color: '#FCD116', verdict: 'CAFE CON GARRA',  story: 'Group K winners. James Rodriguez leads a high-flying, creative coffee-growers side.', href: '/world-cup-hub' },
  { flag: '🇵🇹', name: 'Portugal',               group: 'K', fifa: 'POR', qualified: 'Group K Runner-up', color: '#E42313', verdict: 'POST-HERO ERA',   story: 'Qualified from Group K. A new dynasty arises without the patriarch. Ready to build a legacy.', href: '/world-cup-hub' },
  { flag: '🇨🇩', name: 'DR Congo',               group: 'K', fifa: 'COD', qualified: 'Best 3rd Place',   color: '#007FFF', verdict: 'LEOPARDS LOOSE',   story: 'Squeezed through from Group K. Physical, fast, and ready to unleash chaos on the bracket.', href: '/world-cup-hub' },

  // Group L
  { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',                group: 'L', fifa: 'ENG', qualified: 'Group L Winner',   color: '#CF142B', verdict: 'BOTTLE CLINIC',   story: 'Group L winners. The Three Lions are through and the choir is already singing of it coming home.', href: '/world-cup-hub' },
  { flag: '🇬🇭', name: 'Ghana',                  group: 'L', fifa: 'GHA', qualified: 'Group L Runner-up', color: '#006B3F', verdict: 'BLACK STARS RISE',  story: 'Qualified from Group L. Mohammed Kudus leads a young, electric team chasing historic glory.', href: '/world-cup-hub' },
  { flag: '🇭🇷', name: 'Croatia',                group: 'L', fifa: 'CRO', qualified: 'Best 3rd Place',   color: '#FF0000', verdict: 'VATERPOLO GRIT',   story: 'Squeezed through from Group L. The veterans of penalty shootouts refuse to die.', href: '/world-cup-hub' }
];
