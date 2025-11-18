# OpenCode Configuration

This repository contains shared OpenCode configuration files including custom commands and prompts.

## Installation

To install or update this configuration in your OpenCode setup, run the following command:

```bash
curl -fsSL https://raw.githubusercontent.com/conradkoh/opencode-config/master/update.sh | bash
```

Alternatively, you can clone this repository and run the update script manually:

```bash
git clone https://github.com/conradkoh/opencode-config.git
cd opencode-config
chmod +x update.sh
./update.sh
```

## What Gets Installed

The installation script will copy the following directories to your working directory:

- `command/` - Custom OpenCode commands
- `prompts/` - Custom prompts for various tasks

## Backup

Before overwriting any existing files, the script automatically creates a timestamped backup in `.backup/YYYYMMDD_HHMMSS/`.

## Updating

To update to the latest version, simply run the update script again. Your existing files will be backed up before being replaced with the latest versions from this repository.

## Structure

```
.
├── command/          # Custom commands
├── prompts/          # Custom prompts
├── update.sh         # Installation/update script
└── README.md         # This file
```

## Requirements

- Git installed on your system
- Bash shell
- Internet connection to fetch updates

## Troubleshooting

If you encounter any issues during installation:

1. Ensure you have Git installed: `git --version`
2. Check that you have write permissions in the target directory
3. Review the console output for specific error messages
4. Check that the remote repository is accessible

## License

[Add your license information here]
