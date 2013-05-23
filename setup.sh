#!/bin/bash

# Installs CasperJS and PhantomJS.  Needs the following bits:
#   * curl
#   * git
#   * python

PHANTOM_BIN="phantomjs-1.9.0-linux-x86_64"
PHANTOM_URI="https://phantomjs.googlecode.com/files/$PHANTOM_BIN.tar.bz2"
PHANTOM_TMP="/tmp/$PHANTOM_BIN.tar.bz2"
CASPER_GIT_URI="git://github.com/n1k0/casperjs.git"
INSTALL_DEST="contrib"
PHANTOM_HOME="$INSTALL_DEST/phantomjs"
CASPER_HOME="$INSTALL_DEST/casperjs"

if [ -d $INSTALL_DEST ]
then
    echo " * Contrib dir '$INSTALL_DEST' already exists"
else
    mkdir $INSTALL_DEST
fi

if [ -d "$PHANTOM_HOME" ]
then
    echo " * Local version of PhantomJS exists"
else
    echo " * Downloading Phantom JS"
    curl "$PHANTOM_URI" > $PHANTOM_TMP
    tar -xjf $PHANTOM_TMP -C $INSTALL_DEST
    ln -s "$PHANTOM_BIN" "$PHANTOM_HOME" 
fi

if [ -d "$CASPER_HOME" ]
then
    echo " * Local version of CasperJS exists"
else
    echo " * Downloading CasperJS"
    git clone "$CASPER_GIT_URI" "$CASPER_HOME"
fi
