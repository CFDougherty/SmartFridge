#!/bin/bash

SCRIPT_SOURCE=~/CS-Capstone/build_project.sh
SCRIPT_TARGET=~/build_project.sh
RUN_SOURCE=~/CS-Capstone/run_project.sh
RUN_TARGET=~/run_project.sh

# Copy over build and run scripts
if [[ "$(realpath "$0")" == "$(realpath "$SCRIPT_SOURCE")" ]]; then
    echo "Copying project scripts to home directory..."
    cp "$SCRIPT_SOURCE" "$SCRIPT_TARGET"
    cp "$RUN_SOURCE" "$RUN_TARGET"
    chmod +x "$SCRIPT_TARGET" "$RUN_TARGET"
    echo "Re-running from $SCRIPT_TARGET..."
    exec "$SCRIPT_TARGET"
    exit 0
else
    echo "Updating script copies from CS-Capstone..."
    cp "$SCRIPT_SOURCE" "$SCRIPT_TARGET"
    cp "$RUN_SOURCE" "$RUN_TARGET"
    chmod +x "$SCRIPT_TARGET" "$RUN_TARGET"
fi

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
if [ -z "$GIT_USERNAME" ] || [ -z "$GIT_PASSWORD" ] || [ -z "$REPO_URL" ] || [ -z "$OPENAI_API_KEY" ] || [ -z "$SPOONACULAR_API_KEY" ]; then
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

#Copy over Spoonacular, OAI api keys
{
  echo "REACT_APP_OPENAI_API_KEY=$OPENAI_API_KEY"
  echo "REACT_APP_SPOONACULAR_API_KEY=$SPOONACULAR_API_KEY"
  echo "DANGEROUSLY_DISABLE_HOST_CHECK=true"
} > ~/CS-Capstone/smart-fridge-web/.env

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
