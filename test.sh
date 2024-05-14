#!/bin/bash

# Example query that fetches some fee history data from the Ethereum network.
payload='{"jsonrpc":"2.0","method":"eth_feeHistory","id":98,"params":["0x4","latest",[]]}'

# Function to send a single request
send_request() {
  curl -i -X POST "http://localhost:8787/eth-sepolia" \
       -H "Content-Type: application/json" \
       -d "$payload"
}

# Loop to send 10 requests in parallel
for i in {1..10}; do
  send_request &
done

# Wait for all background processes to finish
wait
