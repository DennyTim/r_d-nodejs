#!/bin/bash

echo "Starting isolation level demonstration..."
echo "Starting writer and reader processes in parallel"

node -r dotenv/config test/scripts/writer.js &
WRITER_PID=$!

sleep 1

node -r dotenv/config test/scripts/reader.js &
READER_PID=$!

wait $WRITER_PID
wait $READER_PID
