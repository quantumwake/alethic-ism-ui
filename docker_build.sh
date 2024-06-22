#!/bin/bash

APP_NAME="alethic-ism-ui"
DOCKER_NAMESPACE="krasaee"
GIT_COMMIT_ID=$(git rev-parse HEAD)
TAG="$DOCKER_NAMESPACE/$APP_NAME:$GIT_COMMIT_ID"

ARCH=$1
if [ -z "$ARCH" ];
then
  ARCH="linux/amd64"
  #TODO check operating system ARCH="linux/arm64"
fi;

echo "Using arch: $ARCH for image tag $TAG"

echo "Starting docker build for alethic-ism-ui:$GIT_COMMIT_ID"

docker build \
 --platform $ARCH \
 --progress=plain -t $TAG \
 --no-cache .

  docker push $TAG
  echo "Use $TAG to deploy to kubernetes"
fi;
