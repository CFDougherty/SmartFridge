#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QStackedWidget>
#include <QPushButton>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QLabel>
#include <QListWidget>
#include <QWidget>
#include <QProgressBar>

class MainWindow : public QMainWindow {
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void showHomePage();
    void showInventoryPage();
    void showShoppingListPage();
    void showRecipePage();
    void showAlertPage();

private:
    void createHomePage();
    void createInventoryPage();
    void createShoppingListPage();
    void createRecipePage();
    void createAlertPage();

    QStackedWidget *stackedWidget;

    QWidget *homePage;
    QWidget *inventoryPage;
    QWidget *shoppingListPage;
    QWidget *recipePage;
    QWidget *alertPage;

    QPushButton *inventoryButton;
    QPushButton *shoppingListButton;
    QPushButton *recipeButton;
    QPushButton *alertButton;
};

#endif // MAINWINDOW_H
