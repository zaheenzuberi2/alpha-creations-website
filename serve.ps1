$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootFull = [System.IO.Path]::GetFullPath($root)
$port = 8845
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"

$mime = @{
  ".html" = "text/html"
  ".css"  = "text/css"
  ".js"   = "application/javascript"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".ico"  = "image/x-icon"
}

$securityHeaders = @{
  "Content-Security-Policy" = "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://bpcppbohpubspgskoogp.supabase.co; frame-src https://www.google.com; connect-src 'self' https://bpcppbohpubspgskoogp.supabase.co; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'"
  "X-Content-Type-Options"  = "nosniff"
  "X-Frame-Options"         = "SAMEORIGIN"
  "Referrer-Policy"         = "strict-origin-when-cross-origin"
  "Permissions-Policy"      = "geolocation=(), microphone=(), camera=()"
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    foreach ($h in $securityHeaders.Keys) { $res.Headers.Add($h, $securityHeaders[$h]) }

    $path = [System.Uri]::UnescapeDataString($req.Url.LocalPath)
    if ($path -eq "/") { $path = "/index.html" }
    $candidate = Join-Path $root ($path.TrimStart("/"))
    $fullCandidate = [System.IO.Path]::GetFullPath($candidate)

    # Path-traversal guard: the resolved path must stay inside $rootFull.
    if (-not $fullCandidate.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
      $res.StatusCode = 403
      $msg = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    elseif (Test-Path $fullCandidate -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($fullCandidate)
      $ct = $mime[$ext]
      if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($fullCandidate)
      $res.ContentType = $ct
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    $res.OutputStream.Close()
  }
  catch {
    Write-Host "Request error: $_"
    try { $res.OutputStream.Close() } catch {}
  }
}
