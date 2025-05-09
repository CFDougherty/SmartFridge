#!/bin/bash

# Remove .env file on exit. Protect OAI API keys
cleanup() {
    echo "Cleaning up..."
    rm -f ~/CS-Capstone/smart-fridge-web/.env
    echo "Removed .env OAI credentials file"
    exit 0
}


# Load credentials from ~/credentials.env
if [ -f ~/credentials.env ]; then
    source ~/credentials.env
else
    echo "Missing credentials.env"
    exit 1
fi
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Could not load credentials"
    exit 1
fi

#Copy over Spoonacular, OAI api keys
{
  echo "REACT_APP_OPENAI_API_KEY=$OPENAI_API_KEY"
  echo "REACT_APP_SPOONACULAR_API_KEY=$SPOONACULAR_API_KEY"
  echo "DANGEROUSLY_DISABLE_HOST_CHECK=true"
} > ~/CS-Capstone/smart-fridge-web/.env


# Start frontend, new window
echo "Starting frontend"
x-terminal-emulator -e bash -c "
  cd ~/CS-Capstone/smart-fridge-web;
  npm run start;
  exec bash
  " &
FRONTEND_PID=$!

# Wait. Pi is not fast. 
sleep 4

# Start backend, new window
echo "Starting backend"
x-terminal-emulator -e bash -c "
  cd ~/CS-Capstone/smart-fridge-web/backend || exit;
  node server.js;
  exec bash
" &

echo "Done"

# If frontend process is ended, then run cleanup to remove credentials
wait $FRONTEND_PID
cleanup
