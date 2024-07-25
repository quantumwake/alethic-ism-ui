#!/bin/sh
# env.sh

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

# Recreate config file
rm -rf ./public/runtime-env.js
touch ./public/runtime-env.js

# Add assignment
echo "window.env = {" >> ./public/runtime-env.js

# Read each line in .env file
# Each line represents key=value pairs
while read -r line || [[ -n "$line" ]];
do
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")
  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}

  # Append configuration property to JS file
  echo "  $varname: \"$value\"," >> ./public/runtime-env.js
done < "$ENV_FILE"

echo "}" >> ./public/runtime-env.js