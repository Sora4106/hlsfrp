param([int]$Port = 4173)

$ErrorActionPreference = "Stop"
$projectPath = (Get-Location).Path
$outputPath = Join-Path $projectPath "research/verification"
$profilePath = Join-Path $outputPath "chrome-profile"
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
New-Item -ItemType Directory -Path $profilePath -Force | Out-Null

$server = Start-Process -FilePath python -ArgumentList @("-m", "http.server", $Port, "--bind", "127.0.0.1") -WorkingDirectory $projectPath -PassThru -WindowStyle Hidden
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

function Capture-Page([string]$Name, [string]$Size, [string]$Url) {
    $screenshotPath = Join-Path $outputPath "$Name.png"
    $captureProfile = Join-Path $profilePath $Name
    New-Item -ItemType Directory -Path $captureProfile -Force | Out-Null
    $arguments = @(
        "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
        "--virtual-time-budget=2200", "--user-data-dir=$captureProfile",
        "--window-size=$Size", "--screenshot=$screenshotPath", $Url
    )
    $capture = Start-Process -FilePath $chrome -ArgumentList $arguments -PassThru -Wait -WindowStyle Hidden
    if ($capture.ExitCode -ne 0 -or -not (Test-Path $screenshotPath)) {
        throw "Screenshot failed: $Name"
    }
}

try {
    Start-Sleep -Seconds 2
    $baseUrl = "http://127.0.0.1:$Port"
    Capture-Page "home-desktop" "1440,1200" "$baseUrl/#/home"
    Capture-Page "products-mobile" "390,844" "$baseUrl/#/products"
    Capture-Page "product-desktop" "1440,1200" "$baseUrl/#/product/feed-system"
    Capture-Page "contact-desktop" "1440,1200" "$baseUrl/#/contact"
    Capture-Page "about-desktop" "1440,1200" "$baseUrl/#/about"
    Capture-Page "news-desktop" "1440,1200" "$baseUrl/#/news"
    Capture-Page "article-mobile" "390,844" "$baseUrl/#/news/21"
    Write-Host "Rendered seven representative desktop and mobile routes successfully."
} finally {
    if ($server -and -not $server.HasExited) {
        Stop-Process -Id $server.Id
    }
}
