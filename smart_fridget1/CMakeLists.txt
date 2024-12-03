cmake_minimum_required(VERSION 3.16)

project(smart_fridget1 VERSION 0.1 LANGUAGES CXX)

set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(QT NAMES Qt6 Qt5 REQUIRED COMPONENTS Widgets Test)  # Add Test module
find_package(Qt${QT_VERSION_MAJOR} REQUIRED COMPONENTS Widgets Test)  # Add Test module

set(PROJECT_SOURCES
        main.cpp
        mainwindow.cpp
        mainwindow.h
        mainwindow.ui
)

if(${QT_VERSION_MAJOR} GREATER_EQUAL 6)
    qt_add_executable(smart_fridget1
        MANUAL_FINALIZATION
        ${PROJECT_SOURCES}
        mainwindow_test.cpp
        mainwindow_test.cpp
    )
else()
    if(ANDROID)
        add_library(smart_fridget1 SHARED
            ${PROJECT_SOURCES}
        )
    else()
        add_executable(smart_fridget1
            ${PROJECT_SOURCES}
        )
    endif()
endif()

target_link_libraries(smart_fridget1 PRIVATE Qt${QT_VERSION_MAJOR}::Widgets)

if(${QT_VERSION} VERSION_LESS 6.1.0)
  set(BUNDLE_ID_OPTION MACOSX_BUNDLE_GUI_IDENTIFIER com.example.smart_fridget1)
endif()
set_target_properties(smart_fridget1 PROPERTIES
    ${BUNDLE_ID_OPTION}
    MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
    MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
    MACOSX_BUNDLE TRUE
    WIN32_EXECUTABLE TRUE
)

include(GNUInstallDirs)
install(TARGETS smart_fridget1
    BUNDLE DESTINATION .
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

if(QT_VERSION_MAJOR EQUAL 6)
    qt_finalize_executable(smart_fridget1)
endif()

# ---------------------------
# Unit Testing Configuration
# ---------------------------
if(BUILD_TESTING)
    enable_testing()

    set(TEST_SOURCES
        mainwindow_test.cpp  # Your test file
    )

    add_executable(tests ${TEST_SOURCES})
    target_link_libraries(tests PRIVATE Qt${QT_VERSION_MAJOR}::Test Qt${QT_VERSION_MAJOR}::Widgets)

    add_test(NAME UnitTests COMMAND tests)  # Add the test to CTest
endif()
