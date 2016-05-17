-module(srcds).
-behaviour(gen_server).

-export([
    start/0,
    start_link/0
]).

-export([
    init/1,
    handle_call/3,
    handle_cast/2,
    handle_info/2,
    code_change/3,
    terminate/2
]).

-export([
    get/0
]).


start() ->
    gen_server:start({local, ?MODULE}, ?MODULE, [], []).

start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

init([]) ->
    {ok, []}.

handle_call({query, Servers}, _From, State) ->
    io:format("derp~n"),
    ServerInfo = [erlsrcds:info(IP, Port) || {IP, Port} <- Servers],
    io:format("Serverinfo ~p~n", [ServerInfo]),
    {reply, json_payload(ServerInfo), State};

handle_call(Message, From, State) ->
    io:format("Got unexpected call ~p from ~p ~n", [Message, From]),
    {reply, State, State}.

handle_cast(Message, State) ->
    io:format("Got unexpexted cast: ~p~n", [Message]),
    {noreply, State}.

handle_info(Message, State) ->
    io:format("Got unexpected message: ~p~n", [Message]),
    {noreply, State}.

code_change(_OldVersion, State, _Extra) ->
    {ok, State}.

terminate(_Reason, _State) ->
    ok.

json_payload(ServerInfo) ->
    Map = #{
      <<"data_type">> => <<"srcds">>,
      <<"data">> => ServerInfo
     },
    jsx:encode(Map).

get() ->
    Servers = application:get_env('nettbrett2', game_servers, [{}]),
    io:format("Getting server info ~p~n", [Servers]),
    gen_server:call(?MODULE, {query, Servers}, infinity).
