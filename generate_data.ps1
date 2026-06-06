$csvUrl = "https://docs.google.com/spreadsheets/d/1h2Y0ttDFF65rZDIFA3aFoU-osm8Snsjz_8P7pmXuOSA/export?format=csv"
$csvPath = "d:\antigravity\csv_output.txt"
$outputPath = "d:\antigravity\reviews-data.js"

Write-Host "Downloading the latest reviews from Google Sheets..."
try {
    # Download the live CSV data directly from Google Sheets
    Invoke-WebRequest -Uri $csvUrl -OutFile $csvPath -ErrorAction Stop
} catch {
    Write-Error "Failed to download spreadsheet: $_"
    exit 1
}

if (-not (Test-Path $csvPath)) {
    Write-Error "csv_output.txt not found!"
    exit 1
}

Write-Host "Parsing CSV data..."
# Import CSV using native Import-Csv with custom headers to handle Hebrew column names easily
$data = Import-Csv -Path $csvPath -Header col0,col1,col2,col3,col4,col5,col6,col7,col8,col9,col10,col11 -Encoding UTF8
$validReviews = @()

# Skip index 0 (which is the header row)
for ($i = 1; $i -lt $data.Count; $i++) {
    $row = $data[$i]
    $course = $row.col1
    if (!$course) { continue }
    
    $ratingStr = $row.col2
    $rating = 5
    $r = 0
    if ([int]::TryParse($ratingStr, [ref]$r)) {
        if ($r -ge 1 -and $r -le 5) {
            $rating = $r
        }
    }
    
    $text = ""
    if ($row.col10) {
        $text = $row.col10.Trim()
    }
    if ($text.Length -lt 10 -and $row.col9) {
        $altText = $row.col9.Trim()
        if ($altText.Length -ge 10) {
            $text = $altText
        }
    }
    
    # Escape characters for Javascript string literals
    $cleanText = $text.Replace('\', '\\').Replace('"', '\"').Replace("`r", "").Replace("`n", " ")
    $cleanCourse = $course.Replace('\', '\\').Replace('"', '\"').Replace("`r", "").Replace("`n", " ")
    
    $validReviews += [PSCustomObject]@{
        course = $cleanCourse
        rating = $rating
        text = $cleanText
    }
}

$jsonLines = @()
foreach ($r in $validReviews) {
    $jsonLines += "  { course: `"$($r.course)`", rating: $($r.rating), text: `"$($r.text)`" }"
}
$jsonArray = $jsonLines -join ",`n"

$jsContent = @"
// reviews-data.js - Static reviews cache
const GOOGLE_REVIEWS_LIST = [
$jsonArray
];
"@

[System.IO.File]::WriteAllText($outputPath, $jsContent, [System.Text.Encoding]::UTF8)
Write-Host "Successfully generated reviews-data.js with $($validReviews.Count) reviews!"
