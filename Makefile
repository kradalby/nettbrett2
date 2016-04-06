PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

bootstrap-debian:
	echo "Adding Erlang repositories"
	wget https://packages.erlang-solutions.com/erlang-solutions_1.0_all.deb
	dpkg -i erlang-solutions_1.0_all.deb
	rm -rf erlang-solutions_1.0_all.deb
	echo "Installing Erlang"
	apt-get update
	apt-get install erlang -y
	echo "Downloading rebar3"
	wget https://s3.amazonaws.com/rebar3/rebar3
	chmod +x rebar3
	echo "Compiling nettbrett2"
	./rebar3 compile


build.css:
	lessc apps/nettbrett2/priv/less/style.less apps/nettbrett2/priv/static/css/bundle.css

build.js:
	browserify apps/nettbrett2/priv/js/app.js -o apps/nettbrett2/priv/static/js/bundle.js

build: build.js build.css

dev:
	npm install

snmp-tunnel:
	@echo "Opening SNMP tunnel to vsop at port 16100"
	tmux new-session -s snmp-tunnel -d
	tmux new-window -a -n server 		-t snmp-tunnel -P "ssh vsop -4 -L 10001:localhost:10001 \"killall socat; socat -T10 TCP4-LISTEN:10001,fork UDP4:localhost:161\""
	tmux new-window -a -n client 	-t snmp-tunnel -P "socat -T15 udp4-recvfrom:16100,reuseaddr,fork tcp:localhost:10001"

close-snmp-tunnel:
	@echo "Closing SNMP tunnel to butterfree"
	tmux kill-session -t snmp-tunnel
