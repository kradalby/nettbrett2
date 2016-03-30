PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

build.css:
	lessc apps/nettbrett2/priv/less/style.less apps/nettbrett2/priv/static/css/bundle.css
	autoprefixer apps/nettbrett2/priv/static/css/bundle.css

build.js:
	browserify apps/nettbrett2/priv/js/app.js -o apps/nettbrett2/priv/static/js/bundle.js

build: build.js build.css

dev:
	npm install
