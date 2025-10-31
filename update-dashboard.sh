#!/bin/bash
cd /Users/jasonpurdy/the-great-escape

# Backup original
cp frontend/src/components/Dashboard/Dashboard.js frontend/src/components/Dashboard/Dashboard.js.backup

# Add import for UpcomingMatches after FutureMatchweeks import
sed -i '' 's/import FutureMatchweeks from .\/FutureMatchweeks.;/import FutureMatchweeks from \.\/FutureMatchweeks.;\nimport UpcomingMatches from \.\/UpcomingMatches.;/' frontend/src/components/Dashboard/Dashboard.js

# Add UpcomingMatches component after BalanceCard section
# Insert before "My Active Picks" section
sed -i '' '/My Active Picks/i\
\        {/* Upcoming Matches Alert */}\
\        <div className="dashboard-section">\
\          <UpcomingMatches entries={entries} token={token} />\
\        </div>\
\
' frontend/src/components/Dashboard/Dashboard.js

echo "Dashboard updated with UpcomingMatches component!"
echo "Check the file to make sure it looks good, then:"
echo "git add -A && git commit -m 'Integrate upcoming matches into dashboard' && git push"
