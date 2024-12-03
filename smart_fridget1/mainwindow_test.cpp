#include <QtTest/QtTest>
#include "mainwindow.h"

class MainWindowTest : public QObject {
    Q_OBJECT

private slots:
    void testNavigationToInventoryPage();
    void testNavigationToHomePage();
};

void MainWindowTest::testNavigationToInventoryPage() {
    MainWindow mainWindow;
    mainWindow.showInventoryPage();
    QVERIFY(mainWindow.centralWidget() == mainWindow.inventoryPage);
}

void MainWindowTest::testNavigationToHomePage() {
    MainWindow mainWindow;
    mainWindow.showHomePage();
    QVERIFY(mainWindow.centralWidget() == mainWindow.homePage);
}

QTEST_MAIN(MainWindowTest)
#include "mainwindow_test.moc"
