#!/bin/bash
# generate the XPI file
VERSION=1.6.0
echo "Generating $APP_NAME.xpi..."
cd srcExtension
zip -r ../dist/pixelperfect-$VERSION.xpi *