$ErrorActionPreference = 'Stop'
        try {
            $resp = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/login" -Body '{"email":"finaltest@example.com","password":"password123"}' -ContentType "application/json"
            $token = $resp.token
            $userId = $resp.user.id
            Write-Output "Got token for userId: $userId"
            
            $applyBody = @{
                businessName = "Final Services"
                description = "Test"
                categoryId = "Cleaning"
                subCategoryId = "Home Cleaning"
                services = @("Deep Cleaning")
                experienceYears = 3
                pincode = "400001"
                city = "Mumbai"
                area = "Andheri"
                userId = $userId
            } | ConvertTo-Json
            
            $applyResp = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/providers/apply" -Headers @{Authorization="Bearer $token"} -Body $applyBody -ContentType "application/json"
            Write-Output "Success:"
            $applyResp | ConvertTo-Json
        } catch {
            Write-Output "Failed: $_"
            if ($_.ErrorDetails) {
                Write-Output "Details: $($_.ErrorDetails.Message)"
            }
        }
