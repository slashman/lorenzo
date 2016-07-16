rm -rf build
mkdir build
mkdir build/img
cp html/* build
cp jslib/* build
cp png/* build/img
browserify -t uglifyify src/LorenzoGame.js -o build/lorenzo.min.js
