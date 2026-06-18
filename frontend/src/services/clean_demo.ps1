$f = 'demo-ele203-0237ictve-curso202526.ts'
$c = [System.IO.File]::ReadAllText($f)
$before = $c.Length

# Remove "desc_ra": "...", lines
$c = [regex]::Replace($c, '[ \t]*"desc_ra":\s*"[^"]*",?\r?\n', '')
# Remove "desc_ce": "...", lines
$c = [regex]::Replace($c, '[ \t]*"desc_ce":\s*"[^"]*",?\r?\n', '')
# Remove "desc_ud": "...", lines
$c = [regex]::Replace($c, '[ \t]*"desc_ud":\s*"[^"]*",?\r?\n', '')

$after = $c.Length
[System.IO.File]::WriteAllText($f, $c)
Write-Host "Before: $before After: $after Saved: $($before - $after) bytes"
