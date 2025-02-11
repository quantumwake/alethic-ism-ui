#!/bin/bash
# build.sh – Build the React application image using Buildpacks
# Optionally, pass an environment file (e.g. .env-dev, .env-test, or .env-prod)
# as the first argument. This file will be sourced via env.sh so that your
# environment-specific variables (and build command settings) are loaded.

# If an env file argument is provided, source it via env.sh
if [ -n "$1" ]; then
  ENV_FILE="$1"
  if [ -f "env.sh" ]; then
    echo "Sourcing environment file '$ENV_FILE' using env.sh..."
    # Assuming env.sh expects the env file as its first parameter
    source env.sh "$ENV_FILE"
  else
    echo "Warning: env.sh not found. Skipping environment sourcing."
  fi
fi

# Default variable values (can be overridden by exported env variables)
APP_NAME=${APP_NAME:-alethic-ism-ui}
DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-krasaee}
TAG=${TAG:-$(git rev-parse --short HEAD)}
PLATFORM=${PLATFORM:-linux/amd64}
BUILDER=${BUILDER:-paketobuildpacks/builder:base}

# Invoke pack build, passing along all the required environment variables.
pack build ${DOCKER_NAMESPACE}/${APP_NAME}:${TAG} \
  --builder ${BUILDER} \
  --platform ${PLATFORM}
