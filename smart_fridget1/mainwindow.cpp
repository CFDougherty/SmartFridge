#include "mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent) {
    // Create the stacked widget
    stackedWidget = new QStackedWidget(this);

    // Create all pages
    createHomePage();
    createInventoryPage();
    createShoppingListPage();
    createRecipePage();
    createAlertPage();

    // Add pages to stacked widget
    stackedWidget->addWidget(homePage);
    stackedWidget->addWidget(inventoryPage);
    stackedWidget->addWidget(shoppingListPage);
    stackedWidget->addWidget(recipePage);
    stackedWidget->addWidget(alertPage);

    // Set the stacked widget as the central widget
    setCentralWidget(stackedWidget);

    // Set initial page
    stackedWidget->setCurrentWidget(homePage);

    // Connect buttons to navigation slots
    connect(inventoryButton, &QPushButton::clicked, this, &MainWindow::showInventoryPage);
    connect(shoppingListButton, &QPushButton::clicked, this, &MainWindow::showShoppingListPage);
    connect(recipeButton, &QPushButton::clicked, this, &MainWindow::showRecipePage);
    connect(alertButton, &QPushButton::clicked, this, &MainWindow::showAlertPage);
}

MainWindow::~MainWindow() {}

void MainWindow::createHomePage() {
    homePage = new QWidget(this);
    QVBoxLayout *mainLayout = new QVBoxLayout(homePage);

    // Navigation Bar
    QHBoxLayout *navBarLayout = new QHBoxLayout;
    QPushButton *settingsButton = new QPushButton("⚙", this);
    settingsButton->setFixedSize(40, 40);
    navBarLayout->addStretch();
    navBarLayout->addWidget(settingsButton);

    // Date Label
    QLabel *dateLabel = new QLabel("Friday, Nov. 1", this);
    dateLabel->setAlignment(Qt::AlignCenter);
    dateLabel->setStyleSheet("font-size: 24px; font-weight: bold;");

    // Grid Layout for Main Sections
    QGridLayout *gridLayout = new QGridLayout;

    // Items in Fridge Section
    inventoryButton = new QPushButton("Items in Fridge", this);
    inventoryButton->setStyleSheet("font-size: 16px; font-weight: bold;");
    QLabel *inventorySummary = new QLabel("Milk: 1L (Exp: 2 Days)\nEggs: 6 pcs (Exp: 5 Days)", this);
    inventorySummary->setStyleSheet("font-size: 14px;");
    QVBoxLayout *inventoryLayout = new QVBoxLayout;
    inventoryLayout->addWidget(inventoryButton);
    inventoryLayout->addWidget(inventorySummary);

    QWidget *inventorySection = new QWidget(this);
    inventorySection->setLayout(inventoryLayout);
    inventorySection->setStyleSheet("background: #d3d3d3; padding: 10px;");

    // Shopping List Section
    shoppingListButton = new QPushButton("Shopping List", this);
    shoppingListButton->setStyleSheet("font-size: 16px; font-weight: bold;");
    QLabel *shoppingSummary = new QLabel("Milk\nEggs\nCarrots\nPickles", this);
    shoppingSummary->setStyleSheet("font-size: 14px;");
    QVBoxLayout *shoppingListLayout = new QVBoxLayout;
    shoppingListLayout->addWidget(shoppingListButton);
    shoppingListLayout->addWidget(shoppingSummary);

    QWidget *shoppingListSection = new QWidget(this);
    shoppingListSection->setLayout(shoppingListLayout);
    shoppingListSection->setStyleSheet("background: #d3d3d3; padding: 10px;");

    // Recipes Section
    recipeButton = new QPushButton("Recipes", this);
    recipeButton->setStyleSheet("font-size: 16px; font-weight: bold;");
    QLabel *recipeSummary = new QLabel("Suggestion: Cake\nCook Time: 45 mins\nIngredients: Milk, Eggs", this);
    recipeSummary->setStyleSheet("font-size: 14px;");
    QVBoxLayout *recipeLayout = new QVBoxLayout;
    recipeLayout->addWidget(recipeButton);
    recipeLayout->addWidget(recipeSummary);

    QWidget *recipeSection = new QWidget(this);
    recipeSection->setLayout(recipeLayout);
    recipeSection->setStyleSheet("background: #d3d3d3; padding: 10px;");

    // Alerts Section
    alertButton = new QPushButton("Alerts", this);
    alertButton->setStyleSheet("font-size: 16px; font-weight: bold;");
    QLabel *alertSummary = new QLabel("Milk is low (1L)\nMilk expiring (2 Days)\nEggs expiring (5 Days)", this);
    alertSummary->setStyleSheet("font-size: 14px;");
    QVBoxLayout *alertLayout = new QVBoxLayout;
    alertLayout->addWidget(alertButton);
    alertLayout->addWidget(alertSummary);

    QWidget *alertSection = new QWidget(this);
    alertSection->setLayout(alertLayout);
    alertSection->setStyleSheet("background: #d3d3d3; padding: 10px;");

    // Add Sections to Grid Layout
    gridLayout->addWidget(inventorySection, 0, 0);
    gridLayout->addWidget(shoppingListSection, 0, 1);
    gridLayout->addWidget(recipeSection, 1, 0);
    gridLayout->addWidget(alertSection, 1, 1);

    // Progress Bar for Fridge Fullness
    QLabel *progressLabel = new QLabel("60% Full", this);
    progressLabel->setAlignment(Qt::AlignCenter);
    progressLabel->setStyleSheet("font-size: 14px;");
    QProgressBar *progressBar = new QProgressBar(this);
    progressBar->setValue(60);
    progressBar->setTextVisible(false);

    // Add Widgets to Main Layout
    mainLayout->addLayout(navBarLayout);
    mainLayout->addWidget(dateLabel);
    mainLayout->addLayout(gridLayout);
    mainLayout->addWidget(progressLabel);
    mainLayout->addWidget(progressBar);

    homePage->setLayout(mainLayout);
}
void MainWindow::createInventoryPage() {
    inventoryPage = new QWidget(this);
    QVBoxLayout *layout = new QVBoxLayout(inventoryPage);

    // Top Navigation Bar
    QHBoxLayout *navBar = new QHBoxLayout;
    QPushButton *backButton = new QPushButton("< Back", this);
    QPushButton *homeButton = new QPushButton("Home", this);
    QPushButton *settingsButton = new QPushButton("⚙", this);
    settingsButton->setFixedSize(40, 40);

    navBar->addWidget(backButton);
    navBar->addStretch();
    navBar->addWidget(homeButton);
    navBar->addWidget(settingsButton);
    layout->addLayout(navBar);

    // Title
    QLabel *title = new QLabel("Items in Fridge", this);
    title->setAlignment(Qt::AlignCenter);
    title->setStyleSheet("font-size: 24px; font-weight: bold;");
    layout->addWidget(title);

    // Items List
    QListWidget *itemsList = new QListWidget(this);
    itemsList->addItem("Milk (1 L) - Exp: 2 Days");
    itemsList->addItem("Eggs (6 cnt) - Exp: 5 Days");
    itemsList->addItem("Chicken (2 lb) - Exp: 7 Days");
    itemsList->addItem("Carrots (4 cnt) - Exp: 21 Days");
    itemsList->addItem("Butter (200 g) - Exp: 33 Days");
    layout->addWidget(itemsList);

    // Add Item Button
    QPushButton *addItemButton = new QPushButton("+ Add Item", this);
    addItemButton->setStyleSheet("font-size: 16px;");
    layout->addWidget(addItemButton);

    // Connect Navigation Buttons
    connect(backButton, &QPushButton::clicked, this, &MainWindow::showHomePage);
    connect(homeButton, &QPushButton::clicked, this, &MainWindow::showHomePage);
}

void MainWindow::createShoppingListPage() {
    shoppingListPage = new QWidget(this);
    QVBoxLayout *layout = new QVBoxLayout(shoppingListPage);

    QLabel *title = new QLabel("Shopping List Page Placeholder", this);
    title->setAlignment(Qt::AlignCenter);
    title->setStyleSheet("font-size: 24px;");
    layout->addWidget(title);

    QPushButton *backButton = new QPushButton("< Back", this);
    connect(backButton, &QPushButton::clicked, this, &MainWindow::showHomePage);
    layout->addWidget(backButton);
}

void MainWindow::createRecipePage() {
    recipePage = new QWidget(this);
    QVBoxLayout *layout = new QVBoxLayout(recipePage);

    QLabel *title = new QLabel("Recipes Page Placeholder", this);
    title->setAlignment(Qt::AlignCenter);
    title->setStyleSheet("font-size: 24px;");
    layout->addWidget(title);

    QPushButton *backButton = new QPushButton("< Back", this);
    connect(backButton, &QPushButton::clicked, this, &MainWindow::showHomePage);
    layout->addWidget(backButton);
}

void MainWindow::createAlertPage() {
    alertPage = new QWidget(this);
    QVBoxLayout *layout = new QVBoxLayout(alertPage);

    QLabel *title = new QLabel("Alerts Page Placeholder", this);
    title->setAlignment(Qt::AlignCenter);
    title->setStyleSheet("font-size: 24px;");
    layout->addWidget(title);

    QPushButton *backButton = new QPushButton("< Back", this);
    connect(backButton, &QPushButton::clicked, this, &MainWindow::showHomePage);
    layout->addWidget(backButton);
}

// Navigation Slots
void MainWindow::showHomePage() {
    stackedWidget->setCurrentWidget(homePage);
}

void MainWindow::showInventoryPage() {
    stackedWidget->setCurrentWidget(inventoryPage);
}

void MainWindow::showShoppingListPage() {
    stackedWidget->setCurrentWidget(shoppingListPage);
}

void MainWindow::showRecipePage() {
    stackedWidget->setCurrentWidget(recipePage);
}

void MainWindow::showAlertPage() {
    stackedWidget->setCurrentWidget(alertPage);
}
