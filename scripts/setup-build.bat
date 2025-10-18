@echo off
REM Toubkal Browser - Build Setup Script for Windows
REM This script sets up the build environment for Toubkal Browser development

setlocal enabledelayedexpansion

REM =============================================================================
REM CONFIGURATION
REM =============================================================================

set "SCRIPT_NAME=%~nx0"
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "SRC_DIR=%PROJECT_ROOT%\src"
set "BUILD_DIR=%PROJECT_ROOT%\build"
set "LOG_DIR=%PROJECT_ROOT%\logs"

REM Create logs directory
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Set log file
set "LOG_FILE=%LOG_DIR%\setup-build.log"

REM =============================================================================
REM UTILITY FUNCTIONS
REM =============================================================================

REM Logging functions
:log
set "level=%1"
set "message=%2"
for /f "tokens=1-3 delims=:" %%a in ("%time%") do set "timestamp=%%a:%%b:%%c"
echo %timestamp% [%level%] %message% | tee -a "%LOG_FILE%"
goto :eof

:log_info
call :log "INFO" "%1"
goto :eof

:log_success
call :log "SUCCESS" "%1"
goto :eof

:log_warning
call :log "WARNING" "%1"
goto :eof

:log_error
call :log "ERROR" "%1"
goto :eof

REM Error handling
:error_exit
set "exit_code=%1"
call :log_error "%2"
exit /b %exit_code%

REM Check if command exists
:command_exists
where %1 >nul 2>&1
if %errorlevel% equ 0 (
    set "result=1"
) else (
    set "result=0"
)
goto :eof

REM =============================================================================
REM MAIN FUNCTIONS
REM =============================================================================

REM Check system requirements
:check_system_requirements
call :log_info "Checking system requirements..."

REM Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
if %VERSION% LSS 10.0 (
    call :error_exit 1 "Windows 10 or later required, found: %VERSION%"
)

REM Check required commands
set "required_commands=git python node pnpm"
for %%c in (%required_commands%) do (
    call :command_exists %%c
    if !result! equ 0 (
        call :error_exit 1 "Required command not found: %%c"
    )
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set "python_version=%%i"
for /f "tokens=1-2 delims=." %%a in ("%python_version%") do (
    if %%a LSS 3 (
        call :error_exit 1 "Python 3.8+ required, found: %python_version%"
    )
    if %%a equ 3 if %%b LSS 8 (
        call :error_exit 1 "Python 3.8+ required, found: %python_version%"
    )
)

REM Check Node.js version
for /f "tokens=1" %%i in ('node --version') do set "node_version=%%i"
set "node_version=%node_version:v=%"
for /f "tokens=1-2 delims=." %%a in ("%node_version%") do (
    if %%a LSS 18 (
        call :error_exit 1 "Node.js 18+ required, found: %node_version%"
    )
)

REM Check available memory
for /f "tokens=2" %%i in ('wmic OS get TotalVisibleMemorySize /value ^| find "="') do set "total_memory=%%i"
set /a "total_memory_gb=%total_memory% / 1024 / 1024"
if %total_memory_gb% LSS 16 (
    call :log_warning "Low memory detected: %total_memory_gb%GB (16GB recommended)"
)

REM Check available disk space
for /f "tokens=3" %%i in ('dir "%PROJECT_ROOT%" ^| find "bytes free"') do set "free_space=%%i"
set /a "free_space_gb=%free_space% / 1024 / 1024 / 1024"
if %free_space_gb% LSS 100 (
    call :log_warning "Low disk space detected: %free_space_gb%GB (100GB recommended)"
)

call :log_success "System requirements check completed"
goto :eof

REM Install system dependencies
:install_system_dependencies
call :log_info "Installing system dependencies..."

REM Check if Chocolatey is installed
call :command_exists choco
if !result! equ 0 (
    call :log_info "Installing Chocolatey..."
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
)

REM Install build dependencies
call :log_info "Installing dependencies via Chocolatey..."
choco install -y git python nodejs pnpm visualstudio2019buildtools visualstudio2019-workload-vctools

call :log_success "System dependencies installation completed"
goto :eof

REM Install depot_tools
:install_depot_tools
call :log_info "Installing depot_tools..."

set "depot_tools_dir=%PROJECT_ROOT%\depot_tools"

if exist "%depot_tools_dir%" (
    call :log_info "depot_tools already installed, updating..."
    cd /d "%depot_tools_dir%"
    git pull
) else (
    call :log_info "Cloning depot_tools..."
    git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git "%depot_tools_dir%"
)

REM Add depot_tools to PATH
set "PATH=%depot_tools_dir%;%PATH%"
setx PATH "%depot_tools_dir%;%PATH%" /M

REM Verify installation
call :command_exists gclient
if !result! equ 0 (
    call :error_exit 1 "depot_tools installation failed"
)

call :log_success "depot_tools installation completed"
goto :eof

REM Setup gclient configuration
:setup_gclient
call :log_info "Setting up gclient configuration..."

set "gclient_file=%PROJECT_ROOT%\.gclient"
set "gclient_template=%PROJECT_ROOT%\.gclient.template"

if not exist "%gclient_template%" (
    call :error_exit 1 "gclient template not found: %gclient_template%"
)

if exist "%gclient_file%" (
    call :log_info "gclient configuration already exists, backing up..."
    for /f "tokens=1-3 delims=:" %%a in ("%time%") do set "timestamp=%%a%%b%%c"
    copy "%gclient_file%" "%gclient_file%.backup.%timestamp%"
)

REM Copy template
copy "%gclient_template%" "%gclient_file%"

REM Customize for Windows
powershell -Command "(Get-Content '%gclient_file%') -replace 'target_os = \[', 'target_os = [\"win\"' | Set-Content '%gclient_file%'"

call :log_success "gclient configuration setup completed"
goto :eof

REM Setup GN build configuration
:setup_gn_config
call :log_info "Setting up GN build configuration..."

set "args_gn_file=%PROJECT_ROOT%\args.gn"
set "args_gn_template=%PROJECT_ROOT%\args.gn.template"

if not exist "%args_gn_template%" (
    call :error_exit 1 "args.gn template not found: %args_gn_template%"
)

if exist "%args_gn_file%" (
    call :log_info "args.gn already exists, backing up..."
    for /f "tokens=1-3 delims=:" %%a in ("%time%") do set "timestamp=%%a%%b%%c"
    copy "%args_gn_file%" "%args_gn_file%.backup.%timestamp%"
)

REM Copy template
copy "%args_gn_template%" "%args_gn_file%"

REM Customize for Windows
powershell -Command "(Get-Content '%args_gn_file%') -replace 'target_os = \"linux\"', 'target_os = \"win\"' | Set-Content '%args_gn_file%'"

call :log_success "GN build configuration setup completed"
goto :eof

REM Sync Chromium source
:sync_chromium_source
call :log_info "Syncing Chromium source code..."

if not exist "%SRC_DIR%" (
    call :log_info "Creating src directory..."
    mkdir "%SRC_DIR%"
)

cd /d "%SRC_DIR%"

REM Initialize gclient if needed
if not exist ".gclient" (
    call :log_info "Initializing gclient workspace..."
    gclient config --spec "solutions = [{\"name\": \"src\", \"url\": \"https://chromium.googlesource.com/chromium/src.git\", \"managed\": False}]"
)

REM Sync source code
call :log_info "Syncing Chromium source (this may take a while)..."
gclient sync --jobs=8 --no-history

REM Apply Toubkal patches
call :log_info "Applying Toubkal Browser patches..."
gclient runhooks

call :log_success "Chromium source sync completed"
goto :eof

REM Setup build environment
:setup_build_environment
call :log_info "Setting up build environment..."

REM Create build directory
if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"

REM Setup environment variables
set "CHROMIUM_BUILDTOOLS_PATH=%SRC_DIR%\buildtools"
set "PATH=%SRC_DIR%\buildtools;%PATH%"

REM Generate build files
cd /d "%SRC_DIR%"
gn gen out/Default --args="$(type ..\..\args.gn)"

call :log_success "Build environment setup completed"
goto :eof

REM Install Node.js dependencies
:install_node_dependencies
call :log_info "Installing Node.js dependencies..."

cd /d "%PROJECT_ROOT%"

REM Install pnpm if not available
call :command_exists pnpm
if !result! equ 0 (
    call :log_info "Installing pnpm..."
    npm install -g pnpm
)

REM Install dependencies
pnpm install

call :log_success "Node.js dependencies installation completed"
goto :eof

REM Verify setup
:verify_setup
call :log_info "Verifying setup..."

REM Check gclient
call :command_exists gclient
if !result! equ 0 (
    call :error_exit 1 "gclient not found in PATH"
)

REM Check GN
call :command_exists gn
if !result! equ 0 (
    call :error_exit 1 "gn not found in PATH"
)

REM Check Chromium source
if not exist "%SRC_DIR%" (
    call :error_exit 1 "Chromium source directory not found: %SRC_DIR%"
)

REM Check build configuration
if not exist "%PROJECT_ROOT%\args.gn" (
    call :error_exit 1 "args.gn not found"
)

REM Test build generation
cd /d "%SRC_DIR%"
gn gen out/Default --args="$(type ..\..\args.gn)"
if !errorlevel! neq 0 (
    call :error_exit 1 "Build generation failed"
)

call :log_success "Setup verification completed"
goto :eof

REM =============================================================================
REM MAIN EXECUTION
REM =============================================================================

:main
set "start_time=%time%"

call :log_info "Starting Toubkal Browser build setup..."
call :log_info "Project root: %PROJECT_ROOT%"
call :log_info "Platform: Windows"

REM Parse command line arguments
set "clean_mode=false"
set "quick_mode=false"
set "verbose_mode=false"

:parse_args
if "%1"=="" goto :run_setup
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help
if "%1"=="--clean" (
    set "clean_mode=true"
    shift
    goto :parse_args
)
if "%1"=="--quick" (
    set "quick_mode=true"
    shift
    goto :parse_args
)
if "%1"=="--verbose" (
    set "verbose_mode=true"
    shift
    goto :parse_args
)
if "%1"=="-v" (
    set "verbose_mode=true"
    shift
    goto :parse_args
)
call :log_error "Unknown option: %1"
exit /b 1

:show_help
echo Usage: %0 [OPTIONS]
echo Options:
echo   --help, -h     Show this help message
echo   --clean        Clean existing setup before starting
echo   --quick        Skip system dependency installation
echo   --verbose, -v  Enable verbose output
exit /b 0

:run_setup
REM Clean existing setup if requested
if "%clean_mode%"=="true" (
    call :log_info "Cleaning existing setup..."
    if exist "%SRC_DIR%" rmdir /s /q "%SRC_DIR%"
    if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"
    if exist "%LOG_DIR%" rmdir /s /q "%LOG_DIR%"
    if exist "%PROJECT_ROOT%\.gclient" del "%PROJECT_ROOT%\.gclient"
    if exist "%PROJECT_ROOT%\args.gn" del "%PROJECT_ROOT%\args.gn"
)

REM Run setup steps
call :check_system_requirements
if "%quick_mode%"=="false" (
    call :install_system_dependencies
)
call :install_depot_tools
call :setup_gclient
call :setup_gn_config
call :sync_chromium_source
call :setup_build_environment
call :install_node_dependencies
call :verify_setup

set "end_time=%time%"
call :log_success "Toubkal Browser build setup completed successfully!"
call :log_info "Setup completed at: %end_time%"
call :log_info "Next steps:"
call :log_info "  1. Run 'scripts\build.bat' to build Toubkal Browser"
call :log_info "  2. Run 'scripts\build.bat --test' to run tests"
call :log_info "  3. Check logs in: %LOG_DIR%"

goto :eof

REM Run main function
call :main %*