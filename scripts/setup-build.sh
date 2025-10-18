#!/bin/bash

# Toubkal Browser - Build Setup Script for Linux/macOS
# This script sets up the build environment for Toubkal Browser development

set -euo pipefail

# =============================================================================
# CONFIGURATION
# =============================================================================

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly SRC_DIR="${PROJECT_ROOT}/src"
readonly BUILD_DIR="${PROJECT_ROOT}/build"
readonly LOG_DIR="${PROJECT_ROOT}/logs"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging
readonly LOG_FILE="${LOG_DIR}/setup-build.log"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Logging functions
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
    log "INFO" "${BLUE}$*${NC}"
}

log_success() {
    log "SUCCESS" "${GREEN}$*${NC}"
}

log_warning() {
    log "WARNING" "${YELLOW}$*${NC}"
}

log_error() {
    log "ERROR" "${RED}$*${NC}"
}

# Error handling
error_exit() {
    local exit_code="$1"
    shift
    log_error "$*"
    exit "${exit_code}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_system_requirements() {
    log_info "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log_info "Detected Linux system"
        PLATFORM="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        log_info "Detected macOS system"
        PLATFORM="mac"
    else
        error_exit 1 "Unsupported operating system: $OSTYPE"
    fi
    
    # Check required commands
    local required_commands=("git" "python3" "node" "pnpm")
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            error_exit 1 "Required command not found: $cmd"
        fi
    done
    
    # Check Python version
    local python_version
    python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    if [[ $(echo "$python_version < 3.8" | bc -l) -eq 1 ]]; then
        error_exit 1 "Python 3.8+ required, found: $python_version"
    fi
    
    # Check Node.js version
    local node_version
    node_version=$(node --version | sed 's/v//')
    if [[ $(echo "$node_version < 18.0" | bc -l) -eq 1 ]]; then
        error_exit 1 "Node.js 18+ required, found: $node_version"
    fi
    
    # Check available memory
    local available_memory
    if [[ "$PLATFORM" == "linux" ]]; then
        available_memory=$(free -g | awk '/^Mem:/{print $2}')
    else
        available_memory=$(sysctl -n hw.memsize | awk '{print int($0/1024/1024/1024)}')
    fi
    
    if [[ $available_memory -lt 16 ]]; then
        log_warning "Low memory detected: ${available_memory}GB (16GB recommended)"
    fi
    
    # Check available disk space
    local available_space
    available_space=$(df -BG "${PROJECT_ROOT}" | awk 'NR==2{print $4}' | sed 's/G//')
    if [[ $available_space -lt 100 ]]; then
        log_warning "Low disk space detected: ${available_space}GB (100GB recommended)"
    fi
    
    log_success "System requirements check completed"
}

# Install system dependencies
install_system_dependencies() {
    log_info "Installing system dependencies..."
    
    if [[ "$PLATFORM" == "linux" ]]; then
        # Ubuntu/Debian
        if command_exists apt-get; then
            log_info "Installing dependencies via apt-get..."
            sudo apt-get update
            sudo apt-get install -y \
                build-essential \
                libnss3-dev \
                libatk-bridge2.0-dev \
                libdrm2 \
                libxcomposite1 \
                libxdamage1 \
                libxrandr2 \
                libgbm1 \
                libxss1 \
                libasound2-dev \
                libxrandr2 \
                libxss1 \
                libgconf-2-4 \
                libxrandr2 \
                libxss1 \
                libasound2-dev \
                libxrandr2 \
                libxss1 \
                libgconf-2-4 \
                python3-dev \
                python3-pip \
                python3-venv \
                curl \
                wget \
                unzip \
                pkg-config \
                libglib2.0-dev \
                libgtk-3-dev \
                libx11-dev \
                libxext-dev \
                libxrender-dev \
                libxtst-dev \
                libxrandr-dev \
                libxinerama-dev \
                libxcursor-dev \
                libxi-dev \
                libxss-dev \
                libgconf-2-dev \
                libnss3-dev \
                libxcomposite-dev \
                libxdamage-dev \
                libxrandr-dev \
                libgbm-dev \
                libxss-dev \
                libasound2-dev \
                libxrandr-dev \
                libxss-dev \
                libgconf-2-dev
        else
            log_warning "Package manager not supported. Please install dependencies manually."
        fi
    elif [[ "$PLATFORM" == "mac" ]]; then
        # macOS
        if command_exists brew; then
            log_info "Installing dependencies via Homebrew..."
            brew install python@3.9 git node pnpm pkg-config
        else
            log_warning "Homebrew not found. Please install dependencies manually."
        fi
    fi
    
    log_success "System dependencies installation completed"
}

# Install depot_tools
install_depot_tools() {
    log_info "Installing depot_tools..."
    
    local depot_tools_dir="${PROJECT_ROOT}/depot_tools"
    
    if [[ -d "$depot_tools_dir" ]]; then
        log_info "depot_tools already installed, updating..."
        cd "$depot_tools_dir"
        git pull
    else
        log_info "Cloning depot_tools..."
        git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git "$depot_tools_dir"
    fi
    
    # Add depot_tools to PATH
    export PATH="$depot_tools_dir:$PATH"
    echo 'export PATH="'$depot_tools_dir':$PATH"' >> ~/.bashrc
    echo 'export PATH="'$depot_tools_dir':$PATH"' >> ~/.zshrc
    
    # Verify installation
    if ! command_exists gclient; then
        error_exit 1 "depot_tools installation failed"
    fi
    
    log_success "depot_tools installation completed"
}

# Setup gclient configuration
setup_gclient() {
    log_info "Setting up gclient configuration..."
    
    local gclient_file="${PROJECT_ROOT}/.gclient"
    local gclient_template="${PROJECT_ROOT}/.gclient.template"
    
    if [[ ! -f "$gclient_template" ]]; then
        error_exit 1 "gclient template not found: $gclient_template"
    fi
    
    if [[ -f "$gclient_file" ]]; then
        log_info "gclient configuration already exists, backing up..."
        cp "$gclient_file" "${gclient_file}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Copy template and customize
    cp "$gclient_template" "$gclient_file"
    
    # Customize for current platform
    if [[ "$PLATFORM" == "linux" ]]; then
        sed -i 's/target_os = \[/target_os = ["linux"/' "$gclient_file"
    elif [[ "$PLATFORM" == "mac" ]]; then
        sed -i 's/target_os = \[/target_os = ["mac"/' "$gclient_file"
    fi
    
    log_success "gclient configuration setup completed"
}

# Setup GN build configuration
setup_gn_config() {
    log_info "Setting up GN build configuration..."
    
    local args_gn_file="${PROJECT_ROOT}/args.gn"
    local args_gn_template="${PROJECT_ROOT}/args.gn.template"
    
    if [[ ! -f "$args_gn_template" ]]; then
        error_exit 1 "args.gn template not found: $args_gn_template"
    fi
    
    if [[ -f "$args_gn_file" ]]; then
        log_info "args.gn already exists, backing up..."
        cp "$args_gn_file" "${args_gn_file}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Copy template and customize
    cp "$args_gn_template" "$args_gn_file"
    
    # Customize for current platform
    if [[ "$PLATFORM" == "linux" ]]; then
        sed -i 's/target_os = "linux"/target_os = "linux"/' "$args_gn_file"
    elif [[ "$PLATFORM" == "mac" ]]; then
        sed -i 's/target_os = "linux"/target_os = "mac"/' "$args_gn_file"
    fi
    
    log_success "GN build configuration setup completed"
}

# Sync Chromium source
sync_chromium_source() {
    log_info "Syncing Chromium source code..."
    
    if [[ ! -d "$SRC_DIR" ]]; then
        log_info "Creating src directory..."
        mkdir -p "$SRC_DIR"
    fi
    
    cd "$SRC_DIR"
    
    # Initialize gclient if needed
    if [[ ! -f ".gclient" ]]; then
        log_info "Initializing gclient workspace..."
        gclient config --spec 'solutions = [{"name": "src", "url": "https://chromium.googlesource.com/chromium/src.git", "managed": False}]'
    fi
    
    # Sync source code
    log_info "Syncing Chromium source (this may take a while)..."
    gclient sync --jobs=8 --no-history
    
    # Apply Toubkal patches
    log_info "Applying Toubkal Browser patches..."
    gclient runhooks
    
    log_success "Chromium source sync completed"
}

# Setup build environment
setup_build_environment() {
    log_info "Setting up build environment..."
    
    # Create build directory
    mkdir -p "$BUILD_DIR"
    
    # Create logs directory
    mkdir -p "$LOG_DIR"
    
    # Setup environment variables
    export CHROMIUM_BUILDTOOLS_PATH="${SRC_DIR}/buildtools"
    export PATH="${SRC_DIR}/buildtools:$PATH"
    
    # Generate build files
    cd "$SRC_DIR"
    gn gen out/Default --args="$(cat ../../args.gn)"
    
    log_success "Build environment setup completed"
}

# Install Node.js dependencies
install_node_dependencies() {
    log_info "Installing Node.js dependencies..."
    
    cd "$PROJECT_ROOT"
    
    # Install pnpm if not available
    if ! command_exists pnpm; then
        log_info "Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Install dependencies
    pnpm install
    
    log_success "Node.js dependencies installation completed"
}

# Verify setup
verify_setup() {
    log_info "Verifying setup..."
    
    # Check gclient
    if ! command_exists gclient; then
        error_exit 1 "gclient not found in PATH"
    fi
    
    # Check GN
    if ! command_exists gn; then
        error_exit 1 "gn not found in PATH"
    fi
    
    # Check Chromium source
    if [[ ! -d "$SRC_DIR" ]]; then
        error_exit 1 "Chromium source directory not found: $SRC_DIR"
    fi
    
    # Check build configuration
    if [[ ! -f "${PROJECT_ROOT}/args.gn" ]]; then
        error_exit 1 "args.gn not found"
    fi
    
    # Test build generation
    cd "$SRC_DIR"
    if ! gn gen out/Default --args="$(cat ../../args.gn)"; then
        error_exit 1 "Build generation failed"
    fi
    
    log_success "Setup verification completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    # Add cleanup logic here if needed
}

# Main function
main() {
    local start_time=$(date +%s)
    
    log_info "Starting Toubkal Browser build setup..."
    log_info "Project root: $PROJECT_ROOT"
    log_info "Platform: $OSTYPE"
    
    # Create logs directory
    mkdir -p "$LOG_DIR"
    
    # Set up error handling
    trap cleanup EXIT
    
    # Run setup steps
    check_system_requirements
    install_system_dependencies
    install_depot_tools
    setup_gclient
    setup_gn_config
    sync_chromium_source
    setup_build_environment
    install_node_dependencies
    verify_setup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Toubkal Browser build setup completed successfully!"
    log_info "Setup took: ${duration} seconds"
    log_info "Next steps:"
    log_info "  1. Run './scripts/build.sh' to build Toubkal Browser"
    log_info "  2. Run './scripts/build.sh --test' to run tests"
    log_info "  3. Check logs in: $LOG_DIR"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --help, -h     Show this help message"
            echo "  --clean        Clean existing setup before starting"
            echo "  --quick        Skip system dependency installation"
            echo "  --verbose, -v  Enable verbose output"
            exit 0
            ;;
        --clean)
            log_info "Cleaning existing setup..."
            rm -rf "$SRC_DIR" "$BUILD_DIR" "$LOG_DIR"
            rm -f "${PROJECT_ROOT}/.gclient" "${PROJECT_ROOT}/args.gn"
            shift
            ;;
        --quick)
            SKIP_SYSTEM_DEPS=true
            shift
            ;;
        --verbose|-v)
            set -x
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"