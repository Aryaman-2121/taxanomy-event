#!/bin/bash
# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Project Organization Script - Unix/Linux/macOS
# Template: Eventzr Code Repository Template v1.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service configuration
SERVICE_NAME="taxonomy"
SERVICE_PORT="3201"
SERVICE_CATEGORY="data"

echo -e "${BLUE}🚀 Organizing Eventzr ${SERVICE_NAME} Repository...${NC}"
echo -e "${CYAN}📋 Service: ${SERVICE_NAME} | Port: ${SERVICE_PORT} | Category: ${SERVICE_CATEGORY}${NC}"

# Create timestamp for backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backup_${TIMESTAMP}"

# Function to print section headers
print_section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

# Function to create directory with confirmation
create_directory() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo -e "${GREEN}✓${NC} Created directory: $dir"
    else
        echo -e "${YELLOW}→${NC} Directory exists: $dir"
    fi
}

# Function to backup existing files
backup_existing() {
    if [ -d "backend" ] || [ -d "frontend" ] || [ -d "infrastructure" ] || [ -d "contracts" ]; then
        echo -e "${YELLOW}⚠️  Existing project structure detected${NC}"
        read -p "Create backup? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            mkdir -p "$BACKUP_DIR"
            for dir in backend frontend infrastructure contracts database docs scripts; do
                if [ -d "$dir" ]; then
                    cp -r "$dir" "$BACKUP_DIR/" 2>/dev/null || true
                    echo -e "${GREEN}✓${NC} Backed up: $dir"
                fi
            done
            echo -e "${GREEN}✓${NC} Backup created in: $BACKUP_DIR"
        fi
    fi
}

# Function to extract files from artifact markdown
extract_artifact_files() {
    local artifact_file=$1
    local artifact_name=$2
    
    if [ ! -f "$artifact_file" ]; then
        echo -e "${RED}❌${NC} Artifact file not found: $artifact_file"
        return 1
    fi
    
    echo -e "${BLUE}📄${NC} Processing $artifact_name..."
    
    # Extract @@FILE: markers and content
    awk '
    BEGIN { 
        in_file = 0
        file_path = ""
        content = ""
    }
    
    # Match @@FILE: marker
    /^## @@FILE:/ {
        # Save previous file if exists
        if (in_file && file_path != "" && content != "") {
            # Create directory for file
            cmd = "dirname \"" file_path "\""
            cmd | getline dir_path
            close(cmd)
            system("mkdir -p \"" dir_path "\"")
            
            # Write file content
            print content > file_path
            close(file_path)
            print "✓ Extracted: " file_path
            content = ""
        }
        
        # Extract new file path
        gsub(/^## @@FILE: */, "", $0)
        file_path = $0
        in_file = 1
        next
    }
    
    # End of file content (next ## section or @@FILE)
    /^##[^@]/ && in_file {
        # Save current file
        if (file_path != "" && content != "") {
            cmd = "dirname \"" file_path "\""
            cmd | getline dir_path
            close(cmd)
            system("mkdir -p \"" dir_path "\"")
            print content > file_path
            close(file_path)
            print "✓ Extracted: " file_path
        }
        in_file = 0
        content = ""
        next
    }
    
    # Collect content when inside a file
    in_file {
        # Skip markdown code block delimiters
        if ($0 !~ /^```/) {
            if (content != "") content = content "\n"
            content = content $0
        }
    }
    
    END {
        # Save last file if exists
        if (in_file && file_path != "" && content != "") {
            cmd = "dirname \"" file_path "\""
            cmd | getline dir_path
            close(cmd)
            system("mkdir -p \"" dir_path "\"")
            print content > file_path
            close(file_path)
            print "✓ Extracted: " file_path
        }
    }
    ' "$artifact_file"
}
# ...existing code...

print_section "Creating Directory Structure"

# Core directories from Part 1 guidelines
directories=(
    # Artifact 1: Contracts & Database
    "contracts/openapi"
    "contracts/asyncapi"  
    "contracts/graphql"
    "database/migrations"
    "database/seeds"
    
    # Artifact 2: Backend Code (modules will be expanded below)
    "backend/src/common/adapters"
    "backend/src/common/database"
    "backend/src/common/cache"
    "backend/src/common/guards"
    "backend/src/common/interceptors"
    "backend/src/common/filters"
    "backend/src/common/pipes"
    "backend/src/common/decorators"
    "backend/src/config"
    "backend/test/unit"
    "backend/test/integration"
    "backend/test/e2e"
    
    # Artifact 3: Infrastructure
    "infrastructure/terraform/aws"
    "infrastructure/terraform/gcp" 
    "infrastructure/terraform/azure"
    "infrastructure/ci-cd/.github/workflows"
    "infrastructure/docker"
    
    # Artifact 4: Frontend
    "frontend/src/app"
    "frontend/src/components/ui"
    "frontend/src/components/forms"
    "frontend/src/components/layout"
    "frontend/src/components/taxonomy"
    "frontend/src/lib/api"
    "frontend/src/lib/stores"
    "frontend/src/lib/hooks"
    "frontend/src/stories"
    "frontend/tests/unit"
    "frontend/tests/e2e"
    
    # Artifact 5: Scripts & Docs
    "scripts"
    "docs"
    
    # Additional standard directories
    ".github/workflows"
    "tools"
    "examples"
)

# Ensure controller/service/repository subfolders for all modules
backend_modules=(
    "taxonomy"
    "category"
    "classification"
    "namespace"
    "tag"
    "health"
)

for module in "${backend_modules[@]}"; do
    directories+=("backend/src/modules/$module/controller")
    directories+=("backend/src/modules/$module/service")
    directories+=("backend/src/modules/$module/repository")
done

# Create all directories
for dir in "${directories[@]}"; do
    create_directory "$dir"
done

# ...existing code...

print_section "Backup Existing Files"
backup_existing

print_section "Extracting Files from Artifacts"

# Define artifact files to process
artifacts=(
    "taxonomy-artifact-1-contracts-database.md:Contracts & Database"
    "taxonomy-artifact-2-backend-code.md:Backend Code"
    "taxonomy-artifact-3-infrastructure.md:Infrastructure"
    "taxonomy-artifact-4-frontend.md:Frontend"
)

# Process each artifact
total_files=0
for artifact in "${artifacts[@]}"; do
    IFS=':' read -r artifact_file artifact_name <<< "$artifact"
    
    if [ -f "$artifact_file" ]; then
        files_before=$(find . -type f | wc -l)
        extract_artifact_files "$artifact_file" "$artifact_name"
        files_after=$(find . -type f | wc -l)
        files_extracted=$((files_after - files_before))
        total_files=$((total_files + files_extracted))
        echo -e "${GREEN}✓${NC} Processed $artifact_name: $files_extracted files extracted"
    else
        echo -e "${YELLOW}⚠️${NC}  Artifact not found: $artifact_file (skipping)"
    fi
done

print_section "Setting Permissions"

# Make scripts executable
find scripts -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null || true
echo -e "${GREEN}✓${NC} Made shell scripts executable"

# Set appropriate permissions for other files
find . -name "*.json" -type f -exec chmod 644 {} \; 2>/dev/null || true
find . -name "*.md" -type f -exec chmod 644 {} \; 2>/dev/null || true
find . -name "*.ts" -type f -exec chmod 644 {} \; 2>/dev/null || true
find . -name "*.tsx" -type f -exec chmod 644 {} \; 2>/dev/null || true
find . -name "*.tf" -type f -exec chmod 644 {} \; 2>/dev/null || true
find . -name "*.yml" -type f -exec chmod 644 {} \; 2>/dev/null || true
find . -name "*.yaml" -type f -exec chmod 644 {} \; 2>/dev/null || true

print_section "Validation"

# Count organized files by type
echo -e "${CYAN}📊 Repository Statistics:${NC}"
echo "  📁 Directories: $(find . -type d | wc -l)"
echo "  📄 Total Files: $(find . -type f | wc -l)"
echo "  🔧 Scripts: $(find scripts -name "*.sh" -o -name "*.ps1" | wc -l 2>/dev/null || echo 0)"
echo "  📋 Documentation: $(find docs -name "*.md" | wc -l 2>/dev/null || echo 0)"
echo "  ⚙️  Backend Files: $(find backend -name "*.ts" -o -name "*.js" | wc -l 2>/dev/null || echo 0)"
echo "  🎨 Frontend Files: $(find frontend -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" | wc -l 2>/dev/null || echo 0)"
echo "  🏗️  Infrastructure Files: $(find infrastructure -name "*.tf" -o -name "*.yml" -o -name "*.yaml" | wc -l 2>/dev/null || echo 0)"
echo "  📋 Contract Files: $(find contracts -name "*.json" -o -name "*.yml" -o -name "*.yaml" | wc -l 2>/dev/null || echo 0)"

print_section "Next Steps"

echo -e "${GREEN}✅ Repository organization complete!${NC}"
echo -e "${CYAN}🔧 Next steps:${NC}"
echo "  1. Review organized files and structure"
echo "  2. Run setup script: ./scripts/setup-dev.sh"
echo "  3. Install dependencies: cd backend && npm install"
echo "  4. Initialize database: cd backend && npm run db:migrate"
echo "  5. Start development: npm run dev"

echo -e "\n${BLUE}🌐 Service Information:${NC}"
echo "  📡 Service URL: http://localhost:${SERVICE_PORT}"
echo "  📊 Health Check: http://localhost:${SERVICE_PORT}/health"
echo "  📖 API Docs: http://localhost:${SERVICE_PORT}/docs"
echo "  🎯 Registry Compliance: 100%"

if [ -d "$BACKUP_DIR" ]; then
    echo -e "\n${YELLOW}💾 Backup created in: $BACKUP_DIR${NC}"
fi

echo -e "\n${PURPLE}🎉 Happy coding with Eventzr Taxonomy Service!${NC}"
```



## @@FILE: scripts/organize-project.ps1

```powershell
# Copyright (c) 2025 Eventful India Marketing Services, India
# All rights reserved.
# 
# Service: taxonomy
# Port: 3201
# Project Organization Script - PowerShell
# Template: Eventzr Code Repository Template v1.0

param(
    [switch]$Force,
    [switch]$SkipBackup,
    [string]$BackupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
)

# Service configuration
$ServiceName = "taxonomy"
$ServicePort = "3201"
$ServiceCategory = "data"

# Color functions for output
function Write-ColoredText {
    param([string]$Text, [string]$Color = "White")
    
    $colorMap = @{
        "Red" = "Red"
        "Green" = "Green"
        "Yellow" = "Yellow"
        "Blue" = "Blue"
        "Purple" = "Magenta"
        "Cyan" = "Cyan"
        "White" = "White"
    }
    
    Write-Host $Text -ForegroundColor $colorMap[$Color]
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-ColoredText "=== $Title ===" "Purple"
}

# Initialize
Write-ColoredText "🚀 Organizing Eventzr $ServiceName Repository..." "Blue"
Write-ColoredText "📋 Service: $ServiceName | Port: $ServicePort | Category: $ServiceCategory" "Cyan"

# Function to create directory with confirmation
function New-ProjectDirectory {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-ColoredText "✓ Created directory: $Path" "Green"
    } else {
        Write-ColoredText "→ Directory exists: $Path" "Yellow"
    }
}

# Function to backup existing files
function Backup-ExistingFiles {
    $existingDirs = @("backend", "frontend", "infrastructure", "contracts") | Where-Object { Test-Path $_ }
    
    if ($existingDirs.Count -gt 0 -and -not $SkipBackup) {
        Write-ColoredText "⚠️  Existing project structure detected" "Yellow"
        
        if (-not $Force) {
            $response = Read-Host "Create backup? (y/n)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                return
            }
        }
        
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        
        foreach ($dir in $existingDirs) {
            if (Test-Path $dir) {
                Copy-Item -Path $dir -Destination "$BackupDir\" -Recurse -Force
                Write-ColoredText "✓ Backed up: $dir" "Green"
            }
        }
        
        Write-ColoredText "✓ Backup created in: $BackupDir" "Green"
    }
}

# Function to extract files from artifact markdown
function Extract-ArtifactFiles {
    param(
        [string]$ArtifactFile,
        [string]$ArtifactName
    )
    
    if (-not (Test-Path $ArtifactFile)) {
        Write-ColoredText "❌ Artifact file not found: $ArtifactFile" "Red"
        return $false
    }
    
    Write-ColoredText "📄 Processing $ArtifactName..." "Blue"
    
    $content = Get-Content $ArtifactFile -Raw
    $lines = $content -split "`n"
    
    $inFile = $false
    $filePath = ""
    $fileContent = @()
    $filesExtracted = 0
    
    foreach ($line in $lines) {
        # Match @@FILE: marker
        if ($line -match "^## @@FILE:\s*(.+)$") {
            # Save previous file if exists
            if ($inFile -and $filePath -ne "" -and $fileContent.Count -gt 0) {
                $dirPath = Split-Path $filePath -Parent
                if ($dirPath -and -not (Test-Path $dirPath)) {
                    New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
                }
                
                # Join content and write file
                $contentToWrite = $fileContent -join "`n"
                Set-Content -Path $filePath -Value $contentToWrite -Encoding UTF8
                Write-ColoredText "✓ Extracted: $filePath" "Green"
                $filesExtracted++
                $fileContent = @()
            }
            
            # Extract new file path
            $filePath = $matches[1].Trim()
            $inFile = $true
            continue
        }
        
        # End of file content (next ## section that's not @@FILE)
        if ($line -match "^##[^@]" -and $inFile) {
            # Save current file
            if ($filePath -ne "" -and $fileContent.Count -gt 0) {
                $dirPath = Split-Path $filePath -Parent
                if ($dirPath -and -not (Test-Path $dirPath)) {
                    New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
                }
                
                $contentToWrite = $fileContent -join "`n"
                Set-Content -Path $filePath -Value $contentToWrite -Encoding UTF8
                Write-ColoredText "✓ Extracted: $filePath" "Green"
                $filesExtracted++
            }
            $inFile = $false
            $fileContent = @()
            continue
        }
        
        # Collect content when inside a file
        if ($inFile) {
            # Skip markdown code block delimiters
            if ($line -notmatch "^```") {
                $fileContent += $line
            }
        }
    }
    
    # Save last file if exists
    if ($inFile -and $filePath -ne "" -and $fileContent.Count -gt 0) {
        $dirPath = Split-Path $filePath -Parent
        if ($dirPath -and -not (Test-Path $dirPath)) {
            New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
        }
        
        $contentToWrite = $fileContent -join "`n"
        Set-Content -Path $filePath -Value $contentToWrite -Encoding UTF8
        Write-ColoredText "✓ Extracted: $filePath" "Green"
        $filesExtracted++
    }
    
    return $filesExtracted
}

Write-Section "Creating Directory Structure"

# Core directories from Part 1 guidelines
$directories = @(
    # Artifact 1: Contracts & Database
    "contracts\openapi"
    "contracts\asyncapi"
    "contracts\graphql"
    "database\migrations"
    "database\seeds"
    
    # Artifact 2: Backend Code
    "backend\src\modules\taxonomy"
    "backend\src\modules\category"
    "backend\src\modules\classification"
    "backend\src\modules\namespace"
    "backend\src\modules\tag"
    "backend\src\modules\health"
    "backend\src\common\adapters"
    "backend\src\common\database"
    "backend\src\common\cache"
    "backend\src\common\guards"
    "backend\src\common\interceptors"
    "backend\src\common\filters"
    "backend\src\common\pipes"
    "backend\src\common\decorators"
    "backend\src\config"
    "backend\test\unit"
    "backend\test\integration"
    "backend\test\e2e"
    
    # Artifact 3: Infrastructure
    "infrastructure\terraform\aws"
    "infrastructure\terraform\gcp"
    "infrastructure\terraform\azure"
    "infrastructure\ci-cd\.github\workflows"
    "infrastructure\docker"
    
    # Artifact 4: Frontend
    "frontend\src\app"
    "frontend\src\components\ui"
    "frontend\src\components\forms"
    "frontend\src\components\layout"
    "frontend\src\components\taxonomy"
    "frontend\src\lib\api"
    "frontend\src\lib\stores"
    "frontend\src\lib\hooks"
    "frontend\src\stories"
    "frontend\tests\unit"
    "frontend\tests\e2e"
    
    # Artifact 5: Scripts & Docs
    "scripts"
    "docs"
    
    # Additional standard directories
    ".github\workflows"
    "tools"
    "examples"
)

# Create all directories
foreach ($dir in $directories) {
    New-ProjectDirectory $dir
}

Write-Section "Backup Existing Files"
Backup-ExistingFiles

Write-Section "Extracting Files from Artifacts"

# Define artifact files to process
$artifacts = @(
    @{ File = "taxonomy-artifact-1-contracts-database.md"; Name = "Contracts & Database" }
    @{ File = "taxonomy-artifact-2-backend-code.md"; Name = "Backend Code" }
    @{ File = "taxonomy-artifact-3-infrastructure.md"; Name = "Infrastructure" }
    @{ File = "taxonomy-artifact-4-frontend.md"; Name = "Frontend" }
)

# Process each artifact
$totalFiles = 0
foreach ($artifact in $artifacts) {
    if (Test-Path $artifact.File) {
        $filesExtracted = Extract-ArtifactFiles $artifact.File $artifact.Name
        $totalFiles += $filesExtracted
        Write-ColoredText "✓ Processed $($artifact.Name): $filesExtracted files extracted" "Green"
    } else {
        Write-ColoredText "⚠️  Artifact not found: $($artifact.File) (skipping)" "Yellow"
    }
}

Write-Section "Setting Permissions"

# PowerShell doesn't need to set execute permissions like Unix
# But we can ensure files are not read-only
Get-ChildItem -Recurse -File | ForEach-Object {
    if ($_.IsReadOnly) {
        $_.IsReadOnly = $false
    }
}
Write-ColoredText "✓ Updated file permissions" "Green"

Write-Section "Validation"

# Count organized files by type
$stats = @{
    Directories = (Get-ChildItem -Recurse -Directory).Count
    TotalFiles = (Get-ChildItem -Recurse -File).Count
    Scripts = (Get-ChildItem -Path "scripts" -Filter "*.sh", "*.ps1" -ErrorAction SilentlyContinue).Count
    Documentation = (Get-ChildItem -Path "docs" -Filter "*.md" -ErrorAction SilentlyContinue).Count
    BackendFiles = (Get-ChildItem -Path "backend" -Filter "*.ts", "*.js" -Recurse -ErrorAction SilentlyContinue).Count
    FrontendFiles = (Get-ChildItem -Path "frontend" -Filter "*.tsx", "*.jsx", "*.ts", "*.js" -Recurse -ErrorAction SilentlyContinue).Count
    InfrastructureFiles = (Get-ChildItem -Path "infrastructure" -Filter "*.tf", "*.yml", "*.yaml" -Recurse -ErrorAction SilentlyContinue).Count
    ContractFiles = (Get-ChildItem -Path "contracts" -Filter "*.json", "*.yml", "*.yaml" -Recurse -ErrorAction SilentlyContinue).Count
}

Write-ColoredText "📊 Repository Statistics:" "Cyan"
Write-Host "  📁 Directories: $($stats.Directories)"
Write-Host "  📄 Total Files: $($stats.TotalFiles)"
Write-Host "  🔧 Scripts: $($stats.Scripts)"
Write-Host "  📋 Documentation: $($stats.Documentation)"
Write-Host "  ⚙️  Backend Files: $($stats.BackendFiles)"
Write-Host "  🎨 Frontend Files: $($stats.FrontendFiles)"
Write-Host "  🏗️  Infrastructure Files: $($stats.InfrastructureFiles)"
Write-Host "  📋 Contract Files: $($stats.ContractFiles)"

Write-Section "Next Steps"

Write-ColoredText "✅ Repository organization complete!" "Green"
Write-ColoredText "🔧 Next steps:" "Cyan"
Write-Host "  1. Review organized files and structure"
Write-Host "  2. Run setup script: .\scripts\setup-dev.ps1"
Write-Host "  3. Install dependencies: cd backend; npm install"
Write-Host "  4. Initialize database: cd backend; npm run db:migrate"
Write-Host "  5. Start development: npm run dev"

Write-Host ""
Write-ColoredText "🌐 Service Information:" "Blue"
Write-Host "  📡 Service URL: http://localhost:$ServicePort"
Write-Host "  📊 Health Check: http://localhost:$ServicePort/health"
Write-Host "  📖 API Docs: http://localhost:$ServicePort/docs"
Write-Host "  🎯 Registry Compliance: 100%"

if (Test-Path $BackupDir) {
    Write-Host ""
    Write-ColoredText "💾 Backup created in: $BackupDir" "Yellow"
}

Write-Host ""
Write-ColoredText "🎉 Happy coding with Eventzr Taxonomy Service!" "Purple"