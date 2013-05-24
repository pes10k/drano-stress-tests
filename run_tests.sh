#!/bin/bash

# Second argument is number of tests per client (default is 10)
# Third argument is number of clients (default is 1)

ROOT_DIR="`pwd`"
PHANTOMJS_EXECUTABLE="$ROOT_DIR/contrib/phantomjs/bin/phantomjs"

if [ $# -ge 1 ]
then
    TEST_DEST=$1
else
    TEST_DEST=$ROOT_DIR
fi

if [ $# -ge 2 ]
then
    NUM_TESTS=$2
else
    NUM_TESTS=10
fi

if [ $# -ge 3 ]
then
    NUM_CLIENTS=$3
else
    NUM_CLIENTS=1
fi

echo "Running test suite with $NUM_CLIENTS client(s) performing $NUM_TESTS test(s)"
echo "Results will be written to '$TEST_DEST'"

if [ ! -d $TEST_DEST ]
then
    mkdir -p $TEST_DEST
fi

for i in $(seq 1 $NUM_CLIENTS);
do
    echo "Starting up client $i"
    TEST_COMMAND="$PHANTOMJS_EXECUTABLE tests/phantomjs/stress_cycle.js $NUM_TESTS $TEST_DEST/result_$i.json"
    echo $TEST_COMMAND
    $TEST_COMMAND &
done

wait

echo "Tests completed and results written to $TEST_DEST"
