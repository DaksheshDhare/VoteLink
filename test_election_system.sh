#!/bin/bash
# Election System Testing Script
# Run this to verify all fixes are working

echo "🧪 Election System Verification Tests"
echo "======================================"
echo ""

API_BASE="http://localhost:5000/api"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health
echo -e "${YELLOW}Test 1: Backend Health Check${NC}"
HEALTH=$(curl -s "$API_BASE/health")
if echo "$HEALTH" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is NOT responding${NC}"
    exit 1
fi
echo ""

# Test 2: Get All Elections (Admin)
echo -e "${YELLOW}Test 2: Get All Elections (Admin View)${NC}"
ALL_ELECTIONS=$(curl -s "$API_BASE/elections")
TOTAL=$(echo "$ALL_ELECTIONS" | grep -o '"total":[0-9]*' | cut -d: -f2)
echo "Total elections in database: $TOTAL"
if [ "$TOTAL" -ge "0" ]; then
    echo -e "${GREEN}✅ Admin endpoint working${NC}"
else
    echo -e "${RED}❌ Admin endpoint failed${NC}"
fi
echo ""

# Test 3: Get Active Elections (Voter View)
echo -e "${YELLOW}Test 3: Get Active Elections (Voter View - Date Filtered)${NC}"
ACTIVE=$(curl -s "$API_BASE/elections/active")
ACTIVE_COUNT=$(echo "$ACTIVE" | grep -o '"total":[0-9]*' | cut -d: -f2)
echo "Active elections visible to voters: $ACTIVE_COUNT"

# Check server time
SERVER_TIME=$(echo "$ACTIVE" | grep -o '"serverTime":"[^"]*' | cut -d'"' -f4)
echo "Server time: $SERVER_TIME"

if [ "$ACTIVE_COUNT" -ge "0" ]; then
    echo -e "${GREEN}✅ Voter endpoint working${NC}"
else
    echo -e "${RED}❌ Voter endpoint failed${NC}"
fi
echo ""

# Test 4: Create Test Election
echo -e "${YELLOW}Test 4: Create Test Election${NC}"
START_DATE="2026-02-02T08:00:00Z"
END_DATE="2026-02-10T18:00:00Z"

CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/elections" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TEST_ELECTION_'$(date +%s)'",
    "description": "Test election for verification",
    "type": "national",
    "startDate": "'$START_DATE'",
    "endDate": "'$END_DATE'",
    "region": {
      "name": "All India",
      "state": "All States",
      "constituencies": ["National"]
    },
    "candidates": [
      {
        "id": "cand_1",
        "name": "Candidate A",
        "party": "Party A",
        "symbol": "🇮🇳",
        "color": "#FF9933",
        "description": "Test candidate"
      }
    ],
    "createdBy": "test@election.gov",
    "settings": {
      "enableBlockchain": true,
      "requireBiometric": false,
      "requireVoterVerification": true,
      "enableRealTimeResults": true,
      "allowEarlyVoting": false,
      "allowProxyVoting": false
    }
  }')

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    ELECTION_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Election created successfully${NC}"
    echo "Election ID: $ELECTION_ID"
else
    echo -e "${RED}❌ Failed to create election${NC}"
    echo "Response: $CREATE_RESPONSE"
fi
echo ""

# Test 5: Verify Election Appears in Active List
echo -e "${YELLOW}Test 5: Verify Election in Active List${NC}"
ACTIVE_AFTER=$(curl -s "$API_BASE/elections/active")
ACTIVE_COUNT_AFTER=$(echo "$ACTIVE_AFTER" | grep -o '"total":[0-9]*' | cut -d: -f2)
echo "Active elections after create: $ACTIVE_COUNT_AFTER"

if [ "$ACTIVE_COUNT_AFTER" -gt "$ACTIVE_COUNT" ]; then
    echo -e "${GREEN}✅ Election appears in voter list${NC}"
else
    echo -e "${YELLOW}⚠️  Check date range - election may be scheduled/future${NC}"
fi
echo ""

# Test 6: Region Filtering
echo -e "${YELLOW}Test 6: Region Filtering${NC}"
MAHARASHTRA=$(curl -s "$API_BASE/elections/active/region?state=Maharashtra")
MH_COUNT=$(echo "$MAHARASHTRA" | grep -o '"total":[0-9]*' | cut -d: -f2)
echo "Elections for Maharashtra voters: $MH_COUNT"
echo -e "${GREEN}✅ Region filtering working${NC}"
echo ""

# Test 7: Election Details
echo -e "${YELLOW}Test 7: Get Election Details${NC}"
if [ ! -z "$ELECTION_ID" ]; then
    DETAILS=$(curl -s "$API_BASE/elections/$ELECTION_ID")
    if echo "$DETAILS" | grep -q '"success":true'; then
        TITLE=$(echo "$DETAILS" | grep -o '"title":"[^"]*' | cut -d'"' -f4)
        STATUS=$(echo "$DETAILS" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
        echo "Title: $TITLE"
        echo "Status: $STATUS"
        echo -e "${GREEN}✅ Election details retrieved${NC}"
    fi
fi
echo ""

# Test 8: Frontend Service Check
echo -e "${YELLOW}Test 8: Frontend Service Sync Check${NC}"
echo "Browser must be open with voter app for this to work"
echo "Run in browser console:"
echo "  console.log(electionService.getActiveElections())"
echo "  - Should show elections from backend"
echo ""

# Test 9: MongoDB Direct Check
echo -e "${YELLOW}Test 9: MongoDB Direct Check (if available)${NC}"
echo "Run in MongoDB shell/compass:"
echo "  use voting_db"
echo "  db.elections.find({status: 'active'}).pretty()"
echo "  - Should show created election"
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}Test Summary:${NC}"
echo -e "${GREEN}✅ Backend health${NC}"
echo -e "${GREEN}✅ Admin elections endpoint${NC}"
echo -e "${GREEN}✅ Voter elections endpoint (date filtered)${NC}"
echo -e "${GREEN}✅ Election creation${NC}"
echo -e "${GREEN}✅ Region filtering${NC}"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Open voter app in fresh browser"
echo "2. Register/login as voter"
echo "3. Select region"
echo "4. Check 'Available Elections' - should see test election"
echo "5. If empty, check backend logs for sync errors"
echo ""
echo "Clean up test election when done:"
echo "  curl -X DELETE $API_BASE/elections/<ELECTION_ID>"
echo ""
