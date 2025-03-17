#!/bin/bash

# Start frontend, new window
echo "Starting frontend"
x-terminal-emulator -e bash -c "
  cd ~/CS-Capstone/smart-fridge-web;
  npm run start;
  exec bash
  " &

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
