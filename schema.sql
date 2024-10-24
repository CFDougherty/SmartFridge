-- Create the tables with modifications for SQLite

CREATE TABLE `FridgeContents` (
  `item_id` INTEGER PRIMARY KEY,             -- Automatically increments
  `name` TEXT NOT NULL,
  `category` TEXT,
  `quantity` REAL NOT NULL,
  `unit` TEXT NOT NULL,
  `expiration_date` DATE,
  `last_updated` DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `SensorData` (
  `sensor_id` INTEGER PRIMARY KEY,
  `item_id` INTEGER,
  `weight` REAL NOT NULL,
  `timestamp` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (`item_id`) REFERENCES `FridgeContents` (`item_id`)
);

CREATE TABLE `ShoppingList` (
  `list_id` INTEGER PRIMARY KEY,
  `user_id` INTEGER,
  `created_date` DATE NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `UserSettings` (`user_id`)
);

CREATE TABLE `ShoppingListItems` (
  `item_id` INTEGER PRIMARY KEY,
  `list_id` INTEGER,
  `ingredient_name` TEXT NOT NULL,
  `quantity` REAL NOT NULL,
  `unit` TEXT NOT NULL,
  FOREIGN KEY (`list_id`) REFERENCES `ShoppingList` (`list_id`)
);

CREATE TABLE `Recipes` (
  `recipe_id` INTEGER PRIMARY KEY,
  `name` TEXT NOT NULL,
  `instructions` TEXT,
  `prep_time` INTEGER
);

CREATE TABLE `RecipeIngredients` (
  `recipe_ingredient_id` INTEGER PRIMARY KEY,
  `recipe_id` INTEGER,
  `ingredient_name` TEXT NOT NULL,
  `quantity` REAL NOT NULL,
  `unit` TEXT NOT NULL,
  FOREIGN KEY (`recipe_id`) REFERENCES `Recipes` (`recipe_id`)
);

CREATE TABLE `UserSettings` (
  `user_id` INTEGER PRIMARY KEY,
  `username` TEXT NOT NULL,
  `preferences` TEXT
);

CREATE TABLE `ThirdPartyCredentials` (
  `credential_id` INTEGER PRIMARY KEY,
  `user_id` INTEGER,
  `provider` TEXT NOT NULL,
  `access_token` TEXT NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `UserSettings` (`user_id`)
);

CREATE TABLE `HistoricalData` (
  `historical_id` INTEGER PRIMARY KEY,
  `user_id` INTEGER,
  `item_name` TEXT NOT NULL,
  `purchase_count` INTEGER NOT NULL,
  `last_purchased_date` DATE,
  FOREIGN KEY (`user_id`) REFERENCES `UserSettings` (`user_id`)
);
