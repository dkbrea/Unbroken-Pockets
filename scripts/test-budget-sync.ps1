# PowerShell script to test budget syncing functionality
# 
# Usage:
#   .\scripts\test-budget-sync.ps1 [action] [transactionId] [categoryId]
# 
# Where:
#   - action: 'mark', 'unmark', 'verify', or 'delete'
#   - transactionId: The ID of the transaction to test
#   - categoryId: (Only required for 'mark' action) The budget category ID
# 
# Examples:
#   .\scripts\test-budget-sync.ps1 mark 123 456
#   .\scripts\test-budget-sync.ps1 unmark 123
#   .\scripts\test-budget-sync.ps1 verify 123
#   .\scripts\test-budget-sync.ps1 delete 123

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("mark", "unmark", "verify", "delete")]
    [string]$action,
    
    [Parameter(Mandatory=$true)]
    [int]$transactionId,
    
    [Parameter(Mandatory=$false)]
    [int]$categoryId
)

# Validate inputs
if ($action -eq "mark" -and $categoryId -le 0) {
    Write-Error "Category ID must be a positive number for mark action"
    exit 1
}

# Prepare request body
$body = @{
    action = $action
    transactionId = $transactionId
}

if ($action -eq "mark") {
    $body.categoryId = $categoryId
}

# Convert to JSON
$jsonBody = $body | ConvertTo-Json

try {
    # Make the API call
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/debug/test-budget-sync" `
                                  -Method Post `
                                  -ContentType "application/json" `
                                  -Body $jsonBody `
                                  -ErrorAction Stop

    # Display results
    Write-Host "== Test Results ==" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 4
    
    # For verification, provide a more readable summary
    if ($action -eq "verify") {
        Write-Host "`n== Summary ==" -ForegroundColor Cyan
        $transaction = $response.result.transaction
        $budgetTransaction = $response.result.budgetTransaction
        $budgetEntry = $response.result.budgetEntry
        
        Write-Host "Transaction $transactionId" -ForegroundColor Yellow
        Write-Host "- is_budget_expense: $($transaction.is_budget_expense)"
        Write-Host "- budget_category_id: $(if ($transaction.budget_category_id) { $transaction.budget_category_id } else { 'null' })"
        
        if ($budgetTransaction) {
            Write-Host "`nBudget Transaction" -ForegroundColor Yellow
            Write-Host "- id: $($budgetTransaction.id)"
            Write-Host "- category_id: $($budgetTransaction.category_id)"
            Write-Host "- amount: $($budgetTransaction.amount)"
        } else {
            Write-Host "`nNo budget transaction found" -ForegroundColor Yellow
        }
        
        if ($budgetEntry) {
            Write-Host "`nBudget Entry" -ForegroundColor Yellow
            Write-Host "- id: $($budgetEntry.id)"
            Write-Host "- category_id: $($budgetEntry.category_id)"
            Write-Host "- month: $($budgetEntry.month)"
            Write-Host "- allocated: $($budgetEntry.allocated)"
            Write-Host "- spent: $($budgetEntry.spent)"
        } else {
            Write-Host "`nNo budget entry found" -ForegroundColor Yellow
        }
        
        # Check for issues
        if ($transaction.is_budget_expense -and $transaction.budget_category_id) {
            if (-not $budgetTransaction) {
                Write-Host "`n⚠️ ISSUE: Transaction is marked as budget expense but no budget transaction exists" -ForegroundColor Red
            }
            if (-not $budgetEntry) {
                Write-Host "`n⚠️ ISSUE: Transaction is marked as budget expense but no budget entry exists" -ForegroundColor Red
            }
        } elseif (-not $transaction.is_budget_expense -and $budgetTransaction) {
            Write-Host "`n⚠️ ISSUE: Transaction is not marked as budget expense but a budget transaction exists" -ForegroundColor Red
        }
    }
    elseif ($action -eq "delete") {
        Write-Host "`n== Deletion Summary ==" -ForegroundColor Cyan
        $categoryInfo = $response.result.categoryInfo
        $deletedTransaction = $response.result.transaction
        $updatedEntry = $response.result.updatedEntry
        
        Write-Host "Deleted Transaction" -ForegroundColor Yellow
        Write-Host "- id: $transactionId"
        Write-Host "- budget_category_id: $(if ($deletedTransaction.budget_category_id) { $deletedTransaction.budget_category_id } else { 'null' })"
        Write-Host "- amount: $($deletedTransaction.amount)"
        
        if ($updatedEntry) {
            Write-Host "`nBudget Entry (After Deletion)" -ForegroundColor Yellow
            Write-Host "- id: $($updatedEntry.id)"
            Write-Host "- category_id: $($updatedEntry.category_id)"
            Write-Host "- spent: $($updatedEntry.spent)"
            Write-Host "- allocated: $($updatedEntry.allocated)"
        } else {
            Write-Host "`nNo budget entry updated" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} 