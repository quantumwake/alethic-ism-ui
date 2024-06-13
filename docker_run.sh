#!/bin/bash

docker run -p 127.0.0.1:3000:3000/tcp --env-file src/envs/.env.local krasaee/alethic-ism-ui:ops1
