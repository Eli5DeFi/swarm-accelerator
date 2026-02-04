#!/bin/bash
# automate-everything.sh - VentureClaw Master Automation Script
# Orchestrates evolution, deployment, testing, and monitoring

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs/automation"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/automation_${TIMESTAMP}.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

header() {
    echo "" | tee -a "$LOG_FILE"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
    echo -e "${BLUE}  $1${NC}" | tee -a "$LOG_FILE"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
}

# Function: Check Evolution System Status
check_evolution_status() {
    header "EVOLUTION SYSTEM STATUS"
    
    log "Checking cron jobs..."
    if command -v openclaw &> /dev/null; then
        openclaw cron list --includeDisabled 2>&1 | tee -a "$LOG_FILE" || warn "Failed to list cron jobs"
    else
        warn "OpenClaw CLI not found"
    fi
    
    log "Checking isolated sessions..."
    if [ -d "$HOME/.openclaw/agents/main/sessions" ]; then
        session_count=$(ls -1 "$HOME/.openclaw/agents/main/sessions" | wc -l)
        log "Found $session_count session files"
    fi
}

# Function: Test Build
test_build() {
    header "BUILD TEST"
    
    log "Installing dependencies..."
    if npm install --legacy-peer-deps 2>&1 | tee -a "$LOG_FILE"; then
        success "Dependencies installed"
    else
        error "Dependency installation failed"
        return 1
    fi
    
    log "Running TypeScript check..."
    if npm run build 2>&1 | tee -a "$LOG_FILE"; then
        success "Build passed"
        return 0
    else
        error "Build failed"
        return 1
    fi
}

# Function: Deploy to Vercel
deploy_to_vercel() {
    header "VERCEL DEPLOYMENT"
    
    if ! command -v vercel &> /dev/null; then
        warn "Vercel CLI not installed. Install with: npm i -g vercel"
        return 1
    fi
    
    log "Deploying to Vercel..."
    if vercel --prod --yes 2>&1 | tee -a "$LOG_FILE"; then
        success "Deployed to production"
        return 0
    else
        error "Deployment failed"
        return 1
    fi
}

# Function: Run Tests
run_tests() {
    header "RUNNING TESTS"
    
    if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
        log "Running test suite..."
        npm test 2>&1 | tee -a "$LOG_FILE" || warn "Some tests failed"
    else
        warn "No test script found"
    fi
}

# Function: Check Git Status
check_git_status() {
    header "GIT STATUS"
    
    log "Checking for uncommitted changes..."
    if [ -n "$(git status --porcelain)" ]; then
        warn "Uncommitted changes found:"
        git status --short | tee -a "$LOG_FILE"
        return 1
    else
        success "Working directory clean"
        return 0
    fi
}

# Function: Commit and Push
commit_and_push() {
    header "GIT COMMIT & PUSH"
    
    if [ -z "$(git status --porcelain)" ]; then
        log "Nothing to commit"
        return 0
    fi
    
    log "Adding all changes..."
    git add -A
    
    log "Creating commit..."
    git commit -m "🤖 Automated update - $(date +'%Y-%m-%d %H:%M')" 2>&1 | tee -a "$LOG_FILE"
    
    log "Pushing to origin..."
    if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
        success "Changes pushed"
        return 0
    else
        error "Push failed"
        return 1
    fi
}

# Function: Generate Status Report
generate_report() {
    header "AUTOMATION REPORT"
    
    cat << EOF | tee -a "$LOG_FILE"

📊 VentureClaw Automation Summary
═════════════════════════════════

Timestamp: $(date)
Log File: $LOG_FILE

Evolution System:
  • Cron Jobs: $CRON_STATUS
  • Active Sessions: $SESSION_COUNT

Build & Deploy:
  • Build Status: $BUILD_STATUS
  • Deployment: $DEPLOY_STATUS
  
Git Status:
  • Working Directory: $GIT_STATUS
  • Last Push: $PUSH_STATUS

═════════════════════════════════

EOF
}

# Function: Main Automation Flow
main() {
    header "🤖 VENTURECLAW MASTER AUTOMATION"
    log "Starting automation sequence..."
    
    cd "$SCRIPT_DIR"
    
    # 1. Check Evolution System
    check_evolution_status
    CRON_STATUS="Checked ✓"
    SESSION_COUNT="Unknown"
    
    # 2. Check Git Status
    if check_git_status; then
        GIT_STATUS="Clean ✓"
    else
        GIT_STATUS="Dirty ⚠"
    fi
    
    # 3. Test Build
    if test_build; then
        BUILD_STATUS="Passed ✓"
    else
        BUILD_STATUS="Failed ✗"
        warn "Skipping deployment due to build failure"
        generate_report
        return 1
    fi
    
    # 4. Commit changes if any
    if [ "$GIT_STATUS" = "Dirty ⚠" ]; then
        if commit_and_push; then
            PUSH_STATUS="Success ✓"
        else
            PUSH_STATUS="Failed ✗"
        fi
    else
        PUSH_STATUS="N/A"
    fi
    
    # 5. Deploy to Vercel (optional)
    if [ "$1" = "--deploy" ]; then
        if deploy_to_vercel; then
            DEPLOY_STATUS="Success ✓"
        else
            DEPLOY_STATUS="Failed ✗"
        fi
    else
        DEPLOY_STATUS="Skipped"
    fi
    
    # 6. Generate Report
    generate_report
    
    success "Automation complete!"
}

# Parse arguments
case "$1" in
    --help|-h)
        cat << EOF
VentureClaw Master Automation Script

Usage:
  ./automate-everything.sh [OPTIONS]

Options:
  --deploy              Deploy to Vercel after successful build
  --skip-build          Skip build test
  --evolution-only      Only check evolution system
  --help, -h            Show this help message

Examples:
  ./automate-everything.sh                  # Run full automation (no deploy)
  ./automate-everything.sh --deploy         # Run full automation + deploy
  ./automate-everything.sh --evolution-only # Only check evolution system

EOF
        exit 0
        ;;
    --evolution-only)
        check_evolution_status
        exit 0
        ;;
esac

# Run main automation
main "$@"
