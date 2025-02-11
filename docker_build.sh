#!/bin/bash

# Function to print usage
print_usage() {
  echo "Usage: $0 [-i image] [-p architecture]"
  echo "  -i image           Docker image krasaee/alethic-ism-ui:latest"
  echo "  -p platform        Target platform architecture (linux/amd64, linux/arm64, ...)"
}

# Default values
APP_NAME=$(pwd | sed -e 's/^.*\///g')
DOCKER_NAMESPACE="krasaee"
TAG=""
ARCH="linux/amd64"

# Parse command line arguments
while getopts 'i:p:' flag; do
  case "${flag}" in
    t) TAG="${OPTARG}" ;;
    a) ARCH="${OPTARG}" ;;
    *) print_usage
       exit 1 ;;
  esac
done

# Check if ARCH is set, if not default to linux/amd64
if [ -z "$ARCH" ]; then
  ARCH="linux/amd64"
  # TODO: Check operating system and set ARCH accordingly, e.g., ARCH="linux/arm64"
fi

# If TAG is not provided, generate it using GIT_COMMIT_ID
if [ -z "$TAG" ]; then
  GIT_COMMIT_ID=$(git rev-parse HEAD)
  TAG="$DOCKER_NAMESPACE/$APP_NAME:$GIT_COMMIT_ID"
fi

## Display arguments
echo "Platform: $ARCH"
echo "Platform Docker Image Tag: $TAG"

# Build the Docker image which creates the package
docker build --progress=plain \
  --platform "$ARCH" -t "$TAG" \
  --build-arg BUILD_ENV=prod \
  --no-cache .
