.DEFAULT_GOAL := start

install:
	npm install

config:
	cp config_default.js config.js

compile:
	browserify src/index.js -o index.js -t babelify --presets [es2015]

build: 
	$(MAKE) install 
	$(MAKE) config 
	$(MAKE) compile 