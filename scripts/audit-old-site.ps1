param(
    [string]$BaseUrl = "http://www.hlsfrp.com",
    [string]$OutputDirectory = "research/legacy"
)

$ErrorActionPreference = "Stop"
$outputPath = Join-Path (Get-Location) $OutputDirectory
$pagesPath = Join-Path $outputPath "pages"
New-Item -ItemType Directory -Path $pagesPath -Force | Out-Null

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$session.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36"

$seedPaths = @(
    "/", "/page1", "/page78", "/page80", "/page81", "/page82", "/page83",
    "/page90", "/page91", "/page92", "/page93", "/page94", "/page95", "/page97",
    "/page96", "/page98", "/page99", "/page100", "/page101", "/page102", "/page144", "/page145", "/page146"
)

$queue = [System.Collections.Generic.Queue[string]]::new()
$seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($path in $seedPaths) {
    $queue.Enqueue("$BaseUrl$path" + "?_l=zh_CN")
    $queue.Enqueue("$BaseUrl$path" + "?_l=en")
}
for ($articleId = 1; $articleId -le 21; $articleId++) {
    $queue.Enqueue("$BaseUrl/page82?article_id=$articleId&_l=zh_CN")
    $queue.Enqueue("$BaseUrl/page82?article_id=$articleId&_l=en")
}

$records = [System.Collections.Generic.List[object]]::new()
$assetUrls = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

function Resolve-SiteUrl([string]$value, [string]$pageUrl) {
    if ([string]::IsNullOrWhiteSpace($value) -or $value.StartsWith("data:") -or $value.StartsWith("javascript:")) {
        return $null
    }
    try {
        return ([Uri]::new([Uri]$pageUrl, [System.Net.WebUtility]::HtmlDecode($value))).AbsoluteUri
    } catch {
        return $null
    }
}

while ($queue.Count -gt 0) {
    $urlBuilder = [UriBuilder]$queue.Dequeue()
    $urlBuilder.Fragment = ""
    $url = $urlBuilder.Uri.AbsoluteUri
    if (-not $seen.Add($url)) { continue }

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $url -WebSession $session -TimeoutSec 45
        $html = $response.Content
        $title = [regex]::Match($html, "<title[^>]*>(.*?)</title>", "IgnoreCase,Singleline").Groups[1].Value

        $withoutNoise = [regex]::Replace($html, "<(script|style|noscript)[^>]*>.*?</\1>", " ", "IgnoreCase,Singleline")
        $textContent = [regex]::Replace($withoutNoise, "<[^>]+>", " ")
        $textContent = [System.Net.WebUtility]::HtmlDecode($textContent)
        $textContent = [regex]::Replace($textContent, "\s+", " ").Trim()

        $safeName = [regex]::Replace(([Uri]$url).PathAndQuery.TrimStart("/"), "[^a-zA-Z0-9._-]", "_")
        if ([string]::IsNullOrWhiteSpace($safeName)) { $safeName = "index" }
        $pageFile = Join-Path $pagesPath "$safeName.html"
        [System.IO.File]::WriteAllText($pageFile, $html, [System.Text.UTF8Encoding]::new($false))

        foreach ($match in [regex]::Matches($html, '(?:href|src|data-src|data-original|poster)\s*=\s*[''"]([^''"]+)[''"]', "IgnoreCase")) {
            $resolved = Resolve-SiteUrl $match.Groups[1].Value $url
            if (-not $resolved) { continue }
            $uri = [Uri]$resolved
            if ($resolved -match "(?i)\.(?:avif|gif|ico|jpe?g|png|svg|webp)(?:\?|$)") {
                [void]$assetUrls.Add($resolved)
            }
        }
        foreach ($match in [regex]::Matches($html, 'url\(\s*[''"]?([^)''"]+)[''"]?\s*\)', "IgnoreCase")) {
            $resolved = Resolve-SiteUrl $match.Groups[1].Value $url
            if ($resolved -and $resolved -match "(?i)\.(?:avif|gif|ico|jpe?g|png|svg|webp)(?:\?|$)") {
                [void]$assetUrls.Add($resolved)
            }
        }

        $records.Add([pscustomobject]@{
            url = $url
            status = $response.StatusCode
            title = [System.Net.WebUtility]::HtmlDecode($title)
            text = $textContent
            htmlFile = $pageFile.Substring((Get-Location).Path.Length + 1).Replace("\", "/")
        })
        Write-Host "OK  $url"
    } catch {
        $records.Add([pscustomobject]@{
            url = $url
            status = 0
            title = ""
            text = ""
            error = $_.Exception.Message
        })
        Write-Warning "FAIL $url : $($_.Exception.Message)"
    }
}

$manifest = [pscustomobject]@{
    auditedAt = (Get-Date).ToString("o")
    baseUrl = $BaseUrl
    pages = $records
    assets = @($assetUrls | Sort-Object)
}
$manifest | ConvertTo-Json -Depth 6 | Set-Content -Path (Join-Path $outputPath "manifest.json") -Encoding utf8
Write-Host "Audited $($records.Count) pages and found $($assetUrls.Count) image assets."
