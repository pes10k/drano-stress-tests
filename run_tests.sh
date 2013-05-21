#!/bin/bash

ROOT_DIR="`pwd`"
export PHANTOMJS_EXECUTABLE="$ROOT_DIR/contrib/phantomjs/bin/phantomjs"
TEST_DIR="$ROOT_DIR/tests"
TEST_CMD="$ROOT_DIR/contrib/casperjs/bin/casperjs"

for a_test in `ls $TEST_DIR`
do
    echo "Running $a_test"
    echo $TEST_CMD
    $TEST_CMD $TEST_DIR $a_test
done
