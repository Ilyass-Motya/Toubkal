#!/bin/bash

# Toubkal Browser - Cross-Platform Build Script
# This script builds Toubkal Browser for Linux, macOS, and Windows

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
readonly OUT_DIR="${SRC_DIR}/out"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging
readonly LOG_FILE="${LOG_DIR}/build.log"

# Build configuration
BUILD_TARGET="Default"
BUILD_TYPE="debug"
BUILD_PLATFORM=""
CLEAN_BUILD=false
RUN_TESTS=false
PACKAGE_BUILD=false
VERBOSE=false
JOBS=0

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

# Detect platform
detect_platform() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        BUILD_PLATFORM="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        BUILD_PLATFORM="mac"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        BUILD_PLATFORM="win"
    else
        error_exit 1 "Unsupported platform: $OSTYPE"
    fi
    log_info "Detected platform: $BUILD_PLATFORM"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking build prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -d "$SRC_DIR" ]]; then
        error_exit 1 "Source directory not found: $SRC_DIR. Run setup-build.sh first."
    fi
    
    # Check required commands
    local required_commands=("gn" "ninja")
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            error_exit 1 "Required command not found: $cmd"
        fi
    done
    
    # Check build configuration
    if [[ ! -f "${PROJECT_ROOT}/args.gn" ]]; then
        error_exit 1 "Build configuration not found: ${PROJECT_ROOT}/args.gn"
    fi
    
    # Check if gclient is configured
    if [[ ! -f "${SRC_DIR}/.gclient" ]]; then
        error_exit 1 "gclient not configured. Run setup-build.sh first."
    fi
    
    log_success "Prerequisites check completed"
}

# Clean build directory
clean_build() {
    log_info "Cleaning build directory..."
    
    if [[ -d "$OUT_DIR" ]]; then
        rm -rf "$OUT_DIR"
        log_info "Removed existing build directory: $OUT_DIR"
    fi
    
    # Clean build artifacts
    if [[ -d "$BUILD_DIR" ]]; then
        rm -rf "$BUILD_DIR"
        log_info "Removed build artifacts directory: $BUILD_DIR"
    fi
    
    log_success "Build directory cleaned"
}

# Generate build files
generate_build_files() {
    log_info "Generating build files..."
    
    cd "$SRC_DIR"
    
    # Create output directory
    mkdir -p "out/${BUILD_TARGET}"
    
    # Generate build files
    local gn_args="$(cat "${PROJECT_ROOT}/args.gn")"
    
    # Add platform-specific arguments
    case "$BUILD_PLATFORM" in
        "linux")
            gn_args="${gn_args}
target_os = \"linux\"
target_cpu = \"x64\""
            ;;
        "mac")
            gn_args="${gn_args}
target_os = \"mac\"
target_cpu = \"x64\""
            ;;
        "win")
            gn_args="${gn_args}
target_os = \"win\"
target_cpu = \"x64\""
            ;;
    esac
    
    # Add build type
    if [[ "$BUILD_TYPE" == "release" ]]; then
        gn_args="${gn_args}
is_debug = false
is_official_build = true"
    else
        gn_args="${gn_args}
is_debug = true
is_official_build = false"
    fi
    
    # Generate build files
    if ! gn gen "out/${BUILD_TARGET}" --args="$gn_args"; then
        error_exit 1 "Failed to generate build files"
    fi
    
    log_success "Build files generated"
}

# Build the project
build_project() {
    log_info "Building Toubkal Browser..."
    
    cd "$SRC_DIR"
    
    # Determine number of jobs
    local num_jobs="$JOBS"
    if [[ "$num_jobs" -eq 0 ]]; then
        num_jobs=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo "4")
    fi
    
    log_info "Using $num_jobs parallel jobs"
    
    # Build the project
    local build_start_time=$(date +%s)
    
    if ! ninja -C "out/${BUILD_TARGET}" -j "$num_jobs"; then
        error_exit 1 "Build failed"
    fi
    
    local build_end_time=$(date +%s)
    local build_duration=$((build_end_time - build_start_time))
    
    log_success "Build completed in ${build_duration} seconds"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    cd "$SRC_DIR"
    
    # Run unit tests
    log_info "Running unit tests..."
    if ! ninja -C "out/${BUILD_TARGET}" -j "$JOBS" test; then
        log_warning "Some unit tests failed"
    fi
    
    # Run integration tests
    log_info "Running integration tests..."
    if ! ninja -C "out/${BUILD_TARGET}" -j "$JOBS" integration_tests; then
        log_warning "Some integration tests failed"
    fi
    
    # Run Toubkal-specific tests
    log_info "Running Toubkal-specific tests..."
    if [[ -f "out/${BUILD_TARGET}/toubkal_tests" ]]; then
        if ! "out/${BUILD_TARGET}/toubkal_tests"; then
            log_warning "Some Toubkal tests failed"
        fi
    fi
    
    log_success "Tests completed"
}

# Package the build
package_build() {
    log_info "Packaging build..."
    
    cd "$SRC_DIR"
    
    # Create package directory
    local package_dir="${BUILD_DIR}/toubkal-browser-${BUILD_PLATFORM}-${BUILD_TYPE}"
    mkdir -p "$package_dir"
    
    # Copy binaries
    case "$BUILD_PLATFORM" in
        "linux")
            cp -r "out/${BUILD_TARGET}/toubkal-browser" "$package_dir/"
            cp -r "out/${BUILD_TARGET}/toubkal-browser-test" "$package_dir/"
            ;;
        "mac")
            cp -r "out/${BUILD_TARGET}/Toubkal Browser.app" "$package_dir/"
            ;;
        "win")
            cp -r "out/${BUILD_TARGET}/toubkal-browser.exe" "$package_dir/"
            cp -r "out/${BUILD_TARGET}/toubkal-browser-test.exe" "$package_dir/"
            ;;
    esac
    
    # Copy resources
    if [[ -d "out/${BUILD_TARGET}/resources" ]]; then
        cp -r "out/${BUILD_TARGET}/resources" "$package_dir/"
    fi
    
    # Create package archive
    local package_name="toubkal-browser-${BUILD_PLATFORM}-${BUILD_TYPE}-$(date +%Y%m%d_%H%M%S)"
    cd "$BUILD_DIR"
    
    case "$BUILD_PLATFORM" in
        "linux"|"mac")
            tar -czf "${package_name}.tar.gz" "toubkal-browser-${BUILD_PLATFORM}-${BUILD_TYPE}"
            ;;
        "win")
            zip -r "${package_name}.zip" "toubkal-browser-${BUILD_PLATFORM}-${BUILD_TYPE}"
            ;;
    esac
    
    log_success "Package created: ${BUILD_DIR}/${package_name}.*"
}

# Verify build
verify_build() {
    log_info "Verifying build..."
    
    cd "$SRC_DIR"
    
    # Check if main binary exists
    local binary_path=""
    case "$BUILD_PLATFORM" in
        "linux")
            binary_path="out/${BUILD_TARGET}/toubkal-browser"
            ;;
        "mac")
            binary_path="out/${BUILD_TARGET}/Toubkal Browser.app/Contents/MacOS/Toubkal Browser"
            ;;
        "win")
            binary_path="out/${BUILD_TARGET}/toubkal-browser.exe"
            ;;
    esac
    
    if [[ ! -f "$binary_path" ]]; then
        error_exit 1 "Main binary not found: $binary_path"
    fi
    
    # Check binary size
    local binary_size
    binary_size=$(stat -c%s "$binary_path" 2>/dev/null || stat -f%z "$binary_path" 2>/dev/null || echo "0")
    log_info "Binary size: $((binary_size / 1024 / 1024))MB"
    
    # Check if binary is executable
    if [[ ! -x "$binary_path" ]]; then
        log_warning "Binary is not executable: $binary_path"
    fi
    
    log_success "Build verification completed"
}

# Show build information
show_build_info() {
    log_info "Build Information:"
    log_info "  Platform: $BUILD_PLATFORM"
    log_info "  Target: $BUILD_TARGET"
    log_info "  Type: $BUILD_TYPE"
    log_info "  Jobs: $JOBS"
    log_info "  Clean: $CLEAN_BUILD"
    log_info "  Tests: $RUN_TESTS"
    log_info "  Package: $PACKAGE_BUILD"
    log_info "  Verbose: $VERBOSE"
}

# Show help
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
  --target, -t TARGET     Build target (Default, Debug, Release) [default: Default]
  --type, -T TYPE         Build type (debug, release) [default: debug]
  --clean, -c             Clean build directory before building
  --test, -t              Run tests after building
  --package, -p           Package the build after building
  --jobs, -j JOBS         Number of parallel jobs (0 = auto-detect) [default: 0]
  --verbose, -v           Enable verbose output
  --help, -h              Show this help message

Examples:
  $0                      # Build with default settings
  $0 --clean --test       # Clean build and run tests
  $0 --type release --package  # Build release and package
  $0 --target Debug --jobs 8   # Build debug with 8 jobs

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --target|-t)
                BUILD_TARGET="$2"
                shift 2
                ;;
            --type|-T)
                BUILD_TYPE="$2"
                if [[ "$BUILD_TYPE" != "debug" && "$BUILD_TYPE" != "release" ]]; then
                    error_exit 1 "Invalid build type: $BUILD_TYPE (must be debug or release)"
                fi
                shift 2
                ;;
            --clean|-c)
                CLEAN_BUILD=true
                shift
                ;;
            --test|-t)
                RUN_TESTS=true
                shift
                ;;
            --package|-p)
                PACKAGE_BUILD=true
                shift
                ;;
            --jobs|-j)
                JOBS="$2"
                if [[ ! "$JOBS" =~ ^[0-9]+$ ]]; then
                    error_exit 1 "Invalid number of jobs: $JOBS (must be a positive integer)"
                fi
                shift 2
                ;;
            --verbose|-v)
                VERBOSE=true
                set -x
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                error_exit 1 "Unknown option: $1"
                ;;
        esac
    done
}

# Main function
main() {
    local start_time=$(date +%s)
    
    # Parse arguments
    parse_arguments "$@"
    
    # Show build information
    show_build_info
    
    # Create logs directory
    mkdir -p "$LOG_DIR"
    
    # Detect platform
    detect_platform
    
    # Check prerequisites
    check_prerequisites
    
    # Clean build if requested
    if [[ "$CLEAN_BUILD" == "true" ]]; then
        clean_build
    fi
    
    # Generate build files
    generate_build_files
    
    # Build the project
    build_project
    
    # Run tests if requested
    if [[ "$RUN_TESTS" == "true" ]]; then
        run_tests
    fi
    
    # Package build if requested
    if [[ "$PACKAGE_BUILD" == "true" ]]; then
        package_build
    fi
    
    # Verify build
    verify_build
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Toubkal Browser build completed successfully!"
    log_info "Total build time: ${duration} seconds"
    log_info "Build output: $OUT_DIR/$BUILD_TARGET"
    
    if [[ "$RUN_TESTS" == "true" ]]; then
        log_info "Test results: $LOG_DIR/test-results.log"
    fi
    
    if [[ "$PACKAGE_BUILD" == "true" ]]; then
        log_info "Package location: $BUILD_DIR/"
    fi
}

# Run main function
main "$@"