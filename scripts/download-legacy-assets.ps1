param(
    [string]$ManifestPath = "research/legacy/manifest.json",
    [string]$OutputDirectory = "public/assets/legacy"
)

$ErrorActionPreference = "Stop"
$manifest = Get-Content -Raw -Encoding UTF8 $ManifestPath | ConvertFrom-Json
$outputPath = Join-Path (Get-Location) $OutputDirectory
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$session.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36"
$assets = @($manifest.assets | Where-Object { $_ -match "pic30\.websiteonline\.cn/upload/" })
$downloaded = 0

foreach ($assetUrl in $assets) {
    $uri = [Uri]$assetUrl
    $fileName = [Uri]::UnescapeDataString([System.IO.Path]::GetFileName($uri.AbsolutePath))
    $destination = Join-Path $outputPath $fileName
    $downloadUrl = $assetUrl -replace '^https?://[^/]+', 'http://www.hlsfrp.com'
    try {
        Invoke-WebRequest -UseBasicParsing -Uri $downloadUrl -WebSession $session -Headers @{ Referer = "http://www.hlsfrp.com/" } -OutFile $destination -TimeoutSec 60
        $downloaded++
        Write-Host "OK  $fileName"
    } catch {
        Write-Warning "FAIL $assetUrl : $($_.Exception.Message)"
    }
}

Write-Host "Downloaded $downloaded of $($assets.Count) legacy assets."
