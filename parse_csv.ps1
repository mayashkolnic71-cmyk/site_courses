# parse_csv.ps1
# Pure ASCII PowerShell script to parse Hebrew CSV without encoding conflicts.

$csvPath = "D:\antigravity\עותק של  שאלון משוב והערכה על השתלמות-קורסים חיצוניים ינואר 2024 (תגובות) - תגובות לטופס 1.csv"
$outputPath = "D:\antigravity\reviews-data.js"

# Read all lines as UTF8
$lines = Get-Content -Path $csvPath -Encoding UTF8

$validReviews = @()

# Helper function to parse CSV line and handle quotes
function Parse-CSVLine ($line) {
    $fields = @()
    $current = ""
    $inQuotes = $false
    for ($i = 0; $i -lt $line.Length; $i++) {
        $char = $line[$i]
        if ($char -eq '"') {
            $inQuotes = -not $inQuotes
        } elseif ($char -eq ',' -and -not $inQuotes) {
            $fields += $current.Trim()
            $current = ""
        } else {
            $current += $char
        }
    }
    $fields += $current.Trim()
    return $fields
}

# Skip header (line 0)
for ($i = 1; $i -lt $lines.Count; $i++) {
    $line = $lines[$i].Trim()
    if (!$line) { continue }
    
    $cols = Parse-CSVLine $line
    if ($cols.Count -lt 11) { continue }
    
    $course = $cols[1]
    $ratingStr = $cols[2]
    # Check both feedback (col 10) and changes (col 9)
    $text = $cols[10]
    if (!$text -or $text.Length -lt 10) {
        $text = $cols[9]
    }
    
    # Parse rating
    $rating = 5
    if ([int]::TryParse($ratingStr, [ref]$r)) {
        $rating = $r
    }
    
    if ($course -and $text -and $text.Length -gt 12) {
        # Clean quotes and slashes for JS
        $cleanText = $text.Replace('\', '\\').Replace('"', '\"').Replace("`r", "").Replace("`n", " ")
        $cleanCourse = $course.Replace('\', '\\').Replace('"', '\"').Replace("`r", "").Replace("`n", " ")
        
        $validReviews += [PSCustomObject]@{
            course = $cleanCourse
            rating = $rating
            text = $cleanText
        }
    }
}

# Sort by length and select top 150 reviews
$selected = $validReviews | Sort-Object -Property { $_.text.Length } -Descending | Select-Object -First 150

# Generate JS code
$jsonLines = @()
foreach ($r in $selected) {
    $jsonLines += "  { course: `"$($r.course)`", rating: $($r.rating), text: `"$($r.text)`" }"
}
$jsonArray = $jsonLines -join ",`n"

$jsContent = @"
// reviews-data.js - Live reviews from offline data
const GOOGLE_REVIEWS_LIST = [
$jsonArray
];
"@

# Write to file
[System.IO.File]::WriteAllText($outputPath, $jsContent, [System.Text.Encoding]::UTF8)
Write-Host "Generated reviews-data.js with $($selected.Count) reviews!"
