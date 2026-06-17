// VAR-HALLA: Handcrafted Banter Database & Rules Engine
window.TribunalDB = {
  // 100+ Fanbase/Defendant registry
  fanbases: {
    // Ronaldo / Messi
    "ronaldo": { name: "Ronaldo Fans", category: "Football Religion", threat: "Extreme", nickname: "SIUUU Merchants" },
    "cr7": { name: "Ronaldo Fans", category: "Football Religion", threat: "Extreme", nickname: "SIUUU Merchants" },
    "cristiano": { name: "Ronaldo Fans", category: "Football Religion", threat: "Extreme", nickname: "SIUUU Merchants" },
    "alnassr": { name: "Ronaldo Fans", category: "Football Religion", threat: "Extreme", nickname: "Desert Kings" },
    "messi": { name: "Messi Fans", category: "Football Religion", threat: "Extreme", nickname: "Ankara Loyalists" },
    "leo messi": { name: "Messi Fans", category: "Football Religion", threat: "Extreme", nickname: "Ankara Loyalists" },
    "miami": { name: "Messi Fans", category: "Football Religion", threat: "Extreme", nickname: "MLS Tourists" },
    "inter miami": { name: "Messi Fans", category: "Football Religion", threat: "Extreme", nickname: "MLS Tourists" },
    "barca": { name: "Barcelona Fans", category: "Lever Pullers", threat: "Critical", nickname: "La Masia Hypers" },
    "barcelona": { name: "Barcelona Fans", category: "Lever Pullers", threat: "Critical", nickname: "La Masia Hypers" },
    "catalan": { name: "Barcelona Fans", category: "Lever Pullers", threat: "Critical", nickname: "Financial Lever Enjoyers" },
    "real madrid": { name: "Real Madrid Fans", category: "UCL Plot Armor FC", threat: "Extreme", nickname: "Galactico Snobs" },
    "madrid": { name: "Real Madrid Fans", category: "UCL Plot Armor FC", threat: "Extreme", nickname: "Galactico Snobs" },
    "madridista": { name: "Real Madrid Fans", category: "UCL Plot Armor FC", threat: "Extreme", nickname: "90+5 Min Heritage" },
    
    // English Premier League
    "england": { name: "England Fans", category: "Perpetual Optimists", threat: "Severe", nickname: "It's Coming Home Choir" },
    "english": { name: "England Fans", category: "Perpetual Optimists", threat: "Severe", nickname: "It's Coming Home Choir" },
    "southgate": { name: "England Fans", category: "Perpetual Optimists", threat: "Severe", nickname: "Vest Enjoyers" },
    "kane": { name: "Harry Kane Fans", category: "Trophy-Phobic", threat: "High", nickname: "The Curse Keepers" },
    "harry kane": { name: "Harry Kane Fans", category: "Trophy-Phobic", threat: "High", nickname: "The Curse Keepers" },
    "arsenal": { name: "Arsenal Fans", category: "Hope Merchants", threat: "Critical", nickname: "Pre-Season Champions" },
    "gunners": { name: "Arsenal Fans", category: "Hope Merchants", threat: "Critical", nickname: "Bottle-Job Experts" },
    "arteta": { name: "Arteta Disciples", category: "Lego-Hair Cult", threat: "High", nickname: "xG Calculators" },
    "saka": { name: "Saka Defenders", category: "Injury Card Users", threat: "Medium", nickname: "Limping Wingers" },
    "chelsea": { name: "Chelsea Fans", category: "Chaos Merchants", threat: "Critical", nickname: "Todd Boehly's Piggybank" },
    "blues": { name: "Chelsea Fans", category: "Chaos Merchants", threat: "Critical", nickname: "8-Year Contract Signers" },
    "boehly": { name: "Todd Boehly", category: "VC Footballing Genius", threat: "Critical", nickname: "Draft System Fan" },
    "liverpool": { name: "Liverpool Fans", category: "Aura Merchants", threat: "Severe", nickname: "Next Year Is Ours FC" },
    "anfield": { name: "Liverpool Fans", category: "Aura Merchants", threat: "Severe", nickname: "Scouse Believers" },
    "salah": { name: "Salah Fans", category: "FPL Merchants", threat: "Medium", nickname: "Egyptian Kings" },
    "man united": { name: "Manchester United Fans", category: "Nostalgia Collectors", threat: "Severe", nickname: "Stuck in 1999 FC" },
    "united": { name: "Manchester United Fans", category: "Nostalgia Collectors", threat: "Severe", nickname: "Stuck in 1999 FC" },
    "man utd": { name: "Manchester United Fans", category: "Nostalgia Collectors", threat: "Severe", nickname: "Stuck in 1999 FC" },
    "ten hag": { name: "Ten Hag Loyalists", category: "Era Enders", threat: "Severe", nickname: "Bald Fraud Enjoyers" },
    "spurs": { name: "Spurs Fans", category: "Trophy-Phobic", threat: "Severe", nickname: "Audi Cup Winners" },
    "tottenham": { name: "Spurs Fans", category: "Trophy-Phobic", threat: "Severe", nickname: "Audi Cup Winners" },
    "postecoglou": { name: "Ange Fans", category: "Mate FC", threat: "Medium", nickname: "High-Line Suicide Squad" },
    "man city": { name: "Manchester City Fans", category: "Accountants FC", threat: "Extreme", nickname: "115 Charge Defenders" },
    "city": { name: "Manchester City Fans", category: "Accountants FC", threat: "Extreme", nickname: "115 Charge Defenders" },
    "pep": { name: "Pep Guardiola", category: "Overthinkers FC", threat: "Extreme", nickname: "Bald Genius Cult" },
    "guardiola": { name: "Pep Guardiola", category: "Overthinkers FC", threat: "Extreme", nickname: "Bald Genius Cult" },
    "haaland": { name: "Haaland Fans", category: "Robot Division", threat: "High", nickname: "Tap-In Merchants" },
    "115": { name: "City Legal Department", category: "Auditors FC", threat: "Extreme", nickname: "FSR Bypassers" },
    
    // Players/Clubs/Others
    "mbappe": { name: "Mbappe Fans", category: "Drama Division", threat: "High", nickname: "PSG Contract Lawyers" },
    "psg": { name: "PSG Fans", category: "Farmer's League Champions", threat: "High", nickname: "Oil Money Pioneers" },
    "neymar": { name: "Neymar Fans", category: "Carnival Division", threat: "Medium", nickname: "Injured in March FC" },
    "bellingham": { name: "Bellingham Fans", category: "Tap-In Merchants", threat: "High", nickname: "Jude Aura Farmers" },
    "vinicius": { name: "Vinicius Fans", category: "Ballon D'or Campaigners", threat: "High", nickname: "Dribble & Complain FC" },
    "vini": { name: "Vinicius Fans", category: "Ballon D'or Campaigners", threat: "High", nickname: "Dribble & Complain FC" },
    "antony": { name: "Antony Fans", category: "Spinning Tops", threat: "Low Aura", nickname: "Fidget Spinners" },
    "mudryk": { name: "Mudryk Fans", category: "Gym Enthusiasts", threat: "Low Aura", nickname: "TikTok Athletes" },
    "rashford": { name: "Rashford Fans", category: "PR Department", threat: "Medium", nickname: "Charity Campaigners" },
    "maguire": { name: "Maguire Fans", category: "Comedy Division", threat: "Medium", nickname: "Own Goal Collectors" },
    "sterling": { name: "Sterling Fans", category: "T-Rex Runners", threat: "Low Aura", nickname: "Bench Enjoyers" },
    "lukaku": { name: "Lukaku Fans", category: "Intercept Kings", threat: "Medium", nickname: "Friendly Fire Specialists" },
    "referee": { name: "PGMOL Associates", category: "VAR Operators", threat: "Critical", nickname: "Match Ruiners" },
    "referees": { name: "PGMOL Associates", category: "VAR Operators", threat: "Critical", nickname: "Match Ruiners" },
    "refs": { name: "PGMOL Associates", category: "VAR Operators", threat: "Critical", nickname: "Match Ruiners" },
    "var": { name: "VAR Hub Stockley Park", category: "Drawing Board FC", threat: "Critical", nickname: "Line Drawers" },
    "fifa": { name: "Infantino Disciples", category: "Corruption FC", threat: "Extreme", nickname: "Format Ruiners" },
    "influencer": { name: "Football Influencers", category: "Aura Farm", threat: "Critical", nickname: "TikTok Tacticians" },
    "influencers": { name: "Football Influencers", category: "Aura Farm", threat: "Critical", nickname: "TikTok Tacticians" },
    "speed": { name: "Barking YouTubers", category: "Aura Farm", threat: "Critical", nickname: "Siuuu Screamers" },
    "ishowspeed": { name: "Barking YouTubers", category: "Aura Farm", threat: "Critical", nickname: "Siuuu Screamers" },
    "dave": { name: "Your Rival Friend Dave", category: "Casual Banterers", threat: "High", nickname: "Group Chat Terrorist" },
    "friend": { name: "Your Friend", category: "Casual Banterers", threat: "High", nickname: "Group Chat Terrorist" },
    "rival": { name: "Your Rival", category: "Casual Banterers", threat: "High", nickname: "Twitter Troll" },
    "arjun": { name: "Your Friend Arjun", category: "Casual Banterers", threat: "High", nickname: "Stat Merchant" },
    "france": { name: "France Fans", category: "Heritage Enjoyers", threat: "Severe", nickname: "Tactical Sitters" },
    "germany": { name: "Germany Fans", category: "Efficiency FC", threat: "Severe", nickname: "Group Stage Exiters" },
    "bayern": { name: "Bayern Munich Fans", category: "Bundesliga Overlords", threat: "Severe", nickname: "Trophyless Kane Hosts" },
    "italy": { name: "Italy Fans", category: "Catenaccio Division", threat: "Severe", nickname: "Euro Qualifiers Missers" },
    "spain": { name: "Spain Fans", category: "Tiki-Taka Spammers", threat: "Severe", nickname: "1000 Passes 0 Shots FC" }
  },

  // Dynamic composition lists
  charges: {
    // Keyword specific
    ronaldo: [
      "Posting 2017 Champions League highlights to win arguments",
      "Claiming Saudi Pro League is stronger than Ligue 1",
      "Using goals scored in friendlies to argue GOAT status",
      "Tweeting 'Factos' under random fan accounts"
    ],
    messi: [
      "Coping with the fact that their GOAT now plays in a retirement league",
      "Using xG (expected assists) to justify a 0-goal tournament performance",
      "Claiming World Cup rigs were actually divine scripts",
      "Defending MLS defender positioning as 'tactically complex'"
    ],
    england: [
      "Singing 'It's Coming Home' after defeating a country with a population of 40,000",
      "Claiming Gareth Southgate was a tactical genius because he wore a waistcoat",
      "Blaming the referee, the weather, and UEFA for bottling another penalty shootout",
      "Claiming English players are worth £150m based on 3 good games in the Carabao Cup"
    ],
    arsenal: [
      "Celebrating 'putting up a good fight' against Man City like it's a treble",
      "Writing a 25-tweet thread explaining how Arteta's tactical hair setup affects low blocks",
      "Claiming Saka is world class while he limps off at 2-0 down",
      "Holding a parade for finishing 2nd with 89 points"
    ],
    chelsea: [
      "Signing a 19-year-old winger on a 9-year contract with no intention of playing him",
      "Spending £1.2 billion in two windows to finish 10th and qualify for the Conference League",
      "Pretending to know the names of the 45 first-team squad players",
      "Sacking a manager because he wanted a defensive midfielder instead of a new VC investment"
    ],
    "man united": [
      "Claiming Manchester United are back after a 1-0 win against a newly promoted side",
      "Stating Antony's fidget spinner spin has hidden tactical gravity",
      "Re-watching 1999 treble highlights on VHS to escape reality",
      "Asserting Rashford's PR campaigns count as goals in the table"
    ],
    spurs: [
      "Claiming the Audi Cup counts as major European silverware",
      "Defending a 60-meter high line against fast wingers as 'Ange-ball' masterclass",
      "Checking the trophy cabinet and finding only dust and Harry Kane's old boot bag",
      "Claiming Tottenham are a big 6 club while playing in the Conference League qualifiers"
    ],
    "man city": [
      "Hiring 14 different legal teams to defend against 115 financial breaches",
      "Asserting that Haaland is a tactical genius when he touches the ball 4 times in a game",
      "Pretending they had fans before 2008",
      "Claiming Pep overthinking a Champions League final is a spiritual experience"
    ],
    barcelona: [
      "Pulling financial levers to register a 34-year-old midfielder",
      "Claiming Gavi has 'Barca DNA' because he runs around without tying his shoelaces",
      "Blaming the grass length and sunny weather for losing a match",
      "Asserting Barcelona Twitter's financial analysis is superior to Deloitte's"
    ],
    madrid: [
      "Claiming Jude Bellingham has Ballon d'Or heritage based on tap-ins",
      "Believing Real Madrid winning with 0 shots on target and 90th-minute plot armor is tactical genius",
      "Switching fanbases to whichever team Mbappe signs for",
      "Trolling other clubs while having 80% stadium renovations paid by the government"
    ],
    var: [
      "Drawing red and blue lines for 5 minutes only to make the wrong offside decision",
      "Apologizing to club managers on Monday morning for ruining their weekend",
      "Checking Stockley Park monitors for micro-fractures in a defender's boot lace"
    ],
    friend: [
      "Submitting absolute garbage takes in the WhatsApp group chat",
      "Claiming Antony is better than Saka in a public pub argument",
      "Believing their Football Manager save qualifies them for a UEFA Pro license",
      "Defending their terrible club because of one trophy they won when they were 4 years old"
    ],
    
    // General fallback charges
    general: [
      "Claiming a player is finished after one bad half in a pre-season friendly",
      "Asserting xG is more important than actual goals scored",
      "Watching football match compilations on TikTok with bass-boosted music",
      "Using FIFA ratings to decide real-world tactical debates",
      "Claiming prime Hazard was better than Neymar and Ronaldinho combined",
      "Calling every defender who tackles 'tactically limited'",
      "Saying 'football is finished' because a defensive team won 1-0",
      "Pretending to support a club they can't locate on a map",
      "Hyping up a youth academy player who will end up on loan in League Two",
      "Claiming referees are paid off when their team fails to register a shot on target"
    ]
  },

  sentences: {
    ronaldo: [
      "Sentenced to watch Al-Hilal lift trophies in front of Cristiano on repeat.",
      "Forced to write a 1,000-word essay explaining why Messi has more Ballon d'Ors.",
      "Banished to the Saudi bench while Antony takes all free-kicks."
    ],
    messi: [
      "Sentenced to defend MLS defending in a room full of Italian center-backs.",
      "Forced to watch PSG Champions League bottle jobs on repeat.",
      "Sentence: Banished to Inter Miami reserves while Gonzalo Higuain coaches your positioning."
    ],
    england: [
      "Sentenced to another 4 years of extreme tactical optimism followed by a penalty shootout defeat.",
      "Forced to listen to a 5-hour podcast hosted by Gareth Southgate on the beauty of defensive blocks.",
      "Banished to watch Sunday League matches on a rainy Tuesday in Stoke with no umbrella."
    ],
    arsenal: [
      "Sentenced to lead the Premier League for 248 days only to finish 2nd to a Pep Guardiola team.",
      "Forced to present a PowerPoint presentation on 'Expected Points' to actual trophy winners.",
      "Sentence: 5 years of watching highlights of Arsenal bottling the UCL to Bayern Munich."
    ],
    chelsea: [
      "Sentenced to memorize the names, positions, and squad numbers of all 48 Chelsea players.",
      "Forced to sign a 12-year contract as Todd Boehly's personal VC analyst with no pay.",
      "Sentence: Banished to watch Mudryk attempt 100 successful dribbles in a row."
    ],
    "man united": [
      "Sentenced to watch a 24-hour loop of Antony spinning in circles while Ten Hag explains his game plan.",
      "Forced to defend Harry Maguire's positioning in the local pub every single Saturday.",
      "Sentence: Replaced by a ChatGPT tactical bot programmed by a Liverpool fan."
    ],
    spurs: [
      "Sentenced to clean dust out of the Tottenham Hotspur Stadium trophy cabinet for eternity.",
      "Forced to watch Harry Kane lift Bundesliga trophies with Bayern Munich while you sit in 8th place.",
      "Sentence: Playing a 60-meter high line against prime Erling Haaland with no goalkeeper."
    ],
    "man city": [
      "Sentenced to hand-calculate the tax statements of 115 legal firms hired by the club.",
      "Forced to fill a stadium using only cardboard cutouts of actual fans.",
      "Sentence: Pep Guardiola overthinks your wedding ceremony, replacing the bride with a defensive midfielder."
    ],
    barcelona: [
      "Sentenced to pull financial levers for eternity just to pay Robert Lewandowski's salary.",
      "Forced to admit that Real Madrid's UCL plot armor is statistically superior to your philosophy.",
      "Sentence: Watch highlights of Liverpool 4-0 Barcelona corner-taken-quickly on loop."
    ],
    madrid: [
      "Sentenced to win a Champions League final playing defensive blocks and relying on own goals.",
      "Forced to explain why Vinicius didn't win the Ballon d'Or to a room full of angry Madrid fans.",
      "Sentence: 30 days of Mbappe demanding to play left-wing while Vinicius refuses to move."
    ],
    var: [
      "Sentenced to draw offside lines on a broken Etch-a-Sketch while Howard Webb watches.",
      "Forced to explain your decisions on live television without stuttering."
    ],
    friend: [
      "Sentenced to host all football debates from the kitchen while others cook.",
      "Forced to buy the next round of drinks after exposing yourself as a tactical fraud.",
      "Sentence: Watching Stoke City vs West Brom on a rainy Tuesday with no phone."
    ],
    
    general: [
      "Sentenced to watch highlights of Stoke City vs West Brom on a rainy Tuesday.",
      "Forced to watch Sunday League football until you learn what a tactical block actually is.",
      "Banned from accessing any tactical analysis site or database for 3 calendar years.",
      "Sentence: Banished to the MLS with zero social media access.",
      "Forced to defend this exact take on Twitter/X for the next 48 hours without deleting.",
      "Sentenced to listen to Peter Drury commentate on your daily errors in real time.",
      "Banned from typing the words 'Aura', 'Ball Knowledge', or 'Cooked' for six months.",
      "Sentenced to be the designated water boy for your friend's local Sunday League team.",
      "Forced to play FIFA with a controller that only lets you pass backwards.",
      "Sentenced to defend a park-the-bus tactic to a room full of Pep Guardiola disciples."
    ]
  },

  verdicts: [
    { text: "GUILTY OF SUPREME DELUSION", severity: "Extreme" },
    { text: "FRAUD DETECTED (BANISHMENT ORDER)", severity: "Critical" },
    { text: "ACQUITTED (PURE BALL KNOWLEDGE)", severity: "Low" },
    { text: "GENERATIONAL HATING (APPROVED)", severity: "Severe" },
    { text: "AURA BANKRUPT (IMMEDIATE JAIL)", severity: "Critical" },
    { text: "DIVINE PROPHECY / HISTORICAL COOKING", severity: "Low" }
  ],

  achievements: [
    { title: "Certified Hater", desc: "Awarded for exceptional hater energy directed at a rival fanbase.", badge: "🏆" },
    { title: "Repeat Offender", desc: "Awarded for generating consecutive takes with zero tactical depth.", badge: "⚖️" },
    { title: "Delusion Hall of Fame", desc: "Awarded to users with Delusion Levels exceeding 95%.", badge: "🔥" },
    { title: "Football Terrorist", desc: "Awarded for advocating extremely boring, defensive, or park-the-bus tactics.", badge: "💀" },
    { title: "Tactical Professor", desc: "Awarded to those who demonstrate elite spatial awareness and ball knowledge.", badge: "🧠" },
    { title: "Generational Cook", desc: "Awarded for takes that possess 90%+ pure, unadulterated ball knowledge.", badge: "👑" }
  ],

  // Cases of the day prepopulated
  casesOfDay: [
    {
      id: "5821",
      defendant: "England Fans",
      charge: "Believing 'It's Coming Home' after beating a nation of 40k people.",
      verdict: "GUILTY OF SUPREME DELUSION",
      sentence: "Another penalty shootout defeat against Italy.",
      badge: "🔥",
      achievement: "Delusion Hall of Fame"
    },
    {
      id: "5822",
      defendant: "Ronaldo Twitter",
      charge: "Posting 2017 UCL group stage highlights to settle a 2026 debate.",
      verdict: "FRAUD DETECTED (BANISHMENT)",
      sentence: "30 days of mandatory MLS highlights exposure.",
      badge: "🏆",
      achievement: "Certified Hater"
    },
    {
      id: "5823",
      defendant: "Chelsea Recruitment Team",
      charge: "Signing a 15-year-old Brazilian on a 12-year amortization schedule.",
      verdict: "AURA BANKRUPT (IMMEDIATE JAIL)",
      sentence: "Forced to balance Todd Boehly's spreadsheets.",
      badge: "💀",
      achievement: "Football Terrorist"
    },
    {
      id: "5824",
      defendant: "Arsenal Board",
      charge: "Celebrating a 2nd place finish with an xG trophy parade.",
      verdict: "GUILTY",
      sentence: "4 more years of bottling the league in April.",
      badge: "⚖️",
      achievement: "Repeat Offender"
    }
  ],

  // Random summon targets
  summonCandidates: [
    "England Fans",
    "Ronaldo Twitter",
    "Arsenal Board",
    "Chelsea Recruitment Team",
    "Referees",
    "VAR Hub Stockley Park",
    "PSG Fans",
    "Football Influencers",
    "Barcelona Board",
    "Manchester United Fan Channel",
    "Messi Fanatics",
    "Spurs Fans",
    "My Friend Dave",
    "Antony Disciples",
    "Saudi Pro League PR",
    "FIFA President Gianni Infantino"
  ],

  // Rotating placeholders for inputs
  placeholders: [
    "England Fans",
    "Messi > Ronaldo",
    "Arsenal will win the UCL",
    "Chelsea transfer strategy",
    "My friend thinks Antony is world class",
    "Haaland is a tap-in merchant",
    "Prime Suarez was better than Henry",
    "Real Madrid has plot armor"
  ]
};
