#!/bin/bash
# generate the XPI file
# TODO: Pass in version as parameter
VERSION=1.7.1
echo "Generating $APP_NAME.xpi..."
cd srcExtension
zip -r ../dist/pixelperfect-$VERSION.xpi *
