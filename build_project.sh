#!/bin/bash

# Remove .env file on exit. Protect OAI API keys
cleanup() {
    echo "Cleaning up..."
    rm -f ~/CS-Capstone/smart-fridge-web/.env
    echo "Removed .env file"
    exit 0
}

# Load credentials from ~/credentials.env
if [ -f ~/credentials.env ]; then
    source ~/credentials.env
else
    echo "Missing credentials.env"
    exit 1
fi
if [ -z "$GIT_USERNAME" ] || [ -z "$GIT_PASSWORD" ] || [ -z "$REPO_URL" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "Could not load credentials"
    exit 1
fi

# Clear old project
echo "Remove old"
rm -rf CS-Capstone/

# Clone from main
echo "Cloning"
git clone "$REPO_URL"
wait

#Copy in the OAI API key to the root web folder. Need a better way... But will work well enough for now
echo "REACT_APP_OPENAI_API_KEY=$OPENAI_API_KEY" > ~/CS-Capstone/smart-fridge-web/.env

cd ~/CS-Capstone/smart-fridge-web || exit

echo "Remove old node modules"
rm -rf node_modules

# Install dependencies
echo "Installing frontend"
npm install

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
  npm install cors;
  node server.js;
  exec bash
" &

echo "Done"
# If frontend process is ended, then run cleanup to remove credentials
wait $FRONTEND_PID
cleanup
