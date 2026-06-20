Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\מצגת לבקרה-מרגים נתונים מהמרכז הגריאטרי 2022.pptx", "$PWD\ext1")
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\תוכנית הכשרה מתוקן 2026.docx", "$PWD\ext2")
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\תוכנית עבודה 2026-.pptx", "$PWD\ext3")
