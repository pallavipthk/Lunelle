Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\Gyanprakash Pathak\.gemini\antigravity-ide\brain\9e91fe15-9c5a-4dde-873e-45bac5a8d8cf\.user_uploaded\media_1792875228130.png"
$destPath = "c:\Users\Gyanprakash Pathak\Downloads\Lunelle\public\assets\hero_woman_exact.png"

if (Test-Path $sourcePath) {
    $srcImg = [System.Drawing.Image]::FromFile($sourcePath)
    Write-Output "Source Dimensions: $($srcImg.Width) x $($srcImg.Height)"
    
    # In media_1792875228130.png (646 x 697):
    # The woman with tea mug & flowers is in the top-right hero area:
    # X approx 240 to 646, Y approx 30 to 300
    # Let's crop X=230, Y=25, Width=416, Height=270
    $cropRect = New-Object System.Drawing.Rectangle(230, 25, 416, 270)
    
    $bmp = New-Object System.Drawing.Bitmap($cropRect.Width, $cropRect.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $cropRect.Width, $cropRect.Height)
    $graphics.DrawImage($srcImg, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bmp.Dispose()
    $srcImg.Dispose()
    
    Write-Output "Successfully cropped and saved exact woman image to $destPath"
} else {
    Write-Output "Source file not found: $sourcePath"
}
