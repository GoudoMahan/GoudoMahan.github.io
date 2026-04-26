Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frosti 开发启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] 正在构建搜索索引: pnpm run search:index" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
pnpm run search:index
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 搜索索引构建失败!" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}
Write-Host ""
Write-Host "✅ 搜索索引构建完成!" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] 正在启动开发服务器: pnpm run dev" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "开发服务器启动中..."

$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    pnpm run dev
}

Write-Host "等待服务器启动中..." -ForegroundColor Gray
$maxAttempts = 20
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    Start-Sleep -Seconds 1
    $attempt++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4321/" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
        }
    }
    catch {
        Write-Host "  等待中... (${attempt}/${maxAttempts})" -ForegroundColor Gray
    }
}

if (-not $serverReady) {
    Write-Host ""
    Write-Host "⚠️  服务器可能还在启动中，尝试直接打开浏览器..." -ForegroundColor Yellow
}
else {
    Write-Host ""
    Write-Host "✅ 开发服务器启动成功!" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/3] 正在打开浏览器: http://localhost:4321/" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Start-Process "http://localhost:4321/"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 开发环境已启动!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "开发服务器正在后台运行" -ForegroundColor Gray
Write-Host "访问地址: http://localhost:4321/" -ForegroundColor Cyan
Write-Host ""
Read-Host "按 Enter 键关闭此窗口 (不会关闭开发服务器)"
