nettbrett2
=====

Dashboard with interesting network stats

![Screenshot](https://kradalby.no/ss/20160403215312.png)

Build
-----

    $ rebar3 compile

## Installation

### Debian
Install build-essentials and git:
    apt-get update
    apt-get install build-essential git -y

Clone repo:
    git clone https://github.com/kradalby/nettbrett2.git

Bootstrap the Debian box (as root):
    cd nettbrett2
    make bootstrap-debian

Run the app via Erlang VM shell:
    ./rebar3 shell


roadmap

~snmp
~config file
~json
~scheduler/taskrunner/loop/sleep
~handle timeout snmp
~fix in graph
~smooth updating of the graphs
~better reconnect
save peak
erlsrcds
