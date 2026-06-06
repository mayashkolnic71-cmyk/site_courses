# fetch_reviews.ps1
$url = "https://docs.google.com/spreadsheets/d/1h2Y0ttDFF65rZDIFA3aFoU-osm8Snsjz_8P7pmXuOSA/export?format=csv"

Write-Host "Downloading CSV from Google Sheets..."
$client = New-Object System.Net.WebClient
$client.Encoding = [System.Text.Encoding]::UTF8
$csvText = $client.DownloadString($url)

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

Write-Host "Parsing CSV..."
# Handle newlines inside quotes properly by using a regex split that respects quotes,
# or simply parsing using a state-machine or using standard csv parser in .NET.
# Let's use the .NET TextFieldParser for bulletproof CSV parsing of multi-line columns in PowerShell!
$reader = New-Object System.IO.StringReader($csvText)
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($reader)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

$validReviews = @()

# Read header
if (!$parser.EndOfData) {
    $parser.ReadFields() | Out-Null
}

while (!$parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($cols.Count -lt 3) { continue }
    
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
        if ($r -ge 1 -and $r -le 5) {
            $rating = $r
        }
    }
    
    if ($course) {
        # Clean quotes and slashes for JS
        $cleanText = ""
        if ($text) {
            $cleanText = $text.Replace('\', '\\').Replace('"', '\"').Replace("`r", "").Replace("`n", " ")
        }
        $cleanCourse = $course.Replace('\', '\\').Replace('"', '\"').Replace("`r", "").Replace("`n", " ")
        
        $validReviews += [PSCustomObject]@{
            course = $cleanCourse
            rating = $rating
            text = $cleanText
        }
    }
}

$parser.Close()
$reader.Close()

Write-Host "Generating reviews-data.js..."
$jsonLines = @()
foreach ($r in $validReviews) {
    $jsonLines += "  { name: `"בוגר/ת קורס`", role: `"מערך הסיעוד הגריאטרי`", workplace: `"מוסד רפואי`", course: `"$($r.course)`", rating: $($r.rating), text: `"$($r.text)`" }"
}
$jsonArray = $jsonLines -join ",`n"

$jsContent = @"
// reviews-data.js - Static reviews cache
const GOOGLE_REVIEWS_LIST = [
$jsonArray
];
"@

[System.IO.File]::WriteAllText("D:\antigravity\reviews-data.js", $jsContent, [System.Text.Encoding]::UTF8)
Write-Host "Successfully generated reviews-data.js with $($validReviews.Count) reviews!"
