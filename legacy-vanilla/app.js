// VAR-HALLA: Core Application & Card Generator Logic
const cardBgImg = new Image();
cardBgImg.src = 'card_bg.png';

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const tickerTakes = document.getElementById("ticker-takes-count");
  const tickerRivals = document.getElementById("ticker-rivals-count");
  const tickerShame = document.getElementById("ticker-shame-count");
  
  const takeInput = document.getElementById("take-input");
  const btnSummon = document.getElementById("btn-summon");
  const trendingContainer = document.getElementById("trending-container");
  
  const btnRival = document.getElementById("btn-rival");
  const btnJudge = document.getElementById("btn-judge");
  const btnHumble = document.getElementById("btn-humble");
  
  const processingHud = document.getElementById("processing-hud");
  const loaderTitle = document.getElementById("loader-title");
  const loaderLog = document.getElementById("loader-log");
  const hudBar = document.getElementById("hud-bar");
  
  const engineSection = document.querySelector(".engine-section");
  const resultSection = document.getElementById("result-section");
  const casesSection = document.getElementById("cases-section");
  const battleHud = document.getElementById("battle-hud");
  
  // Card UI Elements
  const cardRarityFrame = document.getElementById("card-rarity-frame");
  const cardTierLabel = document.getElementById("card-tier-label");
  const cardRivalryBanner = document.getElementById("card-rivalry-banner");
  const cardFanbaseBadge = document.getElementById("card-fanbase-badge");
  const cardFanbaseName = document.getElementById("card-fanbase-name");
  const cardFanbaseCat = document.getElementById("card-fanbase-cat");
  const cardFanbaseThreat = document.getElementById("card-fanbase-threat");
  const cardCaseId = document.getElementById("card-case-id");
  const cardOvrTitle = document.getElementById("card-ovr-title");
  const cardOvrValue = document.getElementById("card-ovr-value");
  const cardAchIcon = document.getElementById("card-ach-icon");
  const cardAchTitle = document.getElementById("card-ach-title");
  const cardSubjectText = document.getElementById("card-subject-text");
  const cardVerdictTitle = document.getElementById("card-verdict-title");
  const cardSentenceText = document.getElementById("card-sentence-text");
  
  const btnDownload = document.getElementById("btn-download");
  const btnShareExpose = document.getElementById("btn-share-expose");
  const btnChallenge = document.getElementById("btn-challenge");
  const btnRetry = document.getElementById("btn-retry");
  
  const consensusYesLabel = document.getElementById("consensus-yes-label");
  const consensusYesBar = document.getElementById("consensus-yes-bar");
  const consensusNoLabel = document.getElementById("consensus-no-label");
  const consensusNoBar = document.getElementById("consensus-no-bar");
  
  // State variables
  let currentVerdictData = null;
  let activePlaceholderIndex = 0;
  let placeholderInterval = null;
  let battleInfo = null; // Store player 1's details if loaded in battle mode
  
  // Counter thresholds for social proof
  let countTakes = 147291;
  let countRivals = 18213;
  let countShame = 7812;

  // Initialize
  initCounters();
  initPlaceholderRotation();
  initTrendingTags();
  initCasesOfDay();
  parseBattleUrl();

  // Character counter
  takeInput.addEventListener("input", () => {
    document.getElementById("char-count").textContent = takeInput.value.length;
  });

  // Action Button Listeners
  btnRival.addEventListener("click", () => triggerTrial("rival"));
  btnJudge.addEventListener("click", () => triggerTrial("take"));
  btnHumble.addEventListener("click", () => triggerTrial("humble"));
  
  btnSummon.addEventListener("click", summonRandom);
  btnRetry.addEventListener("click", resetForm);
  
  btnDownload.addEventListener("click", downloadVerdictCard);
  btnChallenge.addEventListener("click", copyChallengeLink);
  btnShareExpose.addEventListener("click", triggerShare);

  // Drawer Panel toggle event listeners
  const btnToggleCases = document.getElementById("btn-toggle-cases");
  const btnToggleLeaderboard = document.getElementById("btn-toggle-leaderboard");
  const btnCloseCases = document.getElementById("btn-close-cases");
  const btnCloseLeaderboard = document.getElementById("btn-close-leaderboard");
  
  const drawerCases = document.getElementById("drawer-cases");
  const drawerLeaderboard = document.getElementById("drawer-leaderboard");

  btnToggleCases.addEventListener("click", () => {
    drawerCases.classList.remove("hidden");
  });

  btnToggleLeaderboard.addEventListener("click", () => {
    drawerLeaderboard.classList.remove("hidden");
  });

  btnCloseCases.addEventListener("click", () => {
    drawerCases.classList.add("hidden");
  });

  btnCloseLeaderboard.addEventListener("click", () => {
    drawerLeaderboard.classList.add("hidden");
  });

  /* ==========================================================================
     SOCIAL PROOF COUNTERS & TICKER
     ========================================================================== */
  
  function initCounters() {
    // Increment counters dynamically to simulate active crowd
    setInterval(() => {
      countTakes += Math.floor(Math.random() * 3) + 1;
      tickerTakes.textContent = `⚖️ ${countTakes.toLocaleString()} TAKES JUDGED TODAY`;
    }, 3200);

    setInterval(() => {
      countRivals += 1;
      tickerRivals.textContent = `🔥 ${countRivals.toLocaleString()} RIVALS EXPOSED`;
    }, 7800);

    setInterval(() => {
      countShame += 1;
      tickerShame.textContent = `💀 ${countShame.toLocaleString()} DELUSIONS INDUCTED`;
    }, 13000);
  }

  /* ==========================================================================
     PLACEHOLDER ROTATION
     ========================================================================== */

  function initPlaceholderRotation() {
    const list = window.TribunalDB.placeholders;
    takeInput.placeholder = `e.g. ${list[0]}`;
    
    placeholderInterval = setInterval(() => {
      // Only rotate if user hasn't typed anything yet
      if (takeInput.value.trim() === "") {
        activePlaceholderIndex = (activePlaceholderIndex + 1) % list.length;
        takeInput.placeholder = `e.g. ${list[activePlaceholderIndex]}`;
      }
    }, 3000);
  }

  /* ==========================================================================
     TRENDING DEFENDANTS
     ========================================================================== */

  function initTrendingTags() {
    const tags = ["England Fans", "Ronaldo Fans", "Chelsea", "Mbappe", "Arsenal", "Messi vs Ronaldo"];
    trendingContainer.innerHTML = "";
    
    tags.forEach(tag => {
      const el = document.createElement("span");
      el.className = "trend-tag";
      el.textContent = tag;
      el.addEventListener("click", () => {
        takeInput.value = tag;
        document.getElementById("char-count").textContent = tag.length;
        // Trigger auto-trial
        if (tag.includes("vs")) {
          triggerTrial("rival");
        } else if (tag === "England Fans" || tag === "Ronaldo Fans" || tag === "Chelsea") {
          triggerTrial("rival");
        } else {
          triggerTrial("take");
        }
      });
      trendingContainer.appendChild(el);
    });
  }

  /* ==========================================================================
     SUMMON RANDOM DEFENDANT
     ========================================================================== */

  function summonRandom() {
    const list = window.TribunalDB.summonCandidates;
    const rand = list[Math.floor(Math.random() * list.length)];
    takeInput.value = rand;
    document.getElementById("char-count").textContent = rand.length;
    
    // Auto-run judgment after summon
    triggerTrial("rival");
  }

  function initCasesOfDay() {
    const exposeBtns = document.querySelectorAll(".expose-btn");
    const duelBtns = document.querySelectorAll(".duel-btn");

    exposeBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const targetText = btn.getAttribute("data-text");
        const mode = btn.getAttribute("data-mode") || "rival";
        takeInput.value = targetText;
        document.getElementById("char-count").textContent = targetText.length;
        triggerTrial(mode);
      });
    });

    duelBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const targetText = btn.getAttribute("data-text");
        takeInput.value = targetText;
        document.getElementById("char-count").textContent = targetText.length;
        triggerTrial("rival");
      });
    });

    const caseCards = document.querySelectorAll(".broadcast-case-card");
    caseCards.forEach(card => {
      card.addEventListener("click", () => {
        const targetText = card.getAttribute("data-target");
        if (targetText) {
          takeInput.value = targetText;
          document.getElementById("char-count").textContent = targetText.length;
          triggerTrial("rival");
        }
      });
    });

    // Populate cases drawer dynamically
    const casesContainer = document.getElementById("cases-list-container");
    if (casesContainer) {
      casesContainer.innerHTML = "";
      window.TribunalDB.casesOfDay.forEach(c => {
        const card = document.createElement("div");
        card.className = "drawer-case-card";
        card.innerHTML = `
          <div class="drawer-case-card-header">
            <span class="drawer-case-id">CASE #${c.id}</span>
            <span class="drawer-case-tag">${c.badge} ${c.achievement.toUpperCase()}</span>
          </div>
          <h4>${c.defendant}</h4>
          <p class="drawer-case-charge">"${c.charge}"</p>
          <div class="drawer-case-sentence">Sentence: ${c.sentence}</div>
        `;
        
        card.addEventListener("click", () => {
          takeInput.value = c.defendant;
          document.getElementById("char-count").textContent = c.defendant.length;
          document.getElementById("drawer-cases").classList.add("hidden"); // close drawer
          triggerTrial("rival");
        });
        
        casesContainer.appendChild(card);
      });
    }
  }

  /* ==========================================================================
     URL BATTLE PARSER
     ========================================================================== */

  function parseBattleUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("battle") === "true") {
      battleInfo = {
        name: params.get("p1_name") || "A Rival",
        take: params.get("p1_take") || "Their Take",
        score: parseInt(params.get("p1_score")) || 80,
        verdict: params.get("p1_verdict") || "GUILTY",
        rarity: params.get("p1_rarity") || "Common",
        ach: params.get("p1_ach") || "Certified Hater"
      };

      // Show the battle banner
      document.getElementById("challenger-name").textContent = battleInfo.name;
      document.getElementById("challenger-score").textContent = battleInfo.score;
      document.getElementById("challenger-verdict").textContent = battleInfo.verdict;
      document.getElementById("challenger-take-text").textContent = battleInfo.take;
      
      battleHud.classList.remove("hidden");
    }
  }

  /* ==========================================================================
     TRIBUNAL JUDGEMENT RULES ENGINE
     ========================================================================== */

  function triggerTrial(mode) {
    const text = takeInput.value.trim();
    if (!text) {
      alert("The Court requires an input! Enter a hot take, rival, or entity.");
      return;
    }

    // Hide inputs, show HUD processing
    engineSection.classList.add("hidden");
    casesSection.classList.add("hidden");
    battleHud.classList.add("hidden");
    processingHud.classList.remove("hidden");

    // HUD step animations
    let progress = 0;
    hudBar.style.width = "0%";
    
    const logs = {
      rival: [
        { progress: 20, title: "VAR BOOTH ENGAGED...", text: "Checking fanbase registries..." },
        { progress: 50, title: "EXPOSURE SCANNER...", text: "Measuring delusion coefficients..." },
        { progress: 80, title: "TRIBUNAL VERDICT PENDING...", text: "Reviewing Stockley Park files..." }
      ],
      take: [
        { progress: 20, title: "DRAWING VAR LINES...", text: "Locating point of ball knowledge..." },
        { progress: 50, title: "COMPUTING COPIUM...", text: "Scanning tactical graphs..." },
        { progress: 80, title: "JUDGE CONSULTATION...", text: "Determining sentence severity..." }
      ],
      humble: [
        { progress: 20, title: "BOTTLING METRIC LOAD...", text: "Checking historical bottle profiles..." },
        { progress: 50, title: "HUMBLING PROBABILITY...", text: "Calculating future embarrassment risk..." },
        { progress: 80, title: "PROPHET REVELATION...", text: "Stitching prophecy fragments..." }
      ]
    };

    const steps = logs[mode];
    
    // Simulate progressive loading bar
    const interval = setInterval(() => {
      progress += 5;
      hudBar.style.width = `${progress}%`;

      const currentStep = steps.find(s => progress >= s.progress && progress < s.progress + 15);
      if (currentStep) {
        loaderTitle.textContent = currentStep.title;
        loaderLog.textContent = currentStep.text;
      }

      if (progress >= 100) {
        clearInterval(interval);
        renderVerdict(text, mode);
      }
    }, 80);
  }

  function renderVerdict(text, mode) {
    processingHud.classList.add("hidden");
    resultSection.classList.remove("hidden");
    document.getElementById("welcome-overlay").classList.add("hidden");

    // Hidden local analytics for Top Defendants Entered
    try {
      const dbStats = JSON.parse(localStorage.getItem("varhalla_analytics_defendants") || "{}");
      const cleanTarget = text.trim().substring(0, 30);
      dbStats[cleanTarget] = (dbStats[cleanTarget] || 0) + 1;
      localStorage.setItem("varhalla_analytics_defendants", JSON.stringify(dbStats));
      console.log(`[VAR-HALLA Analytics] Event: Verdict Generated | Target: "${cleanTarget}" | Count: ${dbStats[cleanTarget]}`);
      console.log("Check all targets typed by running: console.table(JSON.parse(localStorage.getItem('varhalla_analytics_defendants')))");
    } catch(e) {
      console.error("Local analytics error: ", e);
    }

    // Parse the input text for fanbase detection
    const normalizedText = text.toLowerCase();
    let fanbaseMatch = null;
    let isRivalry = false;

    // Check classic rivalries first
    const rivalries = [
      { keys: ["messi", "ronaldo"], label: "Messi vs Ronaldo" },
      { keys: ["cr7", "leo messi"], label: "Messi vs Ronaldo" },
      { keys: ["arsenal", "spurs"], label: "Arsenal vs Spurs" },
      { keys: ["tottenham", "gunners"], label: "Arsenal vs Spurs" },
      { keys: ["barca", "real madrid"], label: "El Clasico" },
      { keys: ["barcelona", "madrid"], label: "El Clasico" },
      { keys: ["liverpool", "united"], label: "Liverpool vs Man United" },
      { keys: ["united", "city"], label: "Manchester Derby" },
      { keys: ["england", "germany"], label: "England vs Germany" }
    ];

    for (const rival of rivalries) {
      if (rival.keys.every(k => normalizedText.includes(k))) {
        isRivalry = true;
        fanbaseMatch = { name: rival.label, category: "Civil War", threat: "Maximum", nickname: "Ancient Rivalry" };
        break;
      }
    }

    // Check standard fanbase dictionary if no rivalry matches
    if (!fanbaseMatch) {
      for (const key in window.TribunalDB.fanbases) {
        if (normalizedText.includes(key)) {
          fanbaseMatch = window.TribunalDB.fanbases[key];
          break;
        }
      }
    }

    // Determine Rarity Tier
    // (Common, Rare Delusion, Generational Hating, Historically Correct)
    const roll = Math.random();
    let rarity = "COMMON";
    if (isRivalry) {
      rarity = roll > 0.4 ? "GENERATIONAL HATING" : "RARE DELUSION";
    } else if (normalizedText.includes("hate") || normalizedText.includes("trash") || normalizedText.includes("finished")) {
      rarity = roll > 0.6 ? "GENERATIONAL HATING" : "COMMON";
    } else {
      if (roll > 0.9) rarity = "HISTORICALLY CORRECT";
      else if (roll > 0.75) rarity = "GENERATIONAL HATING";
      else if (roll > 0.55) rarity = "RARE DELUSION";
      else rarity = "COMMON";
    }

    // Compute dynamic, meme-worthy stats
    let ballKnowledge, copium, bottlePotential, varVictim, auraInflation, variableStat;
    
    // Seed stats logic to make them look authentic
    if (rarity === "HISTORICALLY CORRECT") {
      ballKnowledge = Math.floor(Math.random() * 10) + 90; // 90-99
      copium = Math.floor(Math.random() * 20);
      bottlePotential = Math.floor(Math.random() * 30);
      varVictim = Math.floor(Math.random() * 40);
      auraInflation = Math.floor(Math.random() * 15) + 80;
    } else if (rarity === "RARE DELUSION") {
      ballKnowledge = Math.floor(Math.random() * 25); // 0-25
      copium = Math.floor(Math.random() * 15) + 85; // 85-99
      bottlePotential = Math.floor(Math.random() * 15) + 85;
      varVictim = Math.floor(Math.random() * 20) + 70;
      auraInflation = Math.floor(Math.random() * 15) + 80;
    } else {
      // Common / Hating
      ballKnowledge = Math.floor(Math.random() * 50) + 20;
      copium = Math.floor(Math.random() * 60) + 30;
      bottlePotential = Math.floor(Math.random() * 50) + 40;
      varVictim = Math.floor(Math.random() * 70) + 20;
      auraInflation = Math.floor(Math.random() * 50) + 40;
    }

    // Specific player bias overrides
    if (normalizedText.includes("antony")) {
      ballKnowledge = 1;
      auraInflation = 99;
      copium = 99;
    }
    if (normalizedText.includes("115") || normalizedText.includes("city")) {
      varVictim = 99;
    }
    if (normalizedText.includes("kane")) {
      bottlePotential = 99;
    }

    // Handle variable stat (Humbling probability or Rival trigger score)
    let triggerScore = Math.floor(Math.random() * 50) + 45;
    if (isRivalry) triggerScore = 99;
    variableStat = triggerScore;

    // Stitch together modular Sentence components
    let charge = "";
    let sentence = "";
    
    const db = window.TribunalDB;
    
    // 1. Resolve Charge
    let chargeKey = "general";
    if (fanbaseMatch) {
      // Find key matching in lowercase
      for (const key in db.charges) {
        if (fanbaseMatch.name.toLowerCase().includes(key)) {
          chargeKey = key;
          break;
        }
      }
    }
    const chargeList = db.charges[chargeKey] || db.charges.general;
    charge = chargeList[Math.floor(Math.random() * chargeList.length)];

    // 2. Resolve Sentence
    let sentenceKey = "general";
    if (fanbaseMatch) {
      for (const key in db.sentences) {
        if (fanbaseMatch.name.toLowerCase().includes(key)) {
          sentenceKey = key;
          break;
        }
      }
    }
    const sentenceList = db.sentences[sentenceKey] || db.sentences.general;
    sentence = sentenceList[Math.floor(Math.random() * sentenceList.length)];

    // Adjust specific strings for different modes
    let verdictText = "";
    let ovrScore = 50;

    if (mode === "humble") {
      verdictText = "PREDICTION: HIGH HUMBLING RISK";
      ovrScore = bottlePotential; // OVR is their bottling risk
      sentence = `Humbling Probability: ${ovrScore}%. Sentence: Prepare the apology notes. The bottling process is scheduled.`;
    } else if (mode === "rival") {
      verdictText = "SENTENCED TO SHAME";
      ovrScore = Math.floor((copium + varVictim + auraInflation) / 3);
    } else {
      verdictText = ballKnowledge > 70 ? "ACQUITTED (COOKING ALLOWED)" : "GUILTY OF DELUSION";
      ovrScore = ballKnowledge;
    }

    // Resolve Achievement badge
    let ach = db.achievements[0]; // default Certified Hater
    if (ballKnowledge > 80 && rarity === "HISTORICALLY CORRECT") {
      ach = db.achievements.find(a => a.title === "Generational Cook") || db.achievements[5];
    } else if (ballKnowledge > 70) {
      ach = db.achievements.find(a => a.title === "Tactical Professor") || db.achievements[4];
    } else if (copium > 90) {
      ach = db.achievements.find(a => a.title === "Delusion Hall of Fame") || db.achievements[2];
    } else if (bottlePotential > 90) {
      ach = db.achievements.find(a => a.title === "Football Terrorist") || db.achievements[3];
    } else if (mode === "rival") {
      ach = db.achievements.find(a => a.title === "Certified Hater") || db.achievements[0];
    } else {
      ach = db.achievements.find(a => a.title === "Repeat Offender") || db.achievements[1];
    }

    // Set global data object for canvas printing
    currentVerdictData = {
      text: text,
      mode: mode,
      caseId: Math.floor(Math.random() * 9000) + 1000,
      fanbase: fanbaseMatch,
      isRivalry: isRivalry,
      rarity: rarity,
      ovr: ovrScore,
      verdict: verdictText,
      charge: charge,
      sentence: sentence,
      ach: ach,
      stats: [
        { label: "BAL", name: "Ball Knowledge", val: ballKnowledge },
        { label: "COP", name: "Copium Level", val: copium },
        { label: "BOT", name: "Bottle Potential", val: bottlePotential },
        { label: "VAR", name: "VAR Victim Complex", val: varVictim },
        { label: "AUR", name: "Aura Inflation", val: auraInflation },
        { label: mode === "humble" ? "HUM" : "TRIG", name: mode === "humble" ? "Humbling Risk" : "Rival Trigger", val: variableStat }
      ]
    };

    // Update Card UI
    updateCardUI();
  }

  function updateCardUI() {
    const data = currentVerdictData;
    
    // Apply Rarity Frame classes
    cardRarityFrame.className = "fut-card";
    if (data.isRivalry) {
      cardRarityFrame.classList.add("card-rivalry");
      cardRivalryBanner.classList.remove("hidden");
    } else {
      cardRivalryBanner.classList.add("hidden");
      if (data.rarity === "RARE DELUSION") cardRarityFrame.classList.add("card-rare");
      else if (data.rarity === "GENERATIONAL HATING") cardRarityFrame.classList.add("card-hating");
      else if (data.rarity === "HISTORICALLY CORRECT") cardRarityFrame.classList.add("card-cooking");
      else cardRarityFrame.classList.add("card-common");
    }

    cardTierLabel.textContent = data.isRivalry ? "RIVAL BATTLE VERDICT" : `${data.rarity} VERDICT`;

    // Fanbase Flag
    if (data.fanbase) {
      cardFanbaseBadge.classList.remove("hidden");
      cardFanbaseName.textContent = data.fanbase.name;
      cardFanbaseCat.textContent = data.fanbase.category;
      cardFanbaseThreat.textContent = data.fanbase.threat;
    } else {
      cardFanbaseBadge.classList.add("hidden");
    }

    // Case and OVR
    cardCaseId.textContent = `#${data.caseId}`;
    
    if (data.mode === "humble") {
      cardOvrTitle.textContent = "BOTTLE %";
    } else if (data.mode === "rival") {
      cardOvrTitle.textContent = "SHAME OVR";
    } else {
      cardOvrTitle.textContent = "BALL OVR";
    }
    cardOvrValue.textContent = data.ovr;

    // Achievements
    cardAchIcon.textContent = data.ach.badge;
    cardAchTitle.textContent = data.ach.title;

    // Content text
    cardSubjectText.textContent = data.text;
    cardVerdictTitle.textContent = `TRIBUNAL VERDICT: ${data.verdict}`;
    cardSentenceText.textContent = data.sentence;

    // Stats Grid
    data.stats.forEach((st, idx) => {
      const i = idx + 1;
      document.getElementById(`stat-label-${i}`).textContent = st.label;
      document.getElementById(`stat-fill-${i}`).style.width = `${st.val}%`;
      document.getElementById(`stat-val-${i}`).textContent = st.val;
    });

    // Humbling vs Rival trigger rename
    if (data.mode === "humble") {
      document.getElementById("stat-desc-6").textContent = "Humbling Risk";
    } else {
      document.getElementById("stat-desc-6").textContent = "Rival Trigger Score";
    }

    // Update action buttons labels for conversion
    let exposeTarget = "THIS TAKE";
    if (data.fanbase) {
      exposeTarget = data.fanbase.name.toUpperCase();
    } else if (data.text.length < 15) {
      exposeTarget = data.text.toUpperCase();
    }
    btnShareExpose.textContent = `🔥 SHARE TO EXPOSE ${exposeTarget}`;

    // Tribunal Consensus dynamic splits
    let yesPct = 50;
    let yesLabel = "Let Him Cook";
    let noLabel = "Lifetime Football Ban";

    if (data.mode === "humble") {
      yesPct = data.ovr;
      yesLabel = `${yesPct}% Guarantee Bottle`;
      noLabel = `${100 - yesPct}% Trophy Believer`;
    } else if (data.mode === "rival") {
      yesPct = Math.max(30, Math.min(95, data.ovr + 10));
      yesLabel = `${yesPct}% Fully Exposed`;
      noLabel = `${100 - yesPct}% Delusional Defense`;
    } else {
      // Take mode
      yesPct = data.ovr > 60 ? data.ovr : 100 - data.ovr;
      if (data.ovr > 60) {
        yesLabel = `${yesPct}% Pure Cooking`;
        noLabel = `${100 - yesPct}% Cry Harder`;
      } else {
        yesLabel = `${yesPct}% Send to Sunday League`;
        noLabel = `${100 - yesPct}% Let him cook`;
      }
    }

    consensusYesBar.style.width = `${yesPct}%`;
    consensusYesLabel.textContent = yesLabel;
    consensusNoBar.style.width = `${100 - yesPct}%`;
    consensusNoLabel.textContent = noLabel;

    // Check if Battle Mode was active, then modify comparison
    if (battleInfo) {
      // Adjust stats or output a combined HUD warning winner
      const battleWinner = data.ovr > battleInfo.score ? "You" : battleInfo.name;
      alert(`⚔️ BANTER DUEL COMPARISON:\n\n${battleInfo.name}: OVR ${battleInfo.score}\nYou: OVR ${data.ovr}\n\nWINNER: ${battleWinner}!`);
    }
  }

  function resetForm() {
    takeInput.value = "";
    document.getElementById("char-count").textContent = 0;
    resultSection.classList.add("hidden");
    engineSection.classList.remove("hidden");
    casesSection.classList.remove("hidden");
    document.getElementById("welcome-overlay").classList.remove("hidden");
    
    // If challenge was loaded, hide battle banner on retry
    battleHud.classList.add("hidden");
    battleInfo = null;
    
    // Clear URL parameters without page reload
    window.history.pushState({}, document.title, window.location.pathname);
  }

  /* ==========================================================================
     CANVAS EXPORTER (THE SHARE SCREENSHOT IMAGE)
     ========================================================================== */

  function downloadVerdictCard() {
    if (!currentVerdictData) return;
    
    const data = currentVerdictData;
    const canvas = document.getElementById("export-canvas");
    const ctx = canvas.getContext("2d");

    // Set card size optimized for sharing (800 x 1080)
    canvas.width = 800;
    canvas.height = 1080;

    // 1. Draw turf green radial background
    const bgGrad = ctx.createRadialGradient(400, 540, 50, 400, 540, 600);
    bgGrad.addColorStop(0, "#194a1d");
    bgGrad.addColorStop(1, "#050e06");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1080);

    // 2. Draw white pitch border outline (stadium line visual)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 740, 1020);

    // 3. Draw card outer frame border with Rarity color
    let borderGrad = ctx.createLinearGradient(0, 0, 0, 1080);
    if (data.isRivalry) {
      // Dual split gradient
      borderGrad = ctx.createLinearGradient(0, 0, 800, 0);
      borderGrad.addColorStop(0, "#00f3ff");
      borderGrad.addColorStop(0.5, "#00f3ff");
      borderGrad.addColorStop(0.5, "#ff3b30");
      borderGrad.addColorStop(1, "#ff3b30");
    } else if (data.rarity === "RARE DELUSION") {
      borderGrad.addColorStop(0, "#00f3ff");
      borderGrad.addColorStop(1, "#ffb800");
    } else if (data.rarity === "GENERATIONAL HATING") {
      borderGrad.addColorStop(0, "#ff3b30");
      borderGrad.addColorStop(1, "#a020f0");
    } else if (data.rarity === "HISTORICALLY CORRECT") {
      borderGrad.addColorStop(0, "#ffb800");
      borderGrad.addColorStop(1, "#ff6b00");
    } else {
      borderGrad.addColorStop(0, "#2d3748");
      borderGrad.addColorStop(1, "#1a202c");
    }

    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, 784, 1064);

    // 4. Header Logo
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 24px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚖️ VAR-HALLA | COURT BRIEF", 400, 60);

    // 5. Rarity Title
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "700 14px Orbitron, sans-serif";
    ctx.fillText(data.isRivalry ? "RIVAL BATTLE VERDICT" : `${data.rarity} VERDICT`, 400, 95);

    // Draw card background inner box using card_bg.png texture
    try {
      ctx.drawImage(cardBgImg, 40, 130, 720, 890);
      ctx.fillStyle = "rgba(10, 18, 12, 0.65)"; // semi-transparent overlay
      ctx.fillRect(40, 130, 720, 890);
    } catch(e) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(40, 130, 720, 890);
    }
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 130, 720, 890);

    // 6. Fanbase detected badge (draw box if present)
    if (data.fanbase) {
      ctx.fillStyle = "rgba(0, 243, 255, 0.05)";
      ctx.fillRect(60, 150, 680, 70);
      ctx.strokeStyle = "rgba(0, 243, 255, 0.2)";
      ctx.strokeRect(60, 150, 680, 70);

      ctx.textAlign = "left";
      ctx.fillStyle = "#00f3ff";
      ctx.font = "900 16px Orbitron, sans-serif";
      ctx.fillText(`FANBASE DETECTED: ${data.fanbase.name.toUpperCase()}`, 80, 178);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "500 14px 'Space Grotesk', sans-serif";
      ctx.fillText(`Category: ${data.fanbase.category}  |  Threat Level: ${data.fanbase.threat}`, 80, 203);
    }

    // 7. Case stamp & OVR Rating box
    const startY = data.fanbase ? 245 : 155;

    // Case No
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "700 12px 'Space Grotesk', sans-serif";
    ctx.fillText("CASE NO.", 70, startY + 20);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 24px Orbitron, sans-serif";
    ctx.fillText(`#${data.caseId}`, 70, startY + 50);

    // OVR Rating
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "700 11px Orbitron, sans-serif";
    ctx.fillText(data.mode === "humble" ? "BOTTLE %" : "SHAME OVR", 400, startY + 15);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 70px Orbitron, sans-serif";
    ctx.fillText(data.ovr, 400, startY + 80);

    // Achievement Stamp
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "34px 'Space Grotesk', sans-serif";
    ctx.fillText(data.ach.badge, 730, startY + 30);
    ctx.fillStyle = "#ffb800";
    ctx.font = "900 14px Orbitron, sans-serif";
    ctx.fillText(data.ach.title.toUpperCase(), 730, startY + 52);

    // 8. Hot take quote section
    const quoteY = startY + 110;
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(60, quoteY, 680, 120);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.strokeRect(60, quoteY, 680, 120);

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(0, 243, 255, 0.2)";
    ctx.font = "900 80px Orbitron, sans-serif";
    ctx.fillText("“", 80, quoteY + 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 500 22px 'Space Grotesk', sans-serif";
    
    // Wrap take text manually
    wrapText(ctx, `"${data.text}"`, 140, quoteY + 45, 560, 32);

    // 9. Official sentence box
    const sentenceY = quoteY + 140;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(60, sentenceY, 680, 130);
    ctx.fillStyle = "#ff3b30";
    ctx.fillRect(60, sentenceY, 8, 130); // warning bar left

    ctx.fillStyle = "#ff3b30";
    ctx.font = "900 16px Orbitron, sans-serif";
    ctx.fillText(`TRIBUNAL VERDICT: ${data.verdict.toUpperCase()}`, 90, sentenceY + 35);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "500 17px 'Space Grotesk', sans-serif";
    wrapText(ctx, data.sentence, 90, sentenceY + 70, 620, 26);

    // 10. Draw Stats Matrix
    const statsY = sentenceY + 175;
    ctx.font = "900 15px Orbitron, sans-serif";
    ctx.fillStyle = "#00f3ff";
    ctx.fillText("TRIBUNAL METRICS", 60, statsY);

    data.stats.forEach((st, idx) => {
      const y = statsY + 30 + (idx * 40);

      // Label (BAL)
      ctx.fillStyle = "#00f3ff";
      ctx.font = "900 16px Orbitron, sans-serif";
      ctx.fillText(st.label, 60, y + 15);

      // Full Name
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "500 15px 'Space Grotesk', sans-serif";
      ctx.fillText(st.name, 120, y + 15);

      // Bar Background
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(320, y + 4, 360, 12);

      // Bar Fill
      ctx.fillStyle = "#00f3ff";
      ctx.fillRect(320, y + 4, 360 * (st.val / 100), 12);

      // Value
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 16px Orbitron, sans-serif";
      ctx.fillText(st.val, 705, y + 15);
    });

    // 11. Watermark Footer
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.font = "700 12px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚖️ GENERATED BY VAR-HALLA.NET", 400, 1045);

    // Trigger download
    const link = document.createElement("a");
    link.download = `var-halla_case_${data.caseId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  // Canvas text wrapping helper
  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, currentY);
  }

  /* ==========================================================================
     SHARE BATTLE & LINK GENERATOR
     ========================================================================== */

  function copyChallengeLink() {
    if (!currentVerdictData) return;
    const data = currentVerdictData;
    
    // Build query variables representing player 1
    const p = new URLSearchParams();
    p.set("battle", "true");
    p.set("p1_name", data.fanbase ? data.fanbase.name : "A Rival");
    p.set("p1_take", data.text);
    p.set("p1_score", data.ovr);
    p.set("p1_verdict", data.verdict);
    p.set("p1_rarity", data.rarity);
    p.set("p1_ach", data.ach.title);

    const shareUrl = `${window.location.origin}${window.location.pathname}?${p.toString()}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert("⚔️ BANTER DUEL LINK COPIED!\n\nSend this link to your rival on WhatsApp or Twitter. When they open it, their score will be compared side-by-side against yours!");
      })
      .catch(err => {
        console.error("Clipboard copy failed: ", err);
        // Fallback alert
        prompt("Copy this link and send to a friend:", shareUrl);
      });
  }

  function triggerShare() {
    if (!currentVerdictData) return;
    const data = currentVerdictData;
    
    // Share intent
    const text = `⚖️ VAR-HALLA Verdict for ${data.text}:\n\nVerdict: ${data.verdict}\nOVR: ${data.ovr}\nSentence: ${data.sentence}\n\nExpose your own football takes here:`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: "VAR-HALLA Verdict",
        text: text,
        url: shareUrl
      }).catch(console.error);
    } else {
      // Fallback: Open X/Twitter intent
      const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(xUrl, "_blank");
    }
  }
});
