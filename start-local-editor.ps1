param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$baseUrl = 'http://127.0.0.1:4330'
$editorUrl = "$baseUrl/__local/edit"
$mutex = [Threading.Mutex]::new($false, 'Local\GoudoMahanSiteEditor4330')
$ownsMutex = $false

function Test-Editor {
    try {
        $catalog = Invoke-RestMethod -Uri "$baseUrl/__local/content" -TimeoutSec 2
        return [bool]($catalog | Where-Object { $_.key -eq 'pages' -and $_.file -eq 'src/content/site-pages.json' })
    } catch {
        return $false
    }
}

try {
    $ownsMutex = $mutex.WaitOne(60000)
    if (!$ownsMutex) { throw 'The local editor is still starting.' }
    if (!(Test-Editor)) {
        $astro = Join-Path $root 'node_modules/astro/astro.js'
        if (!(Test-Path -LiteralPath $astro)) {
            throw 'Dependencies are missing. Run pnpm install in the website repository.'
        }
        $node = (Get-Command node.exe).Source
        $log = Join-Path ([IO.Path]::GetTempPath()) 'GoudoMahan-local-editor'
        $server = Start-Process -FilePath $node `
            -ArgumentList @(('"' + $astro + '"'), 'dev', '--host', '127.0.0.1', '--port', '4330') `
            -WorkingDirectory $root -WindowStyle Hidden -PassThru `
            -RedirectStandardOutput "$log.log" -RedirectStandardError "$log.err"
        $deadline = [DateTime]::UtcNow.AddSeconds(55)
        while (!(Test-Editor)) {
            if ($server.HasExited -or [DateTime]::UtcNow -ge $deadline) {
                throw "The local editor could not start. See $log.log and $log.err."
            }
            Start-Sleep -Milliseconds 500
        }
    }
} finally {
    if ($ownsMutex) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}

if ($NoBrowser) { Write-Output $editorUrl }
else { Start-Process $editorUrl }
