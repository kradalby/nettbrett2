FROM erlang:19.0

MAINTAINER Kristoffer Dalby

ENV NAME="nettbrett2"

COPY . /tmp/code

WORKDIR /tmp/code

RUN rebar3 release -d false

RUN mv _build/default/rel/$NAME /srv/app
RUN cp /tmp/code/docker-entrypoint.sh /srv/app/docker-entrypoint.sh


ENTRYPOINT ["/srv/app/docker-entrypoint.sh"]
