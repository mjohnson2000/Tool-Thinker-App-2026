#!/bin/bash

# Force kill all processes on port 3001

echo "Killing all processes on port 3001..."

# Get all PIDs using port 3001
PIDS=$(lsof -ti:3001 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ Port 3001 is already free"
    exit 0
fi

echo "Found processes: $PIDS"

# Kill each process
for PID in $PIDS; do
    echo "Killing process $PID..."
    kill -9 $PID 2>/dev/null
done

sleep 2

# Verify
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "⚠️  Some processes may still be running. Try:"
    echo "   sudo lsof -ti:3001 | xargs sudo kill -9"
else
    echo "✅ Port 3001 is now free!"
fi

