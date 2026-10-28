#!/bin/bash
# Run once, after all lesson-plan trials for a round of testing are done.
# Walks every session in sessions.db, asks for a rating + note per session,
# appends to model-test-log.csv, then skips it next time (already logged
# in $LOGGED file so re-running never double-counts).

set -euo pipefail

DB="$HOME/.local/share/goose/sessions/sessions.db"
CSV="$(dirname "$0")/model-test-log.csv"
LOGGED="$(dirname "$0")/.logged-session-ids"

touch "$LOGGED"

sqlite3 -separator '|' "$DB" \
  "SELECT id, working_dir, model_config_json, accumulated_cost, created_at
   FROM sessions ORDER BY created_at ASC;" |
while IFS='|' read -r id working_dir model_json cost created_at; do
  grep -qxF "$id" "$LOGGED" && continue

  student=$(basename "$working_dir")
  model=$(echo "$model_json" | sed -n 's/.*"model_name":"\([^"]*\)".*/\1/p')
  msg_count=$(sqlite3 "$DB" "SELECT COUNT(*) FROM messages WHERE session_id='$id';")
  date_only="${created_at%% *}"

  echo ""
  echo "Session $id — $student — $model — \$$cost — $msg_count messages"
  read -rp "  Rating (1-5, blank to skip logging this one): " rating
  if [ -z "$rating" ]; then
    echo "$id" >> "$LOGGED"
    continue
  fi
  read -rp "  Thinking effort for this run (off/low/medium/high/max): " effort
  read -rp "  Note: " note

  echo "$date_only,$student,$model,,$effort,$cost,$msg_count,$rating,\"$note\"" >> "$CSV"
  echo "$id" >> "$LOGGED"
done

echo ""
echo "Done. Log: $CSV"
