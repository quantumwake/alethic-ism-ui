#!/bin/bash

# Function to print usage
print_usage() {
  echo "Usage: $0 [-i image] [-p architecture]"
  echo "  -i image           Docker image krasaee/alethic-ism-ui:latest"
  echo "  -p platform        Target platform architecture (linux/amd64, linux/arm64, ...)"
  echo "  -e build_env       [local, dev, test, prod or kind, default to kind cluster]"
}

# Default values
ARCH="linux/amd64"
BUILD_ENV="prod"

# Parse command line arguments
while getopts 'i:p:e:' flag; do
  case "${flag}" in
    i) IMAGE="${OPTARG}" ;;
    p) ARCH="${OPTARG}" ;;
    e) BUILD_ENV="${OPTARG}" ;;
    *) print_usage
       exit 1 ;;
  esac
done

# Check if ARCH is set, if not default to linux/amd64
if [ -z "$ARCH" ]; then
  ARCH="linux/amd64"
  # TODO: Check operating system and set ARCH accordingly, e.g., ARCH="linux/arm64"
fi

## Display arguments
echo "platform: $ARCH"
echo "platform image: $IMAGE"

# Build the Docker image which creates the package
docker build --progress=plain \
  --platform "$ARCH" -t "$IMAGE" \
  --build-arg BUILD_ENV="$BUILD_ENV" \
  .
#  --no-cache .
