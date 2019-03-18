#!/bin/bash

packagename=web_`basename $(pwd) | tr '[:upper:]' '[:lower:]'`

codeversion='1.0.0'


docker build -t 172.30.160.12:5043/${packagename}:latest -t 172.30.160.12:5043/${packagename}:${codeversion} .


if [ $? -eq 0 ]; then
docker push 172.30.160.12:5043/${packagename}:latest
docker push 172.30.160.12:5043/${packagename}:${codeversion}
fi
