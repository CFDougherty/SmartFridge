# AI Smart Fridge
A solution to revolutionize kitchen management by monitoring fridge inventory, tracking 
expiration dates, generating shopping lists, and suggesting meals based on available 
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

Our AI Smart Fridge project project automates ingredient monitoring, expiration 
tracking, and recipe suggestions. By combining IoT and machine learning, it reduces 
food waste, generates shopping lists, alerts users to low stock, and simplifies meal 
planning—all in one seamless system.


## Features
- **Inventory Tracking:** Monitors the quantity of items in the fridge using a camera and image recognition.
- **Expiration Monitoring:** Alerts users about soon-to-expire items to minimize waste.
- **Meal Suggestions:** Proposes meals based on available ingredients, dietary restrictions, and expiration rankings.
- **Shopping List:** Automatically builds a shopping list for low-stock items.
- **Integration with Delivery Services:** Enables users to order groceries directly from services like Instacart.


## Design Details
The AI Smart Fridge leverages a combination of IoT devices, machine learning, and user-friendly interfaces to 
create an efficient kitchen management system. Below are the design considerations and architectural highlights.

# Architecture Overview:
**Hardware Integration:**
- Camera: Captures images of fridge contents for inventory tracking using image classification.
- Load Cell Sensors: Measure ingredient weight changes to track usage.
- Display: Provides an interactive interface for users to view inventory, create and order shopping lists, follow recipes, and schedule alerts directly on the fridge door.
  
**Software Components:**
- Fridge Display Software: Tracks inventory in the fridge, receives low-stock or expiration alerts, suggests recipes, and provides a shopping list with ordering options.
- Mobile/Web App: Tracks inventory remotely, receives low-stock or expiration alerts, suggests recipes, and provides a shopping list with ordering options.
- Backend: Uses a Python-based ML model for image recognition and predictive analysis. Stores user preferences, alerts, and inventory data in an SQLite3 database.
- Machine Learning Models: Uses OpenCV for image preprocessing and PyTorch for building, training, and testing deep learning models for ingredient recognition.
- API Integrations: Connects to delivery services like Instacart for grocery shopping automation. Connects to an extensive recipe database. 

# User Interface:
**Key Features:**
- Real-time inventory tracking
- Automatic shopping list creation
- Recipe suggestions based on ingredients in stock
- Alerts for expiring items, low stock
- Calendar feature for scheduling and reminders

Figma UI Wireframe:
https://www.figma.com/design/wWFdGDr48QXB2gG65yrl4t/Fridge-Display-Wireframe?node-id=0-1&t=N2K9083Wl4GnrN22-1

Figma Prototype Link:
https://www.figma.com/proto/wWFdGDr48QXB2gG65yrl4t/Fridge-Display-Wireframe?node-id=0-1&t=N2K9083Wl4GnrN22-1


### Example Code:

#Add code snippet or example to showcase design principles


## Installation

**Prerequisites:**
- Raspberry Pi with PiOS
- Camera
- Display
- Load Cell
- Python Libraries: OpenCV, PyTorch, SQLite3

# Installation steps
$ git clone https://github.com/SnowDrifterr/CS-Capstone.git
$ cd CS-Capstone
$ npm install #or any other relevant command


## Configuration
Explain how users can configure your project. If applicable, include details about
configuration files.
Example Configuration:
#Configuration file example
key: value
Usage
Provide examples and instructions on how users can use your project. Include code
snippets or command-line examples.


## Example Usage:
#Example command or usage


## Contributing
Explain how others can contribute to your project. Include guidelines for pull
requests and any code of conduct.


## License
This project is licensed under the MIT License.
