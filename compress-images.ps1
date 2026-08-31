# One-off image optimizer: re-encodes gallery JPEGs at quality 80 and caps
# the longest side at 1600px (well above what any card in the layout displays).
# Run once, then delete this script if you like.

Add-Type -AssemblyName System.Drawing

$maxDim = 1280
$quality = 72L
$root = "C:\Users\zaheen\claude\alpha-creations-website\assets"

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)

$totalBefore = 0
$totalAfter = 0

Get-ChildItem "$root\*.jpg" | ForEach-Object {
  $before = $_.Length
  $img = [System.Drawing.Image]::FromFile($_.FullName)

  $w = $img.Width
  $h = $img.Height
  if ($w -gt $maxDim -or $h -gt $maxDim) {
    $scale = [math]::Min($maxDim / $w, $maxDim / $h)
    $w = [int]($w * $scale)
    $h = [int]($h * $scale)
  }

  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $w, $h)
  $g.Dispose()
  $img.Dispose()

  $tmpPath = $_.FullName + ".tmp"
  $bmp.Save($tmpPath, $jpegCodec, $encoderParams)
  $bmp.Dispose()

  Move-Item -Force $tmpPath $_.FullName
  $after = (Get-Item $_.FullName).Length

  $totalBefore += $before
  $totalAfter += $after
  "{0}: {1} KB -> {2} KB" -f $_.Name, [math]::Round($before/1KB), [math]::Round($after/1KB)
}

"---"
"Total: {0} KB -> {1} KB ({2}% smaller)" -f [math]::Round($totalBefore/1KB), [math]::Round($totalAfter/1KB), [math]::Round((1 - $totalAfter/$totalBefore)*100)
