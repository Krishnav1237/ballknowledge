# ⚖️ VAR-HALLA: Football's Highest Court

VAR-HALLA is a high-conversion, lightweight screenshot-generating web application optimized for football-Twitter viral share loops. It manufactures football controversy, rivalries, and banter by judging takes, sentencing fans, and computing tournament bottling probabilities.

---

## 🚀 Key Features

1. **Three Banter Funnels**:
   - **🔥 Put a Rival on Trial**: Exposes fanbases or friends with custom sentences.
   - **⚖️ Judge My Take**: Tests the user's opinion for legitimacy.
   - **🚨 Predict the Humbling**: Calculates the bottling probability of a player or team.
2. **Fanbase Detection**: Automatically scans inputs for 100+ key football entities, appending custom categories, threat levels, and custom banter profiles.
3. **Classic Rivalry Mode**: Auto-detects classic matchups (e.g. Messi vs Ronaldo, Arsenal vs Spurs) to trigger a dual neon-border split card styling with higher legendary rarity drops.
4. **Serverless WhatsApp Share Battles**: Copies a link with Player 1's results embedded in URL query parameters. When Player 2 opens the link, the UI automatically loads a comparison battle declaring a winner.
5. **High-Res Canvas Exporter**: Draws the card elements, statistics, and quote wraps to output a pixel-perfect `PNG` card file sized precisely for Instagram Stories, X posts, and WhatsApp statuses.
6. **"Cases of the Day" & "Trending Defendants"**: rotating landing boards that instantly teach the system's tone and let users run pre-filled trials in a single tap.

---

## 🛠 Tech Stack

- **Core**: Semantic HTML5 and Vanilla JS.
- **Styling**: Vanilla CSS (Spotlight radial gradients, concrete backdrop overlays, and top-layer transitions).
- **Dependencies**: Zero external dependencies (custom HTML5 Canvas rendering for high performance and page load under 150KB).

---

## 💻 Running the Application

Start the local static server:
```bash
npm run dev
```
Once active, navigate to:
👉 **[http://127.0.0.1:3000](http://127.0.0.1:3000)**

---

## 📊 Local Console Analytics

To discover what subjects users are searching for most during testing:
1. Open your browser's Developer Tools Console (`F12` or `Cmd + Option + I`).
2. Run:
   ```javascript
   console.table(JSON.parse(localStorage.getItem('varhalla_analytics_defendants')))
   ```
3. This prints a tabulated leaderboard of all submitted defendants, helping you formulate your distribution content roadmaps.
