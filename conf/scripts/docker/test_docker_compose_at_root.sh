#!/usr/bin/env bash

docker-compose stop
docker-compose down
mkdir -p ../volumes_trash
mv volumes "../volumes_trash/volumes_$(date +"%Y%m%d_%H%M%S")"
docker-compose build
docker-compose up

                                        
