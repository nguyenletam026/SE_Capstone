# Test script to verify withdrawal balance deduction functionality
$baseUrl = "http://localhost:8080"

# Test parameters - replace with actual doctor token
$doctorToken = "YOUR_DOCTOR_TOKEN_HERE"

Write-Host "🏥 Testing Withdrawal Balance Deduction System" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Gray

# Step 1: Get doctor's current balance
Write-Host "`n📊 Step 1: Getting doctor's current balance..." -ForegroundColor Yellow
try {
    $balanceResponse = Invoke-RestMethod -Uri "$baseUrl/api/doctor-earnings/stats" -Method GET -Headers @{
        "Authorization" = "Bearer $doctorToken"
        "Content-Type" = "application/json"
    }
    
    $initialBalance = $balanceResponse.currentBalance
    Write-Host "Initial Available Balance: $initialBalance VND" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting balance: $($_.Exception.Message)" -ForegroundColor Red
    $initialBalance = 0
}

# Step 2: Create a withdrawal request
Write-Host "`n🏦 Step 2: Creating withdrawal request..." -ForegroundColor Yellow
$withdrawalData = @{
    amount = 50000
    bankName = "Vietcombank"
    accountNumber = "1234567890"
    accountHolderName = "Test Doctor"
    note = "Test withdrawal for balance deduction"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/api/withdrawal/create" -Method POST -Headers @{
        "Authorization" = "Bearer $doctorToken"
        "Content-Type" = "application/json"
    } -Body $withdrawalData
    
    Write-Host "✅ Withdrawal request created successfully!" -ForegroundColor Green
    Write-Host "Request ID: $($createResponse.id)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creating withdrawal: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

# Step 3: Check balance after withdrawal request
Write-Host "`n🔍 Step 3: Checking balance after withdrawal request..." -ForegroundColor Yellow
try {    $newBalanceResponse = Invoke-RestMethod -Uri "$baseUrl/api/doctor-earnings/stats" -Method GET -Headers @{
        "Authorization" = "Bearer $doctorToken"
        "Content-Type" = "application/json"
    }
    
    $newBalance = $newBalanceResponse.currentBalance
    $difference = $initialBalance - $newBalance
    
    Write-Host "New Available Balance: $newBalance VND" -ForegroundColor Green
    Write-Host "Balance Difference: $difference VND" -ForegroundColor Cyan
    
    if ($difference -eq 50000) {
        Write-Host "✅ SUCCESS: Balance was correctly deducted!" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: Balance was not deducted correctly!" -ForegroundColor Red
        Write-Host "Expected deduction: 50000 VND, Actual: $difference VND" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error getting updated balance: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Get withdrawal requests to verify status
Write-Host "`n📋 Step 4: Getting withdrawal requests..." -ForegroundColor Yellow
try {
    $withdrawalsResponse = Invoke-RestMethod -Uri "$baseUrl/api/withdrawal/doctor" -Method GET -Headers @{
        "Authorization" = "Bearer $doctorToken"
        "Content-Type" = "application/json"
    }
    
    if ($withdrawalsResponse -and $withdrawalsResponse.Count -gt 0) {
        $latestWithdrawal = $withdrawalsResponse[0]
        Write-Host "Latest Withdrawal Status: $($latestWithdrawal.status)" -ForegroundColor Cyan
        Write-Host "Amount: $($latestWithdrawal.amount) VND" -ForegroundColor Cyan
        Write-Host "Created: $($latestWithdrawal.requestedAt)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error getting withdrawals: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Test Completed!" -ForegroundColor Cyan
Write-Host "Note: Replace 'YOUR_DOCTOR_TOKEN_HERE' with a valid doctor JWT token" -ForegroundColor Gray
