# AI Smart Fridge
A solution to revolutionize kitchen management by monitoring fridge inventory, tracking 
expiration dates, providing shopping lists, and suggesting meals based on available 
ingredients and user preferences.


## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Design Details](#design-details)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)


## Introduction

Managing fridge ingredients manually is tedious and often leads to food waste, 
expired items, and inefficient meal planning. Current solutions are too expensive or 
lack automation, making tracking and meal preparation frustrating for consumers.

Our AI Smart Fridge project automates ingredient monitoring, expiration 
tracking, and recipe suggestions. By combining IoT and machine learning, it reduces 
food waste, offers shopping lists, alerts users to low stock, and simplifies meal 
planning—all in one seamless system.


## Features
- **Inventory Tracking:** Monitors the quantity of items in the fridge using a camera and image recognition.
- **Expiration Monitoring:** Alerts users about soon-to-expire items to minimize waste.
- **Meal Suggestions:** Proposes meals based on available ingredients, dietary restrictions, and expiration rankings.
- **Shopping List:** Offers an integrated shopping list for users to add low-stock items so they can remember to restock.


## Design Details
The AI Smart Fridge leverages a combination of IoT devices, machine learning, and user-friendly interfaces to 
create an efficient kitchen management system. Below are the design considerations and architectural highlights.

# Architecture Overview:
**Hardware Integration:**
- Camera: Captures images of fridge contents for inventory tracking using image classification.
- Display: Provides an interactive interface for users to view inventory, create shopping lists, follow recipes, and schedule alerts directly on the fridge door.
  
**Software Components:**
- Front (React): Provide an interface for viewing inventory, editing items, searching recipes, and editing alert/shopping lists.
- Backend (Node/Express): Include API endpoints that allow app to retrieve, add, update, and delete fridge items, shoppling list entries, editting alerts, and saved recipes.
- Database (SQLite3): Stores items in fridge, alerts, personal recipes, and shopping list. 
- API Integrations:
  - UPCItemDB for barcode lookup.
  - Spoonacular for recipe searching and suggestions.
  - OpenAI for image processing
- Fridge Display Software: Tracks inventory in the fridge, receives low-stock or expiration alerts, suggests recipes, and provides a shopping list to add low-stock ingredients.
- Mobile/Web App: Tracks inventory remotely, receives low-stock or expiration alerts, suggests recipes, and provides a shopping list for easier shopping.

# User Interface:
**Key Features:**
- Real-time inventory tracking
- Recipe suggestions and personal cookbook creation
- Alerts for expiring items, low stock
- Calendar feature for scheduling and reminders
- Shopping list creation straight from the fridge

Figma UI Wireframe:
https://www.figma.com/design/wWFdGDr48QXB2gG65yrl4t/Fridge-Display-Wireframe?node-id=0-1&t=N2K9083Wl4GnrN22-1

Figma Prototype Link:
https://www.figma.com/proto/wWFdGDr48QXB2gG65yrl4t/Fridge-Display-Wireframe?node-id=0-1&t=N2K9083Wl4GnrN22-1


### Example Code:

#Add code snippet or example to showcase design principles
```.
├── src                     
│   ├── components          # Reusable UI components
│   │   ├── NavigationBar.js    # Bottom navigation bar
│   │   ├── QuaggaScanner.js    # Barcode scanning component
│   ├── context             # Global state management
│   │   ├── AlertsContext.js    # Handles expiration alerts
│   │   ├── ItemsContext.js     # Stores fridge items
│   │   ├── RecipesContext.js   # Manages recipes
│   │   ├── ShoppingListContext.js # Shopping list logic
│   │   ├── BarcodesContext.js  # Barcode lookup handling
│   ├── pages               # React pages (views)
│   │   ├── HomePage.js         # Dashboard view
│   │   ├── ItemsPage.js        # Manage fridge items
│   │   ├── AlertsPage.js       # Manage expiration alerts
│   │   ├── ShoppingListPage.js # View shopping list
│   │   ├── RecipesPage.js      # Browse & save recipes
│   │   ├── SettingsPage.js     
│   │   ├── BarcodeScannerPage.js # Scan barcodes to add items
│   ├── App.js               # Main React app entry point
│   ├── styles               # Styles for UI components
│   │   ├── NavigationBar.css
│   │   ├── HomePage.css
│   │   ├── ItemsPage.css
│   └── index.js             # Renders React application
├── server.js                # Express backend API
├── smart-fridge.db          # SQLite database file
├── package.json             
├── README.md                
└── .gitignore               
```

## Installation

**Prerequisites:**
- Raspberry Pi with PiOS and external display w/ touch capability installed to run UI and orchestrator *
- Second Raspberry Pi with PiCam installed *
- Display
- Python Libraries: SQLite3
- OpenAI 4o API key & tokens
- Spoonacular API key (free tier is enough)
- Tailscale installed on both Pi computers and mobile device(s) (optional for local use, required for remote access away from LAN)

\* Note that a Pi can be substituted to any computer running linux, so long as the appropriate libraries are installed. May need some reconfiguration to suit specific HW environments

# Installation Steps
1. Clone the repo into your home directory on both Pi computer
2. On the pi-camera unit, install python and run 'python3 picamserver.py' or run as a system service on startup
3. On the display / orchestrator unit, ensure that Node.js and npm installed
4. Run our setup script to install both server and client side dependencies, initialize the SQLite database, and copy over and populate the example env file

Setup Script:
$ Download and run build_project.sh in ~/
$ Ensure that ~/credentials.env is present 


## Configuration
All runtime configurations should be in a credentials.env file. For reference, we have included a credentials.env.sample in the repository that tells you what you need in the .env file.


## License
This project is licensed under the MIT License.
