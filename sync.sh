#!/bin/bash
# Sync local with remote (overwrite everything)

git fetch origin main
git reset --hard origin/main