#!/bin/bash

# GET Serverport number
serverport=8029
if [ $? -ne 0 ]; then
    exit $?
fi

# Get package name
packagename=`cat package.json | grep name | cut -d: -f2 | sed 's/[",]//g' | awk '{$1=$1};1' | awk '{print tolower($0)}'`
if [ $? -ne 0 ]; then
    exit $?
fi

# get current version
codeversion=`cat package.json | grep version | cut -f 2 -d: | sed 's/[",]//g' | awk '{$1=$1};1'`
if [ $? -ne 0 ]; then
    exit $?
fi

# Build New image
docker build --rm -t 172.30.160.12:5043/${packagename}:latest -t 172.30.160.12:5043/${packagename}:${codeversion} --build-arg GITHUB_API_TOKEN=${GIT_TOKEN} --build-arg PASSPHRASE=${PASSPHRASE} --build-arg SERVERPORT=8029 .
if [ $? -eq 0 ]; then
    # Push Latest Image
    docker push 172.30.160.12:5043/${packagename}:latest
    # Push Versioned Image
    docker push 172.30.160.12:5043/${packagename}:${codeversion}
fi
