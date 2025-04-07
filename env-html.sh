#!/bin/sh

INDEX_FILE=./public/index.html

# Check if an argument is provided
if [ -z "$1" ]
then
    echo "No environment file specified. Using default .env"
    ENV_FILE=".env"
else
    ENV_FILE="$1"
    echo "Using environment file: $ENV_FILE"
fi

# Check if the specified env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE does not exist."
    exit 1
fi

# Loop over each line in the .env file
while read -r line || [[ -n "$line" ]]; do
  # Only process lines that contain an "="
  if echo "$line" | grep -q '='; then
    # Extract variable name and value
    varname=$(echo "$line" | sed -e 's/=.*//')
    varvalue=$(echo "$line" | sed -e 's/^[^=]*=//')
    echo "Replacing %${varname}% with ${varvalue}"
    # Replace all occurrences of %VAR% in index.html
    sed -i "s|%${varname}%|${varvalue}|g" "$INDEX_FILE"
  fi
done < "$ENV_FILE"
