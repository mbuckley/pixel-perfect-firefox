#!/bin/bash
# generate the XPI file
# TODO: Pass in version as parameter
VERSION=2.0.1
echo "Generating $APP_NAME.xpi..."
cd srcExtension
zip -r ../dist/pixelperfect-$VERSION.xpi *
