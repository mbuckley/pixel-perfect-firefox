#!/bin/bash
# generate the XPI file
# TODO: Pass in version as parameter
VERSION=2.0.0
echo "Generating $APP_NAME.xpi..."
cd srcExtension
zip -r ../dist/pixelperfect-$VERSION.xpi *
