#!/usr/bin/env bash

# Purge local environments
for d in $(atlas deployments list | grep LOCAL | cut -d' ' -f 1); do
	atlas deployments delete $d --force;
done

# Do a Docker pull to be ready
docker pull mongodb/mongodb-atlas-local:8.0
docker pull mongodb/mongodb-atlas-local:7.0

## Init demo deployment
PORT=27027
DEPLOYMENT_NAME="local-london-ides"

atlas deployments setup $DEPLOYMENT_NAME --type LOCAL --mdbVersion 8.0 --port $PORT --force
mongorestore --port=$PORT --archive=demo/production-trips-w-reviews.archive
atlas deployments search indexes create --file demo/search-index.json --deploymentName $DEPLOYMENT_NAME

# Create a bunch of indexes so IntelliJ is happy
indexes=(	
	"db.getSiblingDB('production').getCollection('trips').createIndex({ 'trip_status': 1, 'driver_id': 1 })"
	"db.getSiblingDB('production').getCollection('trips').createIndex({ 'start_time': 1, 'end_time': 1 })"
	"db.getSiblingDB('production').getCollection('trips').createIndex({ 'ratings.driver_rating': 1})"
	"db.getSiblingDB('production').getCollection('trips').createIndex({ 'payment_method': 1})"
	"db.getSiblingDB('production').getCollection('trips').createIndex({ 'passenger_id': 1})"
	"db.getSiblingDB('production').getCollection('trips').createIndex({ 'dispute.assignee': 1})"
)
for i in "${indexes[@]}"; do
	mongosh --port $PORT --eval "$i"
done

## Restore empty TripRepository
cp ride-share-api/res/TripsRepository.java ride-share-api/src/main/java/com/example/rideshareapi/repository/TripsRepository.java

