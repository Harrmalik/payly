#!/bin/bash

# set Variables
port=8029
appname=`cat package.json | grep name | cut -d: -f2 | sed 's/[",]//g' | awk '{$1=$1};1' | awk '{print tolower($0)}'`
newimage="172.30.160.12:5043/${appname}:latest"
currentimage="172.30.160.12:5043/${appname}:current"

# Pull latest image
docker pull ${newimage}

# Stop Current container
docker stop ${appname}

# Remove current container
docker rm ${appname}

# Remove current image
docker rmi ${currentimage}

# Remove tag new image as current
docker tag ${newimage} ${currentimage}

# Start New Container
if [ "$1" == "Development" ]; then
    docker run -p ${port}:${port} -v `pwd`:/usr/src/app --name ${appname} ${newimage}
else
    docker run -p ${port}:${port} -d --name ${appname} ${newimage}
fi
