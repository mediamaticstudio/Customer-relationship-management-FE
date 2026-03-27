
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$SourcePath,
        [string]$DestPath,
        [int]$Size
    )

    $sourceImage = [System.Drawing.Image]::FromFile($SourcePath)
    
    # Calculate aspect ratio
    $ratio = $sourceImage.Width / $sourceImage.Height
    
    # Determine new dimensions maintaining aspect ratio within the box
    if ($ratio -gt 1) {
        # Wider than tall
        $newWidth = $Size
        $newHeight = [int]($Size / $ratio)
    } else {
        # Taller than wide
        $newHeight = $Size
        $newWidth = [int]($Size * $ratio)
    }

    # Create a square canvas
    $destImage = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    
    # Set high quality settings
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Clear background (transparent or white if needed, let's use transparent)
    $graphics.Clear([System.Drawing.Color]::Transparent)

    # Calculate centered position
    $x = ($Size - $newWidth) / 2
    $y = ($Size - $newHeight) / 2

    # Draw the image
    $graphics.DrawImage($sourceImage, $x, $y, $newWidth, $newHeight)

    # Save
    $destImage.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)

    # Cleanup
    $graphics.Dispose()
    $destImage.Dispose()
    $sourceImage.Dispose()

    Write-Host "Created $DestPath"
}

$sourceFile = "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\mms-logo.png"

Resize-Image -SourcePath $sourceFile -DestPath "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\pwa-192x192.png" -Size 192
Resize-Image -SourcePath $sourceFile -DestPath "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\pwa-512x512.png" -Size 512
Resize-Image -SourcePath $sourceFile -DestPath "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\apple-touch-icon.png" -Size 180
Resize-Image -SourcePath $sourceFile -DestPath "c:\Users\MMS-4\Desktop\CRM\crm-mms\public\favicon.ico" -Size 64
