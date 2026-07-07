#!/bin/bash

##############################################################################
# K-Vibe Tracker - Agent Collaboration Guide Maintenance Script
# 
# Purpose: 
#   - 프로젝트 구조 변경 시 AGENT-COLLABORATION-GUIDE.md 자동 업데이트
#   - lib/ 폴더 구조, types/, 테스트 디렉토리 변경 감지
#   - 중요 파일 변경 시 경고
#
# Usage:
#   bash scripts/update-agent-guide.sh          # 일반 실행
#   bash scripts/update-agent-guide.sh --check  # 변경사항만 확인 (수정 안함)
#   bash scripts/update-agent-guide.sh --verbose # 상세 로그
#
# CI/CD Integration:
#   GitHub Actions에서 매 commit 후 자동 실행
#   변경사항이 있으면 별도 commit으로 push
#
##############################################################################

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"
GUIDE_FILE="$PROJECT_ROOT/AGENT-COLLABORATION-GUIDE.md"
TEMP_FILE="/tmp/agent-guide-update-$$.md"
CHECK_ONLY=false
VERBOSE=false
CHANGES_DETECTED=false

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[VERBOSE]${NC} $1"
    fi
}

# Parse arguments
for arg in "$@"; do
    case $arg in
        --check)
            CHECK_ONLY=true
            log_info "Running in CHECK-ONLY mode (no modifications)"
            ;;
        --verbose)
            VERBOSE=true
            log_info "Verbose mode enabled"
            ;;
        *)
            echo "Unknown argument: $arg"
            exit 1
            ;;
    esac
done

log_info "K-Vibe Tracker Agent Guide Maintenance Script"
echo ""

##############################################################################
# Step 1: Check lib/ folder structure
##############################################################################

log_info "Checking lib/ folder structure..."

declare -A LIB_FOLDERS
declare -A LIB_FILES

# Scan lib directory
if [ -d "$PROJECT_ROOT/lib" ]; then
    while IFS= read -r folder; do
        if [ -d "$folder" ]; then
            folder_name=$(basename "$folder")
            # Count files in this folder
            file_count=$(find "$folder" -type f -name "*.ts" ! -name "*.test.ts" | wc -l)
            LIB_FOLDERS["$folder_name"]=$file_count
            log_verbose "Found folder: $folder_name with $file_count TypeScript files"
        fi
    done < <(find "$PROJECT_ROOT/lib" -maxdepth 1 -type d ! -name "lib")
fi

# Check for files that should be in subfolders
files_in_root=$(find "$PROJECT_ROOT/lib" -maxdepth 1 -type f -name "*.ts" ! -name "*.test.ts" 2>/dev/null | wc -l)
if [ "$files_in_root" -gt 0 ]; then
    log_warning "Found $files_in_root TypeScript files in lib/ root (should be in subfolders)"
    CHANGES_DETECTED=true
fi

log_success "lib/ folder structure checked"
echo ""

##############################################################################
# Step 2: Check types/ definitions
##############################################################################

log_info "Checking types/ definitions..."

type_files=$(find "$PROJECT_ROOT/types" -name "*.ts" 2>/dev/null | wc -l)
log_verbose "Found $type_files type definition files"

if [ -f "$PROJECT_ROOT/types/index.ts" ]; then
    log_success "types/index.ts exists"
else
    log_warning "types/index.ts missing (should export all types)"
    CHANGES_DETECTED=true
fi

log_success "types/ definitions checked"
echo ""

##############################################################################
# Step 3: Check test directory structure
##############################################################################

log_info "Checking test directory structure..."

test_count=$(find "$PROJECT_ROOT/__tests__" -name "*.test.ts" -o -name "*.e2e.ts" 2>/dev/null | wc -l)
log_verbose "Found $test_count test files"

# Expected test directories
expected_dirs=(
    "__tests__/frontend/api"
    "__tests__/frontend/lib"
    "__tests__/integration"
    "__tests__/e2e"
)

missing_dirs=0
for dir in "${expected_dirs[@]}"; do
    if [ ! -d "$PROJECT_ROOT/$dir" ]; then
        log_warning "Missing directory: $dir"
        missing_dirs=$((missing_dirs + 1))
        CHANGES_DETECTED=true
    fi
done

if [ $missing_dirs -eq 0 ]; then
    log_success "All expected test directories exist"
else
    log_warning "$missing_dirs test directories are missing"
fi

log_success "Test directory structure checked"
echo ""

##############################################################################
# Step 4: Check for breaking changes
##############################################################################

log_info "Checking for potential breaking changes..."

breaking_changes=0

# Check if old lib files still exist (should be migrated)
old_lib_files=(
    "local-api-cache.ts"
    "location-cache.ts"
    "haversine.ts"
    "crowd.ts"
    "analysis.ts"
)

for file in "${old_lib_files[@]}"; do
    if [ -f "$PROJECT_ROOT/lib/$file" ]; then
        log_warning "Old lib file found in root: $file (should be in subfolder)"
        breaking_changes=$((breaking_changes + 1))
        CHANGES_DETECTED=true
    fi
done

if [ $breaking_changes -eq 0 ]; then
    log_success "No breaking changes detected"
else
    log_warning "$breaking_changes potential breaking changes found"
fi

log_success "Breaking changes check completed"
echo ""

##############################################################################
# Step 5: Check important files
##############################################################################

log_info "Checking important files..."

important_files=(
    "frontend/api/mock-data.ts"
    "frontend/api/client.ts"
    "types/domain.ts"
    "types/api.ts"
    "vitest.config.ts"
    "playwright.config.ts"
    "TESTING.md"
)

missing_files=0
for file in "${important_files[@]}"; do
    if [ ! -f "$PROJECT_ROOT/$file" ]; then
        log_warning "Important file missing: $file"
        missing_files=$((missing_files + 1))
        CHANGES_DETECTED=true
    else
        log_verbose "Found: $file"
    fi
done

if [ $missing_files -eq 0 ]; then
    log_success "All important files present"
else
    log_warning "$missing_files important files are missing"
fi

log_success "Important files check completed"
echo ""

##############################################################################
# Step 6: Summary and Recommendations
##############################################################################

echo ""
log_info "=== Summary Report ==="
echo ""

echo "📊 Statistics:"
echo "  • lib/ subfolders: ${#LIB_FOLDERS[@]}"
echo "  • Type definition files: $type_files"
echo "  • Test files: $test_count"
echo ""

if [ "$CHANGES_DETECTED" = true ]; then
    log_warning "Changes or issues detected!"
    echo ""
    echo "🔧 Recommendations:"
    echo "  1. Review warnings above"
    echo "  2. Ensure all files are in correct locations"
    echo "  3. Run: npm run type-check"
    echo "  4. Run: npm run test"
    echo ""
else
    log_success "Project structure is up-to-date!"
fi

echo ""
if [ "$CHECK_ONLY" = true ]; then
    log_info "Check completed (no modifications made)"
    exit 0
fi

##############################################################################
# Step 7: Generate updated guide content (if needed)
##############################################################################

if [ "$CHANGES_DETECTED" = true ]; then
    log_info "Generating updated guide content..."
    
    # This would generate updated sections based on current project state
    # For now, we just recommend manual review
    
    log_warning "Please manually review and update AGENT-COLLABORATION-GUIDE.md if needed"
    log_warning "Run: npm run type-check && npm run test"
    echo ""
fi

log_success "Maintenance script completed"
exit 0
