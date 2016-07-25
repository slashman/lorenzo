rm -rf build
mkdir build
mkdir build/img
mkdir build/wav
mkdir build/ogg
mkdir build/mp3
cp html/* build
cp jslib/* build
cp jslib/phaser-virtual-joystick/*.js build
cp jslib/phaser-virtual-joystick/*.png build/img
cp jslib/phaser-virtual-joystick/*.json build
cp res/png/* build/img
cp res/wav/* build/wav
cp res/mp3/* build/mp3
cp res/ogg/* build/ogg
browserify -t uglifyify src/LorenzoGame.js -o build/lorenzo.min.js
