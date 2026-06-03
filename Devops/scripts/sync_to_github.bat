@echo off
echo [Bluelearner] Synchronizing changes to GitHub...
git add .
git commit -m "Implement Unified Learning & Competition Engine, Pathfinder login, and Academy Hub"
git push
echo [Bluelearner] Sync complete!
pause
