#!/usr/bin/env bash
# ============================================================================
# Environmental module — smoke test
# Run with: bash test-environmental.sh
# Requires: server running (bun dev), DB seeded (bun prisma db seed)
# ============================================================================

set -e
BASE="http://localhost:3000/api/environmental"

# --- pull real IDs from the DB instead of hardcoding stale ones ------------
echo "Fetching seed IDs..."
FACTORS=$(curl -s "$BASE/emission-factors")
DIESEL_ID=$(echo "$FACTORS" | grep -o '"id":"[^"]*","name":"Diesel combustion"' | grep -o '^"id":"[^"]*"' | cut -d'"' -f4)

DEPARTMENTS=$(curl -s "$BASE/departments/summary")
LOGISTICS_ID=$(echo "$DEPARTMENTS" | grep -o '"departmentId":"[^"]*","departmentName":"Logistics"' | grep -o '^"departmentId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DIESEL_ID" ] || [ -z "$LOGISTICS_ID" ]; then
  echo "Could not find seed IDs — did you run 'bun prisma db seed'?"
  exit 1
fi
echo "  diesel factor: $DIESEL_ID"
echo "  logistics dept: $LOGISTICS_ID"
echo ""

pass=0
fail=0

check() {
  local label="$1"
  local expected_substr="$2"
  local actual="$3"
  if echo "$actual" | grep -q "$expected_substr"; then
    echo "PASS  $label"
    pass=$((pass+1))
  else
    echo "FAIL  $label"
    echo "      expected to find: $expected_substr"
    echo "      got: $(echo "$actual" | head -c 200)"
    fail=$((fail+1))
  fi
}

echo "--- GET (list) ---------------------------------------------------------"
check "GET emission-factors"      '"success":true' "$(curl -s $BASE/emission-factors)"
check "GET product-esg-profiles"  '"success":true' "$(curl -s $BASE/product-esg-profiles)"
check "GET carbon-transactions"   '"success":true' "$(curl -s $BASE/carbon-transactions)"
check "GET goals"                 '"success":true' "$(curl -s $BASE/goals)"
check "GET departments/summary"   '"success":true' "$(curl -s $BASE/departments/summary)"
check "GET dashboard"             '"success":true' "$(curl -s $BASE/dashboard)"

echo ""
echo "--- Validation rejects bad input ---------------------------------------"
BAD=$(curl -s -X POST $BASE/emission-factors -H "Content-Type: application/json" \
  -d '{"name":"","co2PerUnit":-5}')
check "POST emission-factors rejects empty name + negative value" '"success":false' "$BAD"

echo ""
echo "--- Server computes co2Kg, ignores client value ------------------------"
CALC=$(curl -s -X POST $BASE/carbon-transactions -H "Content-Type: application/json" \
  -d "{\"departmentId\":\"$LOGISTICS_ID\",\"emissionFactorId\":\"$DIESEL_ID\",\"activityAmount\":500,\"co2Kg\":999999}")
check "POST carbon-transactions computes 500*2.68=1340, ignores fake co2Kg" '"co2Kg":"1340"' "$CALC"

echo ""
echo "--- Auto-calculate duplicate guard --------------------------------------"
REF="SMOKETEST-$(date +%s)"
FIRST=$(curl -s -X POST $BASE/carbon-transactions/auto-calculate -H "Content-Type: application/json" \
  -d "{\"departmentId\":\"$LOGISTICS_ID\",\"emissionFactorId\":\"$DIESEL_ID\",\"sourceType\":\"FLEET\",\"sourceRef\":\"$REF\",\"activityAmount\":300}")
check "First auto-calculate call succeeds" '"success":true' "$FIRST"

SECOND=$(curl -s -X POST $BASE/carbon-transactions/auto-calculate -H "Content-Type: application/json" \
  -d "{\"departmentId\":\"$LOGISTICS_ID\",\"emissionFactorId\":\"$DIESEL_ID\",\"sourceType\":\"FLEET\",\"sourceRef\":\"$REF\",\"activityAmount\":300}")
check "Second identical call is blocked (no double-counting)" '"success":false' "$SECOND"

echo ""
echo "--- Goal progress matches wireframe --------------------------------------"
GOALS=$(curl -s $BASE/goals)
check "Reduce Fleet Emissions -> 78%"   '"name":"Reduce Fleet Emissions"' "$GOALS"
check "progress:78 present"             '"progress":78'                  "$GOALS"
check "Office Energy Cut -> COMPLETED"  '"status":"COMPLETED"'           "$GOALS"

echo ""
echo "=========================================================================="
echo "  $pass passed, $fail failed"
echo "=========================================================================="
[ "$fail" -eq 0 ] && exit 0 || exit 1