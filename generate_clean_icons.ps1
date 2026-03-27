
Add-Type -AssemblyName System.Drawing

function Process-Image {
    param (
        [string]$SourcePath,
        [string]$DestPath,
        [int]$Size,
        [bool]$Crop
    )

    $sourceImage = [System.Drawing.Image]::FromFile($SourcePath)
    
    # Dimensions of the original image
    $origW = $sourceImage.Width
    $origH = $sourceImage.Height

    # Define Crop Area (Heuristic: Top Square-ish region to exclude bottom text)
    # Original is 3508x2481. 
    # We want to keep the logo which is likely in the center-top.
    # Let's crop a square from the top center.
    # We'll estimate the logo size is about 1600x1600 based on standard aspect ratios of logo+text.
    
    $cropSize = 1600
    $cropX = ($origW - $cropSize) / 2
    $cropY = 100 # Slight top padding offset, assume logo isn't touching the very top edge

    if ($Crop) {
        # Create a temp bitmap for the cropped section
        $croppedBitmap = New-Object System.Drawing.Bitmap($cropSize, $cropSize)
        $cropGraphics = [System.Drawing.Graphics]::FromImage($croppedBitmap)
        $cropGraphics.DrawImage($sourceImage, 
            (New-Object System.Drawing.Rectangle(0, 0, $cropSize, $cropSize)), 
            (New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)), 
            [System.Drawing.GraphicsUnit]::Pixel)
        $cropGraphics.Dispose()
        
        # Now resize this cropped bitmap to the destination size
        $finalImage = New-Object System.Drawing.Bitmap($Size, $Size)
        $graphics = [System.Drawing.Graphics]::FromImage($finalImage)
        
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $graphics.DrawImage($croppedBitmap, 0, 0, $Size, $Size)
        
        $finalImage.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $graphics.Dispose()
        $finalImage.Dispose()
        $croppedBitmap.Dispose()
    } else {
        # Just resize without crop (if ever needed, but we are cropping everywhere here)
        # ... logic omitted as we are focusing on cropping ...
    }

    $sourceImage.Dispose()
    Write-Host "Created $DestPath"
}

$sourceFile = "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\mms-logo.png"

# Generate cropped and resized icons
Process-Image -SourcePath $sourceFile -DestPath "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\pwa-192x192.png" -Size 192 -Crop $true
Process-Image -SourcePath $sourceFile -DestPath "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\pwa-512x512.png" -Size 512 -Crop $true
Process-Image -SourcePath $sourceFile -DestPath "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\apple-touch-icon.png" -Size 180 -Crop $true

# For favicon, we usually want .ico format, but png is often fine. 
# System.Drawing saves as PNG by default with the above code.
# Let's save a small PNG for favicon and rename/convert if needed or just use png.
# To save as literal .ico requires specific encoder or just using png for modern browsers.
# We'll Stick to PNG for favicon.ico path but write PNG bytes (Modern browsers handle this, but to be safe let's output a png and user can update link, OR just overwrite favicon.ico with png content which often works or use a specific ico saver)
# Simplest: Save as favicon.ico but it's a PNG. Most browsers accept this.
Process-Image -SourcePath $sourceFile -DestPath "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\favicon.ico" -Size 64 -Crop $true
