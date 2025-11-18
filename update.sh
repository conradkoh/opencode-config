#!/bin/bash

# Exit on error
set -e

# Configuration
REMOTE_URL="https://github.com/conradkoh/opencode-config.git"
SOURCE_PATHS=("command" "prompts")
BACKUP_DIR=".backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Get the directory where this script is being run from
WORK_DIR=$(pwd)

# Logging functions
log() {
	local level=$1
	shift
	local message="$@"
	local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
	echo "[$timestamp] [$level] $message"
}

log_info() {
	log "INFO" "$@"
}

log_warn() {
	log "WARN" "$@"
}

log_error() {
	log "ERROR" "$@"
}

log_success() {
	log "SUCCESS" "$@"
}

# Error handler
cleanup_on_error() {
	local exit_code=$?
	log_error "Script failed with exit code $exit_code"
	log_info "Cleaning up temporary directory: $TEMP_DIR"
	rm -rf "$TEMP_DIR"
	exit $exit_code
}

trap cleanup_on_error EXIT

log_info "=========================================="
log_info "OpenCode Update Script Started"
log_info "=========================================="
log_info "Working directory: $WORK_DIR"
log_info "Remote URL: $REMOTE_URL"
log_info "Source paths: ${SOURCE_PATHS[*]}"

# Create a temporary directory for cloning
log_info "Creating temporary directory for clone..."
TEMP_DIR=$(mktemp -d)
log_info "Temporary directory created: $TEMP_DIR"

log_info "Fetching latest files from remote: $REMOTE_URL"
if git clone --depth 1 --filter=blob:none --sparse "$REMOTE_URL" "$TEMP_DIR" 2>&1; then
	log_success "Repository cloned successfully"
else
	log_error "Failed to clone repository"
	exit 1
fi

log_info "Setting up sparse checkout for paths: ${SOURCE_PATHS[*]} and update.sh"
cd "$TEMP_DIR"
if git sparse-checkout set "${SOURCE_PATHS[@]}" update.sh 2>&1; then
	log_success "Sparse checkout configured"
else
	log_error "Failed to configure sparse checkout"
	exit 1
fi
cd - > /dev/null
log_info "Returned to working directory"

# Self-update the script if it exists in working directory
SCRIPT_NAME="update.sh"
if [ -f "$WORK_DIR/$SCRIPT_NAME" ]; then
	log_info "=========================================="
	log_info "Self-updating script: $SCRIPT_NAME"
	log_info "=========================================="
	
	SCRIPT_SRC="$TEMP_DIR/$SCRIPT_NAME"
	SCRIPT_DEST="$WORK_DIR/$SCRIPT_NAME"
	SCRIPT_BACKUP="$WORK_DIR/$BACKUP_DIR/$TIMESTAMP/$SCRIPT_NAME"
	
	if [ -f "$SCRIPT_SRC" ]; then
		log_info "Creating backup of current script..."
		mkdir -p "$(dirname "$SCRIPT_BACKUP")"
		if cp "$SCRIPT_DEST" "$SCRIPT_BACKUP"; then
			log_success "Script backup created at $SCRIPT_BACKUP"
		else
			log_warn "Failed to backup script (non-fatal)"
		fi
		
		log_info "Updating script..."
		if cp "$SCRIPT_SRC" "$SCRIPT_DEST"; then
			chmod +x "$SCRIPT_DEST"
			log_success "Script updated successfully"
		else
			log_error "Failed to update script"
			exit 1
		fi
	else
		log_warn "Script not found in remote repository, skipping self-update"
	fi
else
	log_info "Script not found in working directory, skipping self-update"
fi

# Process each source path
for SOURCE_PATH in "${SOURCE_PATHS[@]}"; do
	log_info "=========================================="
	log_info "Processing path: $SOURCE_PATH"
	log_info "=========================================="
	
	# Source and destination paths
	SRC="$TEMP_DIR/$SOURCE_PATH"
	DEST="$WORK_DIR/$SOURCE_PATH"
	BACKUP_PATH="$WORK_DIR/$BACKUP_DIR/$TIMESTAMP/$SOURCE_PATH"
	
	log_info "Source path: $SRC"
	log_info "Destination path: $DEST"
	
	# Verify source exists
	if [ ! -d "$SRC" ]; then
		log_error "Source path does not exist: $SRC"
		exit 1
	fi
	log_info "Source directory verified"
	
	# Create backup if destination exists
	if [ -d "$DEST" ]; then
		log_info "Existing destination found, creating backup..."
		log_info "Backup path: $BACKUP_PATH"
		
		if mkdir -p "$BACKUP_PATH"; then
			log_info "Backup directory created"
		else
			log_error "Failed to create backup directory"
			exit 1
		fi
		
		if cp -r "$DEST"/* "$BACKUP_PATH/" 2>/dev/null; then
			file_count=$(find "$BACKUP_PATH" -type f | wc -l)
			log_success "Backup completed ($file_count files backed up)"
		else
			log_warn "Some files could not be backed up (non-fatal)"
		fi
	else
		log_info "No existing destination found, skipping backup"
	fi
	
	# Create destination directory if it doesn't exist
	if [ ! -d "$DEST" ]; then
		log_info "Creating destination directory: $DEST"
		mkdir -p "$DEST"
		log_success "Destination directory created"
	else
		log_info "Destination directory already exists"
	fi
	
	# Copy files from remote
	log_info "Copying files from remote to destination..."
	if cp -r "$SRC"/* "$DEST/"; then
		file_count=$(find "$DEST" -type f | wc -l)
		log_success "Files copied successfully ($file_count total files)"
	else
		log_error "Failed to copy files"
		exit 1
	fi
done

log_info "=========================================="
log_success "Update completed successfully!"
log_info "=========================================="
log_info "Backup location: $BACKUP_PATH"
log_info "=========================================="
