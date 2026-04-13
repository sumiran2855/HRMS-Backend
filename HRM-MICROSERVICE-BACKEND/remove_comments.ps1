$services = @('auth-service', 'employee-service', 'attendance-service')
$basePath = "d:\Sandeep_Data\hrms\HRM-MICROSERVICE-BACKEND\services"

foreach ($service in $services) {
    $srcPath = Join-Path $basePath $service "src"
    Get-ChildItem -Path $srcPath -Recurse -Filter "*.ts" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        
        # Remove multi-line comments
        $content = $content -replace '/\*[\s\S]*?\*/', ''
        
        # Remove single-line comments but preserve code on the line
        $content = $content -replace '\s+//.*$', '', 'Multiline'
        
        # Remove empty lines created by comment removal
        $content = $content -replace '^\s*\n', '', 'Multiline'
        
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Cleaned: $($_.FullName)"
    }
}

# Also clean .proto files
$protoPath = Join-Path $basePath ".." "services" "proto"
Get-ChildItem -Path $protoPath -Filter "*.proto" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Remove multi-line comments
    $content = $content -replace '/\*[\s\S]*?\*/', ''
    
    # Remove single-line comments but preserve code on the line
    $content = $content -replace '\s+//.*$', '', 'Multiline'
    
    # Remove empty lines created by comment removal
    $content = $content -replace '^\s*\n', '', 'Multiline'
    
    Set-Content $_.FullName -Value $content -NoNewline
    Write-Host "Cleaned: $($_.FullName)"
}

Write-Host "Done!"
