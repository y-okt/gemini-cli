# Multi-Directory Workspace Support

Gemini CLI now supports working with multiple directories in a single session. This allows you to operate on files from different projects or directories without switching contexts.

## Command-Line Usage

### Including Additional Directories at Startup

You can include additional directories when starting Gemini CLI using the `--include-directories` flag:

```bash
# Single additional directory
gemini --include-directories /path/to/other/project

# Multiple directories (comma-separated)
gemini --include-directories /path/to/project1,/path/to/project2

# Multiple directories (multiple flags)
gemini --include-directories /path/to/project1 --include-directories /path/to/project2
```

**Note for development:** When using `npm run start` during development, you must use `--` to pass arguments to the script:

```bash
# Correct way to pass arguments with npm run
npm run start -- --include-directories /path/to/other/project

# This won't work (arguments are passed to npm, not the script)
npm run start --include-directories /path/to/other/project
```

## Interactive Directory Management

### Adding Directories During a Session

Use the `/directory add` command to dynamically add directories to your workspace:

```
/directory add /path/to/new/project
```

The path can be absolute or relative to your current working directory.

### Viewing Current Workspace Directories

Use the `/directory show` command to list all directories in your current workspace:

```
/directory show
```

This will display all directories currently included in your workspace, with the initial directory (cwd) listed first.

## How It Works

- All file system tools (glob, read_file, write_file, edit, ls) respect the workspace boundaries
- The glob tool searches across all workspace directories when finding files
- Path validation ensures files can only be accessed within the defined workspace directories
- Symbolic links are resolved to their real paths for security

## Security Considerations

- All paths are validated to ensure they remain within the workspace boundaries
- Symbolic links are followed but the resolved path must still be within a workspace directory
- This prevents unauthorized access to files outside the intended workspace

## Examples

### Working with Multiple Projects

```bash
# Start with your main project and include a dependency
gemini --include-directories ../my-library

# In the session, you can now:
# - Search for files across both directories
# - Read and edit files from either project
# - Compare implementations between projects
```

### Adding Test Data Directory

```
# During your session
/directory add ./test-data

# Now you can access test files without them being in your main project
```

## Limitations

- In sandbox mode with restrictive profiles, the `/directory add` command may be disabled
- The `--include-directories` flag works in all sandbox profiles
- All directories must exist when specified
- Relative paths are resolved from the current working directory
