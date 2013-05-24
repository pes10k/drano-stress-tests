#!/bin/bash

# First argument is number of tests per client (default is 10)
# Second argument is number of clients (default is 1)

ROOT_DIR="`pwd`"
PHANTOMJS_EXECUTABLE="$ROOT_DIR/contrib/phantomjs/bin/phantomjs"

if [ $# -ge 1 ]
then
    NUM_TESTS=$1
else
    NUM_TESTS=10
fi

if [ $# -ge 2 ]
then
    NUM_CLIENTS=$2
else
    NUM_CLIENTS=1
fi

DEST_DIR="$ROOT_DIR/results/$NUM_CLIENTS-$NUM_TESTS/"

echo "Running test suite with $NUM_CLIENTS client(s) performing $NUM_TESTS test(s)"
echo "Results will be written to '$DEST_DIR'"

if [ ! -d $DEST_DIR ]
then
    mkdir -p $DEST_DIR
fi

for i in $(seq 1 $NUM_CLIENTS);
do
    echo "Starting up client $i"
    TEST_COMMAND="$PHANTOMJS_EXECUTABLE tests/phantomjs/stress_cycle.js $NUM_TESTS $DEST_DIR/result_$i.json"
    # echo $TEST_COMMAND
    $TEST_COMMAND &
done

wait

echo "Tests completed and results written to $DEST_DIR"
echo "Generating graph"
python graph_results.py $DEST_DIR


