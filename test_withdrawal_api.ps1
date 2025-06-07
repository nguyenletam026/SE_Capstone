# Test script to check withdrawal API response
$baseUrl = "http://localhost:8080"
$endpoint = "/api/withdrawal/admin/all"

# Test API call
Write-Host "Testing withdrawal API endpoint: $endpoint" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method GET -Headers @{
        "Authorization" = "Bearer YOUR_TOKEN_HERE"
        "Content-Type" = "application/json"
    }
    
    Write-Host "API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    
    if ($response -and $response.result) {
        Write-Host "`nFirst withdrawal record doctor info:" -ForegroundColor Cyan
        $firstRecord = $response.result[0]
        Write-Host "Doctor Name: $($firstRecord.doctorName)"
        Write-Host "Doctor Email: $($firstRecord.doctorEmail)"
        Write-Host "Doctor Phone: $($firstRecord.doctorPhone)"
        Write-Host "Doctor Specialty: $($firstRecord.doctorSpecialty)"
    }
} catch {
    Write-Host "Error calling API: $($_.Exception.Message)" -ForegroundColor Red
}
