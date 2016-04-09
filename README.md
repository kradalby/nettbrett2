nettbrett2
=====
[![Build Status](https://drone.fap.no/api/badges/kradalby/nettbrett2/status.svg)](https://drone.fap.no/kradalby/nettbrett2)

Dashboard with interesting network stats

![Screenshot](https://kradalby.no/ss/20160403215312.png)

Build
-----

    $ rebar3 compile

## Installation

### Debian
Install build-essentials and git:

    apt-get update
    apt-get install build-essential git vim -y

Clone repo:

    git clone https://github.com/kradalby/nettbrett2.git

Bootstrap the Debian box (as root):

    cd nettbrett2
    make bootstrap-debian

Run the app via Erlang VM shell:

    ./rebar3 shell


## Todo

- Save peak data
- Use erlsrcds to get game data
