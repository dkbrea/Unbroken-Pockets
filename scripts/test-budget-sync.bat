@echo off
REM Batch script to test budget syncing functionality
REM
REM Usage:
REM   test-budget-sync.bat [action] [transactionId] [categoryId]
REM
REM Where:
REM   - action: 'mark', 'unmark', 'verify', or 'delete'
REM   - transactionId: The ID of the transaction to test
REM   - categoryId: (Only required for 'mark' action) The budget category ID
REM
REM Examples:
REM   test-budget-sync.bat mark 123 456
REM   test-budget-sync.bat unmark 123
REM   test-budget-sync.bat verify 123
REM   test-budget-sync.bat delete 123

if "%1"=="" (
    echo Error: Missing action parameter
    echo Usage: test-budget-sync.bat [action] [transactionId] [categoryId]
    exit /b 1
)

if "%2"=="" (
    echo Error: Missing transactionId parameter
    echo Usage: test-budget-sync.bat [action] [transactionId] [categoryId]
    exit /b 1
)

set ACTION=%1
set TRANSACTION_ID=%2
set CATEGORY_ID=%3

if not "%ACTION%"=="mark" if not "%ACTION%"=="unmark" if not "%ACTION%"=="verify" if not "%ACTION%"=="delete" (
    echo Error: Action must be 'mark', 'unmark', 'verify', or 'delete'
    exit /b 1
)

if "%ACTION%"=="mark" if "%CATEGORY_ID%"=="" (
    echo Error: CategoryId is required for 'mark' action
    exit /b 1
)

echo Testing %ACTION% action for transaction ID %TRANSACTION_ID%...

if "%ACTION%"=="mark" (
    curl -X POST http://localhost:3000/api/debug/test-budget-sync ^
         -H "Content-Type: application/json" ^
         -d "{\"action\":\"%ACTION%\",\"transactionId\":%TRANSACTION_ID%,\"categoryId\":%CATEGORY_ID%}"
) else (
    curl -X POST http://localhost:3000/api/debug/test-budget-sync ^
         -H "Content-Type: application/json" ^
         -d "{\"action\":\"%ACTION%\",\"transactionId\":%TRANSACTION_ID%}"
)

echo.
echo Test completed. 