#!/bin/bash

ROOT_DIR="`pwd`"
export PHANTOMJS_EXECUTABLE="$ROOT_DIR/contrib/phantomjs/bin/phantomjs"
TEST_DIR="$ROOT_DIR/tests"
TEST_CMD="$ROOT_DIR/contrib/casperjs/bin/casperjs"

$TEST_CMD test $TEST_DIR
