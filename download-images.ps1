# ============================================================================
#  MyChromebook.pk - save the partner logos and photos from the old site
#  Run ONCE from the chromebook folder, in the Antigravity terminal:
#      powershell -ExecutionPolicy Bypass -File download-images.ps1
# ============================================================================
$ErrorActionPreference = "Continue"
New-Item -ItemType Directory -Force -Path "assets/partners" | Out-Null
$files = @(
  @("https://mychromebook.pk/wp-content/uploads/2025/06/Allied-Logo-scaled.png", "assets/partners/Allied-Logo-scaled.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/06/Asset-2-scaled.png", "assets/partners/Asset-2-scaled.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/06/GfE-Partner-Badges-Horizontal-Png-e1751278630886.png", "assets/partners/GfE-Partner-Badges-Horizontal-Png-e1751278630886.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/06/Google_Cloud_Partner_outline_horizontal-e1751278555230.png", "assets/partners/Google_Cloud_Partner_outline_horizontal-e1751278555230.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/06/NRTC-Logo-new-copy1.png", "assets/partners/NRTC-Logo-new-copy1.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/07/TMUC-logo-3-e1619011518621.jpg", "assets/partners/TMUC-logo-3-e1619011518621.jpg"),
  @("https://mychromebook.pk/wp-content/uploads/2025/06/ali-khan-3.jpg", "assets/partners/ali-khan-3.jpg"),
  @("https://mychromebook.pk/wp-content/uploads/2025/11/beaconhouse-logo-2.png", "assets/partners/beaconhouse-logo-2.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/06/ctl.png", "assets/partners/ctl.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/07/government-of-pakistan-logo.png", "assets/partners/government-of-pakistan-logo.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/07/j0lZtHFe_400x400.jpg", "assets/partners/j0lZtHFe_400x400.jpg"),
  @("https://mychromebook.pk/wp-content/uploads/2025/07/miuc-logo-1.png", "assets/partners/miuc-logo-1.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/11/unnamed-1-e1763018898717.png", "assets/partners/unnamed-1-e1763018898717.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/11/unnamed-2.png", "assets/partners/unnamed-2.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/11/unnamed-3.png", "assets/partners/unnamed-3.png"),
  @("https://mychromebook.pk/wp-content/uploads/2025/07/unnamed.jpg", "assets/partners/unnamed.jpg")
)
$ok = 0; $bad = 0
foreach ($f in $files) {
  try {
    Invoke-WebRequest -Uri $f[0] -OutFile $f[1] -UseBasicParsing -ErrorAction Stop
    Write-Host ("  saved   " + $f[1]) -ForegroundColor Green; $ok++
  } catch {
    Write-Host ("  FAILED  " + $f[0]) -ForegroundColor Red; $bad++
  }
}
Write-Host ""
Write-Host ("Done: " + $ok + " saved, " + $bad + " failed.")
