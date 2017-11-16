#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR

mkdir -p dist
mkdir -p tmp

npm install
node_modules/.bin/babel src -q -d tmp
node_modules/.bin/browserify --standalone ejson tmp/index.js -o tmp/ejson.js
node_modules/.bin/uglifyjs tmp/ejson.js -o dist/ejson.js --beautify
node_modules/.bin/uglifyjs dist/ejson.js -o dist/ejson.min.js --compress --mangle --source-map "filename=dist/ejson.min.js.map" 

rm -rf tmp
