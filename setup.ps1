param(
  [switch]$Update
)

$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$core = Join-Path $repo 'core'
$instanceDir = Join-Path $repo 'instance'
$envFile = Join-Path $instanceDir '.env'
$choicesFile = Join-Path $instanceDir 'choices.json'
$templatesDir = Join-Path $core 'templates'

function Write-Section([string]$title) {
  Write-Host ''
  Write-Host ("=" * 72) -ForegroundColor Cyan
  Write-Host " $title" -ForegroundColor Cyan
  Write-Host ("=" * 72) -ForegroundColor Cyan
}

function Ask([string]$prompt, [string]$default = '') {
  if ($default) {
    $answer = Read-Host "$prompt [$default]"
    if ([string]::IsNullOrWhiteSpace($answer)) { return $default }
    return $answer.Trim()
  }
  return (Read-Host $prompt).Trim()
}

function AskChoice([string]$prompt, [string[]]$options, [int]$defaultIndex = 1) {
  Write-Host ''
  Write-Host $prompt
  for ($i = 0; $i -lt $options.Count; $i++) {
    $mark = if (($i + 1) -eq $defaultIndex) { ' (recommended)' } else { '' }
    Write-Host "  $($i + 1)) $($options[$i])$mark"
  }
  $choice = Read-Host "Enter a number (default $defaultIndex)"
  if ([string]::IsNullOrWhiteSpace($choice)) { return $defaultIndex }
  $num = [int]$choice
  if ($num -lt 1 -or $num -gt $options.Count) { throw 'Invalid choice.' }
  return $num
}

function Test-Command([string]$name) {
  return $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

function Write-Utf8NoBom([string]$path, [string]$content) {
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8)
}

Write-Host ''
Write-Host '  Research Mockup - project setup' -ForegroundColor Cyan
Write-Host '  One command, guided step by step: turns this folder into your research +'
Write-Host '  mockup workspace, installs the skills for ChatGPT/Codex and/or Cursor,'
Write-Host '  and sets everything up for you.'
Write-Host ''

$choices = $null
if ($Update) {
  Write-Section 'Update mode'
  if (-not (Test-Path -LiteralPath $choicesFile)) {
    throw 'No previous setup found. Run .\setup.ps1 (full setup) at least once before updating.'
  }
  $choices = Get-Content -Raw -LiteralPath $choicesFile -Encoding UTF8 | ConvertFrom-Json
  # Cargar preferencias guardadas (default: conservar instalación previa de Codex).
  if ($null -eq $choices.useCodex) { $choices | Add-Member -NotePropertyName useCodex -NotePropertyValue $true }
  if ($null -eq $choices.useCursor) { $choices | Add-Member -NotePropertyName useCursor -NotePropertyValue $false }
  Write-Host ''
  $destChoice = AskChoice -prompt 'Where do you want the skills installed for this update?' -options @(
    "Both ChatGPT desktop app and Cursor (currently: $($choices.useCodex) / $($choices.useCursor))",
    'Only the ChatGPT desktop app',
    'Only Cursor'
  ) -defaultIndex 1
  $choices.useCodex = ($destChoice -ne 3)
  $choices.useCursor = ($destChoice -ne 2)
  Write-Host 'Re-rendering skills and context from the updated template using your saved choices.'
  Write-Host 'Your screens/, research/ and mockup data are not touched.'
} else {
  Write-Host 'This wizard asks a few questions and sets everything up automatically.'
  Write-Host 'Each question is explained in plain language. Press Enter to accept the'
  Write-Host 'recommended answer.'
}

# Definir siempre antes de la sección de instalación (también sirve en -Update).
$useCodex = $choices.useCodex
$useCursor = $choices.useCursor

if (-not $Update) {
  # ---------------------------------------------------------------- environment
  Write-Section 'Step 1 of 5 - Check your machine'

  $missing = @()
  if (-not (Test-Command 'node')) { $missing += 'Node.js (https://nodejs.org)' }
  if (-not (Test-Command 'git')) { $missing += 'Git (https://git-scm.com)' }
  if (-not (Test-Command 'npm')) { $missing += 'npm (comes with Node.js)' }
  if ($missing.Count -gt 0) {
    Write-Host 'Missing tools:' -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host "  - $_" }
    throw 'Install the tools above, then run this wizard again.'
  }
  Write-Host "OK: Node.js $(node --version), Git $(git --version)."

  # ---------------------------------------------------------------- agent
  Write-Section 'Step 2 of 5 - Choose where you will use this workspace'

  Write-Host ''
  Write-Host 'OpenCode is a coding agent you run from a terminal (or its desktop app).'
  Write-Host 'It reads this workspace, can see files, and writes code for you.'
  Write-Host 'Cursor is the coding editor used at many companies - it can also read this'
  Write-Host 'workspace, use the skills, and follow the handoffs.'
  $agentsChoice = AskChoice -prompt 'Where do you want to use this workspace?' -options @(
    'Both ChatGPT desktop app and Cursor (recommended)',
    'Only the ChatGPT desktop app',
    'Only Cursor'
  ) -defaultIndex 1
  $useCodex = ($agentsChoice -ne 3)
  $useCursor = ($agentsChoice -ne 2)

  $useOpenCode = $false
  if ($useCodex) {
    $engineChoice = AskChoice -prompt 'Inside ChatGPT, which agent do you prefer?' -options @(
      'Codex (recommended - reads this workspace and its skills)',
      'OpenCode (terminal agent, also guided by this repo)'
    ) -defaultIndex 1
    $useOpenCode = ($engineChoice -eq 2)
  }

  $useVisionModel = $true
  if ($useOpenCode) {
    if (Test-Command 'opencode') {
      Write-Host 'OpenCode CLI found.'
    } else {
      $install = AskChoice -prompt 'OpenCode is not installed. Install it now with npm?' -options @(
        'Yes, install OpenCode globally (recommended)',
        'No, I will install it myself later'
      ) -defaultIndex 1
      if ($install -eq 1) {
        Write-Host 'Installing OpenCode...'
        npm install -g opencode-ai
        if (-not (Test-Command 'opencode')) { throw 'OpenCode installation failed. Install it manually and re-run.' }
      }
    }

    $modelChoice = AskChoice -prompt 'Which model should OpenCode use?' -options @(
      'Luna (a vision model) - the agent looks at screenshots itself',
      'DeepSeek (very cheap and fast, text only) - the repo adds ModLens so it can still "see" screenshots'
    ) -defaultIndex 1
    $useVisionModel = ($modelChoice -eq 1)
  } else {
    if ($useCodex) {
      Write-Host 'Codex in the ChatGPT app can see images by default. No extra vision setup needed.'
    } else {
      Write-Host 'Cursor models can see images by default. No extra vision setup needed.'
    }
  }

  $modlensProvider = ''
  if (-not $useVisionModel) {
    Write-Host ''
    Write-Host 'ModLens is a helper that describes images to text-only models, so the agent'
    Write-Host 'can still work with screenshots. It needs one vision provider:'
    $modlensChoice = AskChoice -prompt 'Which ModLens provider?' -options @(
      'Gemini free API key (fast, free, takes 3 minutes to create)',
      'Antigravity CLI (free, no key, one-time Google sign-in)',
      'Skip for now (vision features will fail until configured)'
    ) -defaultIndex 1
    $modlensProvider = @('gemini-api', 'antigravity-cli', '')[$modlensChoice - 1]
    if (-not (Test-Command 'modlens')) {
      Write-Host 'ModLens CLI not found. It runs through npx when needed:'
      Write-Host '  npx --yes @liustack/modlens'
    }
  }

  # ---------------------------------------------------------------- mobbin
  Write-Section 'Step 3 of 5 - Mobbin API key'

  Write-Host ''
  Write-Host 'Mobbin is a library of real app screenshots used for UX research. The key lets'
  Write-Host 'this workspace download reference screens. Get one at mobbin.com (free account).'
  Write-Host 'The key is stored only on this machine, in instance/.env (never committed).'
  $mobbinKey = Read-Host 'Paste your Mobbin API key (press Enter to skip for now)'

  # ---------------------------------------------------------------- project
  Write-Section 'Step 4 of 5 - Your project'

  $appName = Ask 'App name' (Split-Path $repo -Leaf)
  $modeChoice = AskChoice -prompt 'Is the app already built, or starting from zero?' -options @(
    'Existing app - I already have code',
    'New app - starting from scratch'
  ) -defaultIndex 1
  $greenfield = ($modeChoice -eq 2)
  $platformChoice = AskChoice -prompt 'What platform is the app?' -options @(
    'Web app / PWA (works offline, installable)',
    'iOS (native or hybrid)',
    'Android (native or hybrid)',
    'Cross-platform (responsive web + mobile)'
  ) -defaultIndex 1
  $platform = @('web-pwa', 'ios', 'android', 'cross-platform')[$platformChoice - 1]
  $mobbinPlatform = switch ($platform) {
    'web-pwa' { 'web' }
    'ios' { 'ios' }
    'android' { 'android' }
    default { 'ios' }
  }

  if ($greenfield) {
    $stackChoice = AskChoice -prompt 'What stack will the new app use?' -options @(
      'Vue (recommended for web/PWA)',
      'React',
      'Not decided yet'
    ) -defaultIndex 1
    $stack = @('Vue', 'React', 'Undecided')[$stackChoice - 1]
    $appRepoPath = ''
  } else {
    $appRepoPath = Ask 'Full path to your app repository (the code)' (Split-Path $repo -Parent)
    $appRepoPath = $appRepoPath.Trim('"')
    if (-not (Test-Path -LiteralPath $appRepoPath)) {
      Write-Host "Warning: '$appRepoPath' was not found. Fix it later in instance/project-context.md." -ForegroundColor Yellow
    }
  }

  if (-not $greenfield) {
    $stack = 'Unknown'
    $pkgPath = Join-Path $appRepoPath 'package.json'
    if (Test-Path -LiteralPath $pkgPath) {
      try {
        $pkg = Get-Content -Raw -LiteralPath $pkgPath | ConvertFrom-Json
        $deps = @($pkg.dependencies.PSObject.Properties.Name) + @($pkg.devDependencies.PSObject.Properties.Name)
        $stackParts = @()
        if ($deps -contains 'vue') { $stackParts += 'Vue' }
        if ($deps -contains 'react') { $stackParts += 'React' }
        if ($deps -contains 'next') { $stackParts += 'Next.js' }
        if ($deps -contains 'nuxt') { $stackParts += 'Nuxt' }
        if ($deps -contains 'tailwindcss') { $stackParts += 'Tailwind' }
        if ($deps -contains 'typescript') { $stackParts += 'TypeScript' }
        if ($stackParts.Count -gt 0) { $stack = ($stackParts -join ' + ') }
      } catch { $stack = 'Unknown' }
    }
    Write-Host "Detected stack: $stack"
  }

  $lang = Ask 'Primary language for UI copy (en, es, ...)' 'en'

  Write-Host ''
  Write-Host 'Every app needs design rules and visual styles. You can bring your own, or let'
  Write-Host 'this repository apply a complete, up-to-date design system for you.'
  $designChoice = AskChoice -prompt 'How should the design system work?' -options @(
    'My app already has a design system - import its tokens and rules',
    'Let this repo own it - adopt the built-in Design Foundation (recommended for new apps)',
    'Import my tokens, but apply the Design Foundation rules on top'
  ) -defaultIndex 2
  $designOwnership = @('project', 'foundation', 'hybrid')[$designChoice - 1]

  # ---------------------------------------------------------------- tokens
  $tokensSource = ''
  $tokenCandidates = @(
    'src/core/theming/tokens.css',
    'src/assets/tokens.css',
    'src/styles/tokens.css',
    'src/theme/tokens.css',
    'src/core/theming/theme.css'
  )
  if (-not $greenfield -and $appRepoPath) {
    foreach ($rel in $tokenCandidates) {
      $candidate = Join-Path $appRepoPath $rel
      if (Test-Path -LiteralPath $candidate) { $tokensSource = $candidate; break }
    }
  }

  # ---------------------------------------------------------------- persist
  $choices = [PSCustomObject]@{
    appName = $appName
    greenfield = $greenfield
    platform = $platform
    mobbinPlatform = $mobbinPlatform
    appRepoPath = $appRepoPath
    stack = $stack
    lang = $lang
    designOwnership = $designOwnership
    tokensSource = $tokensSource
    useCodex = $useCodex
    useCursor = $useCursor
    useOpenCode = $useOpenCode
    useVisionModel = $useVisionModel
    modlensProvider = $modlensProvider
    hasMobbinKey = [bool]$mobbinKey
  }
  New-Item -ItemType Directory -Force -Path $instanceDir | Out-Null
  Write-Utf8NoBom $choicesFile ($choices | ConvertTo-Json)
  if ($mobbinKey) {
    Set-Content -LiteralPath $envFile -Value "MOBBIN_API_KEY=$mobbinKey" -Encoding ASCII
  }
}

$vars = @{
  '{{APP_NAME}}' = $choices.appName
  '{{MODE}}' = if ($choices.greenfield) { 'Greenfield (new app, not built yet)' } else { 'Existing app' }
  '{{APP_REPO_NOTE}}' = if ($choices.greenfield) { ' (not created yet - this workspace is the blueprint)' } else { '' }
  '{{APP_NAME_LOWER}}' = ($choices.appName.ToLowerInvariant() -replace '[^a-z0-9]+', '-')
  '{{PLATFORM}}' = $choices.platform
  '{{MOBBIN_PLATFORM}}' = $choices.mobbinPlatform
  '{{STACK}}' = $choices.stack
  '{{LANG}}' = $choices.lang
  '{{DESIGN_OWNERSHIP}}' = switch ($choices.designOwnership) {
    'project' { 'Owned by the project (imported during setup)' }
    'foundation' { 'Adopted from the repository Design Foundation' }
    'hybrid' { 'Project tokens + repository Design Foundation rules' }
    default { 'Not configured' }
  }
  '{{APP_REPO_PATH}}' = ($choices.appRepoPath -replace '\\', '/')
  '{{INSTANCE_PATH}}' = ($repo -replace '\\', '/')
  '{{TOKENS_PATH}}' = ($choices.tokensSource -replace '\\', '/')
  '{{DATE}}' = (Get-Date -Format 'yyyy-MM-dd')
}

Write-Section 'Generate and install'

# ---------------------------------------------------------------- instance files
New-Item -ItemType Directory -Force -Path $instanceDir | Out-Null

function Render-Template([string]$templateName, [string]$destination) {
  $template = Join-Path $templatesDir $templateName
  $content = Get-Content -Raw -LiteralPath $template -Encoding UTF8
  foreach ($key in $vars.Keys) {
    $content = $content -replace [regex]::Escape($key), $vars[$key]
  }
  New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null
  Write-Utf8NoBom $destination $content
  Write-Host "Rendered $destination"
}

$contextDest = Join-Path $instanceDir 'project-context.md'
if (Test-Path -LiteralPath $contextDest) {
  Write-Host 'Keeping existing instance/project-context.md (your context and decision log are never overwritten).'
} else {
  Render-Template 'project-context.md' $contextDest
}
$rulesDest = Join-Path $instanceDir 'project-rules.md'
if (Test-Path -LiteralPath $rulesDest) {
  Write-Host 'Keeping existing instance/project-rules.md (your rules are never overwritten).'
} elseif ($choices.designOwnership -eq 'project') {
  Render-Template 'project-rules.md' $rulesDest
} else {
  $foundation = Join-Path $core 'foundation\DESIGN-FOUNDATION.md'
  $content = Get-Content -Raw -LiteralPath $foundation -Encoding UTF8
  $content = $content -replace '\{\{APP_NAME\}\}', $vars['{{APP_NAME}}']
  Write-Utf8NoBom $rulesDest $content
  Write-Host 'Rendered instance/project-rules.md from the Design Foundation.'
}
Render-Template 'AGENTS.md' (Join-Path $repo 'AGENTS.md')

if ($choices.hasMobbinKey -and (Test-Path -LiteralPath $envFile)) {
  Write-Host 'Mobbin key is stored in instance/.env (git-ignored).'
} else {
  Write-Host 'No Mobbin key yet. Add it later to instance/.env as MOBBIN_API_KEY=...'
}

# ---------------------------------------------------------------- design tokens
$studioAssets = Join-Path $repo 'mockups\assets'
New-Item -ItemType Directory -Force -Path $studioAssets | Out-Null
$tokensDest = Join-Path $studioAssets 'tokens.css'
if ($choices.designOwnership -ne 'foundation' -and $choices.tokensSource -and (Test-Path -LiteralPath $choices.tokensSource)) {
  Copy-Item -LiteralPath $choices.tokensSource -Destination $tokensDest -Force
  Write-Host "Imported your design tokens: $($choices.tokensSource)"
} else {
  $starter = Join-Path $core 'studio\starter-tokens.css'
  if (Test-Path -LiteralPath $starter) {
    Copy-Item -LiteralPath $starter -Destination $tokensDest -Force
    Write-Host 'No token file found in the app; using the neutral starter kit.'
  }
}

# ---------------------------------------------------------------- render + install skills
$skillSource = Join-Path $core 'skills'
$skillTargets = @()
if ($useCodex) {
  $skillTargets += (Join-Path $env:USERPROFILE '.codex\skills')
  $skillTargets += (Join-Path $env:USERPROFILE '.config\opencode\skills')
  $skillTargets += (Join-Path $repo '.agents\skills')
}
if ($useCursor) {
  # Cursor descubre skills por proyecto (.cursor/skills dentro del repo) y globales.
  $skillTargets += (Join-Path $repo '.cursor\skills')
  $skillTargets += (Join-Path $env:USERPROFILE '.cursor\skills')
}

if ($skillTargets.Count -gt 0) {
  Get-ChildItem -LiteralPath $skillSource -Directory | ForEach-Object {
    $skillDir = $_.FullName
    Get-ChildItem -LiteralPath $skillDir -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($skillSource.Length + 1)
      $content = Get-Content -Raw -LiteralPath $_.FullName -Encoding UTF8
      foreach ($target in $skillTargets) {
        $dest = Join-Path $target $rel
        New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
        Write-Utf8NoBom $dest $content
      }
    }
    Write-Host "Installed skill: $($_.Name)"
  }
} else {
  Write-Host 'No skills installed (no target selected).' -ForegroundColor Yellow
}

# ---------------------------------------------------------------- cursor rules (optional)
if ($useCursor) {
  $cursorRulesDir = Join-Path $repo '.cursor\rules'
  New-Item -ItemType Directory -Force -Path $cursorRulesDir | Out-Null
  $cursorRules = @'
---
description: Research Mockup workspace - use these skills for UX research, mockups, plans and handoffs.
globs: **/*
---

This workspace includes the Research Mockup skills. When the user asks to research a feature,
redesign a screen/flow, create a mockup/prototype, or plan UX work, use the `research-mockup`
skill instructions in this repository:

1. `.cursor/skills/research-mockup/SKILL.md` (also at `core/skills/research-mockup/SKILL.md`) -
   read it fully before starting. It resolves the active project instance, runs the domain +
   Mobbin research, builds the HTML/CSS mockup, and produces the plan viewer + handoff.
2. `core/skills/mockup-to-figma/SKILL.md` - only for the optional post-approval Figma step.
3. `core/skills/ux-knowledge-base/references/INDEX.md` - load only the relevant topic files.
4. `instance/project-context.md` and `instance/project-rules.md` - project identity, tokens,
   frozen surfaces and decision log.

Deliverables to always produce: the offline plan viewer (`mockups/plans/<id>/index.html`)
with the reference screenshots per phase, the `reference.json`, and the implementation
handoff. Never depend on Figma to complete the workflow; Figma is optional post-approval.
'@
  Write-Utf8NoBom (Join-Path $cursorRulesDir 'research-mockup.mdc') $cursorRules
  Write-Host 'Installed Cursor rule: .cursor/rules/research-mockup.mdc'
}

# ---------------------------------------------------------------- registry (multi-project)
$registryDir = Join-Path $env:USERPROFILE '.config\research-mockup'
$registryFile = Join-Path $registryDir 'instances.json'
$instances = @()
if (Test-Path -LiteralPath $registryFile) {
  try {
    $parsed = Get-Content -Raw -LiteralPath $registryFile -Encoding UTF8 | ConvertFrom-Json
    if ($null -ne $parsed) {
      if ($parsed -is [array]) { $instances = @($parsed) }
      elseif ($parsed.PSObject.Properties['value']) { $instances = @($parsed.value) }
      else { $instances = @($parsed) }
    }
  } catch { $instances = @() }
}
$entry = [PSCustomObject]@{
  name = $choices.appName
  instancePath = ($repo -replace '\\', '/')
  appRepoPath = ($choices.appRepoPath -replace '\\', '/')
  platform = $choices.platform
  updatedAt = (Get-Date -Format 'yyyy-MM-dd')
}
$instances = @($instances | Where-Object {
  $_.instancePath -ne $entry.instancePath -and $_.appRepoPath -ne $entry.appRepoPath
}) + $entry
New-Item -ItemType Directory -Force -Path $registryDir | Out-Null
$items = @($instances | Sort-Object name)
$json = ($items | ConvertTo-Json -Depth 4)
if ($items.Count -eq 1) { $json = '[' + $json + ']' }
Write-Utf8NoBom $registryFile $json
Write-Host "Registered project: $($choices.appName)"

# ---------------------------------------------------------------- self test
$issues = @()
$previousErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
if (Test-Path -LiteralPath (Join-Path $core 'tools\verify-catalog.mjs')) {
  $null = node (Join-Path $core 'tools\verify-catalog.mjs') 2>&1
  if ($LASTEXITCODE -ne 0) { $issues += 'Catalog verification failed.' }
}
if (Test-Path -LiteralPath (Join-Path $core 'tools\check-mockups.mjs')) {
  $null = node (Join-Path $core 'tools\check-mockups.mjs') 2>&1
  if ($LASTEXITCODE -ne 0) { $issues += 'Mockup checks failed.' }
}
$ErrorActionPreference = $previousErrorAction

if ($issues.Count -gt 0) {
  Write-Host ''
  Write-Host 'Setup finished with warnings:' -ForegroundColor Yellow
  $issues | ForEach-Object { Write-Host "  - $_" }
} else {
  Write-Host ''
  Write-Host 'Setup complete and verified.' -ForegroundColor Green
}

# ---------------------------------------------------------------- next steps
Write-Section 'You are ready'

Write-Host 'Sessions are scoped to a folder. Open a session in this folder (or in the app'
Write-Host 'repository) and the skill loads THIS project automatically - contexts never mix.'
Write-Host "Registered projects: $(($instances | ForEach-Object { $_.name }) -join ', ')"
Write-Host 'To switch apps, open a session in that app folder instead.'
Write-Host ''

if ($choices.useCodex -and $choices.useOpenCode) {
  Write-Host 'Open the OpenCode desktop app (Windows), open this folder as your project, and paste:'
  Write-Host ''
  Write-Host "  Use the `$research-mockup skill to research a feature in $($choices.appName):"
  Write-Host '  domain and concept first, Mobbin research, proposal, then a mockup in the studio.'
  Write-Host ''
  Write-Host 'No @ or $ prefix is needed - OpenCode discovers the skill automatically in this folder.'
} elseif ($choices.useCodex) {
  Write-Host 'Open the ChatGPT desktop app, open this folder, and paste:'
  Write-Host ''
  Write-Host "  Use the $research-mockup skill to research a feature in $($choices.appName):"
  Write-Host '  domain and concept first, Mobbin research, proposal, then a mockup in the studio.'
}

if ($choices.useCursor) {
  Write-Host ''
  Write-Host 'Open this folder in Cursor and the Research Mockup skills are loaded automatically:'
  Write-Host '  - Skills: ~/.cursor/skills/ (research-mockup, mockup-to-figma, mobbin-ux-research, ux-knowledge-base)'
  Write-Host '  - Rule:   .cursor/rules/research-mockup.mdc in this repository'
  Write-Host 'Just ask Cursor to research a feature and build the mockup; it will follow the skill.'
}

if ($choices.greenfield) {
  Write-Host ''
  Write-Host "Note: $($choices.appName) is registered as a new app. The first mockup is the"
  Write-Host 'blueprint; implementation handoffs will list files to CREATE.'
}

if (-not $choices.useVisionModel -and $choices.modlensProvider) {
  Write-Host ''
  Write-Host "ModLens provider selected: $($choices.modlensProvider)"
  Write-Host 'Configure it once with:  npx --yes @liustack/modlens config init'
}

Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
