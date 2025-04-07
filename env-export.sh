#!/bin/sh
# env-export.sh: Source a .env file and export its variables

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 path/to/.env"
  exit 1
fi

ENV_FILE="$1"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: File '$ENV_FILE' not found!"
  exit 1
fi

# Automatically export variables defined in the file
set -a
. "$ENV_FILE"
set +a

echo "Environment variables loaded from $ENV_FILE"