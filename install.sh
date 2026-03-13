#!/bin/sh
# Copyright 2026 Jimmy Ma
# SPDX-License-Identifier: MIT

set -e

# Configuration
REPO="gosusnp/whackamole"
BINARY_NAME="whack"
INSTALL_DIR="/usr/local/bin"

# 1. Detect OS and Architecture
OS=$(uname -s)
ARCH=$(uname -m)

case "$ARCH" in
    x86_64) ARCH="x86_64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

# 2. Get latest release version from GitHub API
echo "Checking for latest release..."
TAG=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name":' | head -n 1 | cut -d'"' -f4)

if [ -z "$TAG" ]; then
    echo "Error: Could not find latest release tag."
    exit 1
fi

# 3. Construct Download URL
FILENAME="${BINARY_NAME}_${OS}_${ARCH}.tar.gz"
URL="https://github.com/$REPO/releases/download/$TAG/$FILENAME"

echo "Downloading $BINARY_NAME $TAG for ${OS}/${ARCH}..."
echo "URL: $URL"

# 4. Download and Extract
# We use a temp directory to keep things clean
TMP_DIR=$(mktemp -d)
if ! curl -sLf "$URL" | tar -xz -C "$TMP_DIR"; then
    echo "Error: Failed to download or extract the binary from $URL."
    echo "Check if the version $TAG exists for ${OS}/${ARCH} on GitHub releases."
    rm -rf "$TMP_DIR"
    exit 1
fi

# 5. Move to Install Directory
echo "Installing to $INSTALL_DIR..."
if [ ! -f "$TMP_DIR/$BINARY_NAME" ]; then
    echo "Error: Binary '$BINARY_NAME' not found in the extracted archive."
    ls -R "$TMP_DIR"
    rm -rf "$TMP_DIR"
    exit 1
fi

if [ -w "$INSTALL_DIR" ]; then
    mv "$TMP_DIR/$BINARY_NAME" "$INSTALL_DIR/$BINARY_NAME"
else
    sudo mv "$TMP_DIR/$BINARY_NAME" "$INSTALL_DIR/$BINARY_NAME"
fi

chmod +x "$INSTALL_DIR/$BINARY_NAME"
rm -rf "$TMP_DIR"

echo "Successfully installed $BINARY_NAME!"
$BINARY_NAME --version
