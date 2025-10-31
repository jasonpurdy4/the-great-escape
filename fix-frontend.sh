#!/bin/bash
cd /Users/jasonpurdy/the-great-escape
git add -A
git commit -m "Remove accidentally created backend/frontend directory that broke deployment"
git push origin main
echo "Done! Frontend should redeploy now."
