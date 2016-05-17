-module(runner).

-export([
    start/0,
    start_link/0,
    init/0,
    module_loop/2
]).


start() ->
    Pid = spawn(?MODULE, init, []),
    {ok, Pid}.

start_link() ->
    Pid = spawn_link(?MODULE, init, []),
    {ok, Pid}.

init() ->
    io:format("Starting bandwidth loop~n"),
    start_loop(bandwidth, application:get_env('nettbrett2', bw_timeout, 5000)),
    io:format("Starting pong loop~n"),
    start_loop(pong, application:get_env('nettbrett2', pong_timeout, 10000)),
    io:format("Starting srcds loop~n"),
    start_loop(srcds, application:get_env('nettbrett2', srcds_timeout, 5000)),
    % Do not quit this process.
    receive
        {neverever} -> derp
    end.

start_loop(Module, Sleep) ->
    spawn_link(?MODULE, module_loop, [Module, Sleep]).

module_loop(Module, Sleep) ->
    io:format("loop ~p ~p ~n", [Module, Sleep]),
    JSON = case Module of
               bandwidth ->
                   bandwidth:get();
               pong ->
                   pong:get();
               srcds ->
                   srcds:get()
    end,
    io:format("Sleeping ~p for ~p ~n", [Module, Sleep]),
    ws_broadcast_handler:broadcast(JSON),
    timer:sleep(Sleep),
    module_loop(Module, Sleep).
