#!/usr/bin/env python3
"""
generate_sofascore_map.py
Generates sofascore_map.json by correlating worldcup26.ir match IDs with SofaScore WC 2026 event IDs.
Run once from project root:
  python3 scripts/generate_sofascore_map.py > src/lib/worldcup2026/sofascore_map.json
"""

import json
import sys
import time

try:
    import tls_client
except ImportError:
    print("ERROR: tls_client not installed. Run: pip install tls-client", file=sys.stderr)
    sys.exit(1)

session = tls_client.Session(client_identifier="chrome_120", random_tls_extension_order=True)
SOFA_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://www.sofascore.com/",
}

# Team name normalization aliases (worldcup26.ir -> SofaScore names)
TEAM_ALIASES = {
    "cabo verde": "cabo verde",
    "cape verde": "cabo verde",
    "ivory coast": "côte d'ivoire",
    "cote d'ivoire": "côte d'ivoire",
    "côte d'ivoire": "côte d'ivoire",
    "south korea": "south korea",
    "korea republic": "south korea",
    "usa": "usa",
    "united states": "usa",
    "dr congo": "dr congo",
    "congo dr": "dr congo",
    "democratic republic of congo": "dr congo",
    "bosnia": "bosnia & herzegovina",
    "bosnia and herzegovina": "bosnia & herzegovina",
    "bosnia & herzegovina": "bosnia & herzegovina",
    "turkiye": "türkiye",
    "turkey": "türkiye",
    "türkiye": "türkiye",
    "czech republic": "czechia",
    "czechia": "czechia",
    "new zealand": "new zealand",
    "curacao": "curaçao",
    "curaçao": "curaçao",
}

def normalize_team(name):
    n = name.strip().lower()
    return TEAM_ALIASES.get(n, n)

def fetch_worldcup26():
    r = session.get("https://worldcup26.ir/get/games", headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
    if r.status_code != 200:
        raise RuntimeError(f"worldcup26.ir returned {r.status_code}")
    return r.json().get("games", [])

def fetch_sofascore_all():
    all_events = []
    for page in range(0, 8):
        r = session.get(f"https://api.sofascore.com/api/v1/unique-tournament/16/season/58210/events/last/{page}", headers=SOFA_HEADERS)
        if r.status_code != 200:
            break
        events = r.json().get("events", [])
        if not events:
            break
        all_events.extend(events)
        time.sleep(0.3)

    r = session.get("https://api.sofascore.com/api/v1/unique-tournament/16/season/58210/events/next/0", headers=SOFA_HEADERS)
    if r.status_code == 200:
        all_events.extend(r.json().get("events", []))
    return all_events

def main():
    print("Fetching worldcup26.ir games...", file=sys.stderr)
    wc_games = fetch_worldcup26()
    print(f"  Got {len(wc_games)} games", file=sys.stderr)

    print("Fetching SofaScore WC 2026 events...", file=sys.stderr)
    sofa_events = fetch_sofascore_all()
    print(f"  Got {len(sofa_events)} events", file=sys.stderr)

    # Build SofaScore lookup by normalized team pair
    sofa_lookup = {}
    for e in sofa_events:
        home = normalize_team(e.get("homeTeam", {}).get("name", ""))
        away = normalize_team(e.get("awayTeam", {}).get("name", ""))
        eid = e.get("id")
        ts = e.get("startTimestamp", 0)
        sofa_lookup[f"{home}|||{away}"] = {
            "eventId": eid,
            "timestamp": ts,
            "homeTeam": e.get("homeTeam", {}).get("name", ""),
            "awayTeam": e.get("awayTeam", {}).get("name", ""),
        }

    # Fetch teams from worldcup26.ir to resolve team IDs to names
    r = session.get("https://worldcup26.ir/get/teams", headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
    wc_teams = {}
    if r.status_code == 200:
        for t in r.json().get("teams", []):
            wc_teams[str(t.get("id"))] = t.get("name_en", "")

    # Build mapping
    mapping = {}
    unmatched = []

    for game in wc_games:
        match_id = str(game.get("id", ""))
        home_id = str(game.get("home_team_id", ""))
        away_id = str(game.get("away_team_id", ""))
        home_name = normalize_team(game.get("home_team_label") or wc_teams.get(home_id, "") or "")
        away_name = normalize_team(game.get("away_team_label") or wc_teams.get(away_id, "") or "")

        key = f"{home_name}|||{away_name}"
        entry = sofa_lookup.get(key)

        if not entry:
            rev_key = f"{away_name}|||{home_name}"
            entry = sofa_lookup.get(rev_key)

        if entry:
            mapping[match_id] = {
                "sofascoreEventId": entry["eventId"],
                "sofascoreTimestamp": entry["timestamp"],
                "sofascoreHome": entry["homeTeam"],
                "sofascoreAway": entry["awayTeam"],
            }
        else:
            if home_id == "0" or away_id == "0":
                mapping[match_id] = {
                    "sofascoreEventId": None,
                    "sofascoreTimestamp": None,
                    "sofascoreHome": "TBD",
                    "sofascoreAway": "TBD",
                    "pending": True,
                }
            else:
                unmatched.append({"matchId": match_id, "home": home_name, "away": away_name})

    if unmatched:
        print(f"\nWARNING: {len(unmatched)} unmatched matches:", file=sys.stderr)
        for u in unmatched:
            print(f"  match {u['matchId']}: {u['home']} vs {u['away']}", file=sys.stderr)

    print(f"\nGenerated mapping for {len(mapping)} matches.", file=sys.stderr)
    print(json.dumps(mapping, indent=2))

if __name__ == "__main__":
    main()
