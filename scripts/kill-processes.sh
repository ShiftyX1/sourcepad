#!/bin/bash

# HELPER FOR DEVELOPMENT, try not use this, it is a serious crutch (that actually did not even help me 🥲)

echo "🔍 Checking SourcePad processes..."

echo "Terminating Electron processes..."
pkill -f "electron.*sourcepad" 2>/dev/null || true
pkill -f "Electron.*SourcePad" 2>/dev/null || true

echo "Terminating Vite processes on port 5173..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "Terminating Vite processes..."
pkill -f "node.*vite" 2>/dev/null || true

echo "Terminating SourcePad processes..."
pkill -f "SourcePad" 2>/dev/null || true

echo "🔍 Checking for remaining processes..."
REMAINING_ELECTRON=$(ps aux | grep -i electron | grep -i sourcepad | grep -v grep | wc -l)
REMAINING_VITE=$(ps aux | grep -i vite | grep -v grep | wc -l)
REMAINING_PORT=$(lsof -ti:5173 | wc -l)

if [ "$REMAINING_ELECTRON" -gt 0 ]; then
    echo "⚠️  Found $REMAINING_ELECTRON Electron processes"
    ps aux | grep -i electron | grep -i sourcepad | grep -v grep
fi

if [ "$REMAINING_VITE" -gt 0 ]; then
    echo "⚠️  Found $REMAINING_VITE Vite processes"
    ps aux | grep -i vite | grep -v grep
fi

if [ "$REMAINING_PORT" -gt 0 ]; then
    echo "⚠️  Port 5173 is still occupied"
    lsof -i:5173
fi

if [ "$REMAINING_ELECTRON" -eq 0 ] && [ "$REMAINING_VITE" -eq 0 ] && [ "$REMAINING_PORT" -eq 0 ]; then
    echo "✅ All processes have been terminated successfully!"
else
    echo "❌ Some processes may still be running. Try:"
    echo "   sudo ./scripts/kill-processes.sh"
fi