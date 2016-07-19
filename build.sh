rm -rf build
mkdir build
mkdir build/img
mkdir build/wav
cp html/* build
cp jslib/* build
cp res/png/* build/img
cp res/wav/* build/wav
browserify -t uglifyify src/LorenzoGame.js -o build/lorenzo.min.js
