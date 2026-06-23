#!/bin/bash
cd /Users/BAWES/Sites/studenthub/studenthub-next-coder2
# Generate a random AUTH_SECRET for the test run
AUTH_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
export AUTH_SECRET
npx playwright test --reporter=dot > /tmp/e2e-results.txt 2>&1
echo "EXIT CODE: $?" >> /tmp/e2e-results.txt
