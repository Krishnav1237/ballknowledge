#!/usr/bin/env python3
"""
sofascore_scraper.py
Live match data fetcher using SofaScore's internal API via tls-client.
Bypasses Cloudflare WAF using browser TLS fingerprint spoofing.

Usage:
  python3 src/lib/sofascore_scraper.py fetch <eventId>
  python3 src/lib/sofascore_scraper.py live
  python3 src/lib/sofascore_scraper.py batch <eventId1> [eventId2] ...

Output: JSON to stdout (errors to stderr)
"""

import sys
import json
import time

try:
    import tls_client
except ImportError:
    print(json.dumps({"error": "tls_client not installed. Run: pip install tls-client"}))
    sys.exit(1)

SESSION = tls_client.Session(client_identifier="chrome_120", random_tls_extension_order=True)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.sofascore.com/",
    "Origin": "https://www.sofascore.com",
    "Cache-Control": "no-cache",
}
BASE = "https://api.sofascore.com/api/v1"

def get(path, retries=2):
    """Fetch a SofaScore API path, returning parsed JSON or raising on failure."""
    url = f"{BASE}{path}"
    for attempt in range(retries + 1):
        try:
            r = SESSION.get(url, headers=HEADERS)
            if r.status_code == 200:
                return r.json()
            if r.status_code == 404:
                return None  # Not found, not an error
            if attempt < retries:
                time.sleep(0.5 * (attempt + 1))
        except Exception as e:
            if attempt == retries:
                raise
            time.sleep(0.5)
    return None

def normalize_name(name):
    """Lowercase + strip for fuzzy matching."""
    return name.strip().lower() if name else ""

def parse_event(event_data):
    """Parse a SofaScore event object into our canonical format."""
    if not event_data:
        return None
    e = event_data.get("event", event_data)  # Support both wrapped and unwrapped

    status_obj = e.get("status", {})
    status_desc = status_obj.get("description", "")
    status_code = status_obj.get("code", 0)
    # SofaScore status codes: 0=not started, 6=in progress 1st, 7=halftime, 8=in progress 2nd, 100=ended
    is_live = status_code in (6, 7, 8, 9, 10, 11, 12, 13)
    is_finished = status_code in (100, 110, 120) or status_desc.lower() in ("ended", "finished", "ap", "aet")

    home_score_obj = e.get("homeScore", {})
    away_score_obj = e.get("awayScore", {})
    home_score = home_score_obj.get("current", home_score_obj.get("display", 0)) or 0
    away_score = away_score_obj.get("current", away_score_obj.get("display", 0)) or 0

    # Elapsed time
    time_elapsed = None
    if is_finished:
        time_elapsed = "finished"
    elif is_live:
        time_elapsed = str(e.get("time", {}).get("played", "LIVE")) + "'"
    else:
        time_elapsed = "notstarted"

    return {
        "eventId": e.get("id"),
        "homeTeam": e.get("homeTeam", {}).get("name", ""),
        "awayTeam": e.get("awayTeam", {}).get("name", ""),
        "homeScore": int(home_score),
        "awayScore": int(away_score),
        "status": status_desc,
        "isLive": is_live,
        "isFinished": is_finished,
        "timeElapsed": time_elapsed,
        "startTimestamp": e.get("startTimestamp"),
    }

def fetch_incidents(event_id):
    """Fetch goal incidents for an event. Returns list of {player, minute, isHome, isPenalty}."""
    data = get(f"/event/{event_id}/incidents")
    if not data:
        return []

    goals = []
    for inc in data.get("incidents", []):
        if inc.get("incidentType") != "goal":
            continue
        player_obj = inc.get("player", {})
        assist_obj = inc.get("assist1", {})
        goals.append({
            "player": player_obj.get("name", ""),
            "playerId": player_obj.get("id"),
            "minute": inc.get("time", 90),
            "isHome": inc.get("isHome", False),
            "isPenalty": inc.get("incidentClass") == "penalty",
            "isOwnGoal": inc.get("incidentClass") == "ownGoal",
            "assist": assist_obj.get("name", "") if assist_obj else "",
        })

    # Sort by minute
    goals.sort(key=lambda g: g["minute"])
    return goals

def fetch_lineups(event_id):
    """Fetch player lineups and match ratings. Returns {home: [...], away: [...]}."""
    data = get(f"/event/{event_id}/lineups")
    if not data:
        return {"home": [], "away": [], "confirmed": False}

    def parse_team(team_data):
        if not team_data:
            return []
        players = []
        for pw in team_data.get("players", []):
            p = pw.get("player", {})
            stats = pw.get("statistics", {})
            position = pw.get("position") or p.get("position", "")
            # Map SofaScore position to our system
            pos_map = {"G": "GK", "D": "DEF", "M": "MID", "F": "FWD"}
            position = pos_map.get(position, position)
            players.append({
                "id": p.get("id"),
                "name": p.get("name", ""),
                "shortName": p.get("shortName", ""),
                "position": position,
                "jerseyNumber": pw.get("jerseyNumber") or p.get("jerseyNumber"),
                "rating": stats.get("rating"),  # None if not played yet
                "minutesPlayed": stats.get("minutesPlayed"),
                "goals": stats.get("goals", 0),
                "assists": stats.get("goalAssist", 0),
                "isSubstitute": pw.get("substitute", False),
            })
        return players

    return {
        "home": parse_team(data.get("home")),
        "away": parse_team(data.get("away")),
        "confirmed": data.get("confirmed", False),
    }

def fetch_full_match(event_id):
    """
    Fetch complete match data: event header + incidents + lineups.
    Returns a unified JSON payload for caching.
    """
    event_id = int(event_id)

    # Fetch event header
    event_data = get(f"/event/{event_id}")
    if not event_data:
        return {"error": f"Event {event_id} not found on SofaScore"}

    parsed = parse_event(event_data)
    if not parsed:
        return {"error": "Failed to parse event data"}

    # Fetch incidents (goals)
    goals = fetch_incidents(event_id)

    # Build scorer strings from goals
    home_scorers = [g for g in goals if g["isHome"]]
    away_scorers = [g for g in goals if not g["isHome"]]

    first_goalscorer = goals[0]["player"] if goals else "None"

    # Determine MOTM: most goals, then earliest scorer, then check lineups
    motm = "None"
    if goals:
        goal_counts = {}
        first_goal_time = {}
        for g in goals:
            pname = g["player"]
            goal_counts[pname] = goal_counts.get(pname, 0) + 1
            if pname not in first_goal_time:
                first_goal_time[pname] = g["minute"]
        motm = max(goal_counts, key=lambda p: (goal_counts[p], -first_goal_time[p]))

    # Fetch lineups (may not be available for future matches)
    lineups = {}
    if parsed["isFinished"] or parsed["isLive"]:
        lineups = fetch_lineups(event_id)

    # Build player ratings map: normalized_name -> rating
    ratings_map = {}
    for player in lineups.get("home", []) + lineups.get("away", []):
        if player.get("rating") is not None:
            norm = normalize_name(player["name"])
            ratings_map[norm] = round(float(player["rating"]), 1)

    return {
        "eventId": event_id,
        "homeTeam": parsed["homeTeam"],
        "awayTeam": parsed["awayTeam"],
        "homeScore": parsed["homeScore"],
        "awayScore": parsed["awayScore"],
        "status": parsed["status"],
        "isLive": parsed["isLive"],
        "isFinished": parsed["isFinished"],
        "timeElapsed": parsed["timeElapsed"],
        "startTimestamp": parsed["startTimestamp"],
        "firstGoalscorer": first_goalscorer,
        "motm": motm,
        "homeGoals": home_scorers,
        "awayGoals": away_scorers,
        "lineups": lineups,
        "ratingsMap": ratings_map,
        "fetchedAt": int(time.time()),
    }

def fetch_live_wc_matches():
    """Fetch all currently live WC 2026 matches from SofaScore."""
    # Check live events filtered to WC 2026 (uniqueTournament id=16)
    data = get("/sport/football/events/live")
    if not data:
        return []
    events = data.get("events", [])
    wc_live = [
        e for e in events
        if e.get("tournament", {}).get("uniqueTournament", {}).get("id") == 16
    ]
    return [parse_event(e) for e in wc_live]

def cmd_fetch(args):
    if not args:
        print(json.dumps({"error": "Usage: fetch <eventId>"}))
        sys.exit(1)
    event_id = args[0]
    result = fetch_full_match(event_id)
    print(json.dumps(result))

def cmd_live(args):
    matches = fetch_live_wc_matches()
    print(json.dumps({"liveMatches": matches, "fetchedAt": int(time.time())}))

def cmd_batch(args):
    if not args:
        print(json.dumps({"error": "Usage: batch <eventId1> [eventId2] ..."}))
        sys.exit(1)
    results = {}
    for eid in args:
        try:
            results[str(eid)] = fetch_full_match(eid)
        except Exception as e:
            results[str(eid)] = {"error": str(e)}
        time.sleep(0.4)  # Rate limit
    print(json.dumps(results))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: sofascore_scraper.py <fetch|live|batch> [args...]"}))
        sys.exit(1)

    cmd = sys.argv[1].lower()
    args = sys.argv[2:]

    try:
        if cmd == "fetch":
            cmd_fetch(args)
        elif cmd == "live":
            cmd_live(args)
        elif cmd == "batch":
            cmd_batch(args)
        else:
            print(json.dumps({"error": f"Unknown command: {cmd}"}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
