#!/bin/bash

echo "🧪 Testing KALM AI Platform - Full Website Check"
echo "================================================"
echo ""

API_URL="https://web-production-e7159.up.railway.app"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
HEALTH=$(curl -s "${API_URL}/health")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Health check: PASSED${NC}"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null | head -10
else
    echo -e "${RED}❌ Health check: FAILED${NC}"
fi
echo ""

# Test 2: Root API
echo "2️⃣ Testing Root API Endpoint..."
ROOT=$(curl -s "${API_URL}/")
if echo "$ROOT" | grep -q "KALM"; then
    echo -e "${GREEN}✅ Root API: PASSED${NC}"
else
    echo -e "${RED}❌ Root API: FAILED${NC}"
fi
echo ""

# Test 3: CORS Headers
echo "3️⃣ Testing CORS Configuration..."
CORS=$(curl -s -X OPTIONS "${API_URL}/api/analyze-transcript" -H "Origin: https://web-production-e7159.up.railway.app" -H "Access-Control-Request-Method: POST" -v 2>&1)
if echo "$CORS" | grep -qi "access-control"; then
    echo -e "${GREEN}✅ CORS: Configured${NC}"
else
    echo -e "${YELLOW}⚠️  CORS: May need configuration${NC}"
fi
echo ""

# Test 4: Authentication Endpoint (should require auth)
echo "4️⃣ Testing Authentication Endpoint..."
AUTH_TEST=$(curl -s -X GET "${API_URL}/api/auth/profile" -H "Authorization: Bearer invalid-token")
if echo "$AUTH_TEST" | grep -q "Invalid\|expired\|required"; then
    echo -e "${GREEN}✅ Auth protection: Working${NC}"
else
    echo -e "${YELLOW}⚠️  Auth protection: Check response${NC}"
fi
echo ""

# Test 5: File Upload Endpoint (should require auth)
echo "5️⃣ Testing File Upload Endpoint..."
UPLOAD_TEST=$(curl -s -X POST "${API_URL}/api/analyze-transcript" -H "Authorization: Bearer invalid-token")
if echo "$UPLOAD_TEST" | grep -q "Invalid\|expired\|required"; then
    echo -e "${GREEN}✅ Upload protection: Working${NC}"
else
    echo -e "${YELLOW}⚠️  Upload protection: Check response${NC}"
fi
echo ""

echo "================================================"
echo "✅ Basic endpoint tests complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Test file analysis with sample transcript"
echo "   2. Test authentication (register/login)"
echo "   3. Test all UI components in browser"
echo "   4. Check browser console for errors"
echo "   5. Test collaboration features"
echo ""

