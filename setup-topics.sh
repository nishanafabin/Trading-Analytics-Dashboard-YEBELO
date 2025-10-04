#!/bin/bash
echo "Creating Redpanda topics..."

# Wait for Redpanda to be ready
sleep 10

# Create topics using rpk
docker exec redpanda rpk topic create trade-data --partitions 3 --replicas 1
docker exec redpanda rpk topic create rsi-data --partitions 3 --replicas 1

# List topics to verify
docker exec redpanda rpk topic list

echo "Topics created successfully!"