-module(runner).

-export([
    start/0,
    start_link/0,
    init/0,
    module_loop/2
]).


start() ->
    spawn(?MODULE, init, []).

start_link() ->
    spawn_link(?MODULE, init, []).

init() ->
    start_loop(bandwidth, application:get_env('nettbrett2', bw_timeout, 5000)),
    start_loop(pong, application:get_env('nettbrett2', pong_timeout, 10000)).

start_loop(Module, Sleep) ->
    spawn_link(?MODULE, module_loop, [Module, Sleep]).

module_loop(Module, Sleep) ->
    JSON = case Module of
        bandwidth ->
            bandwidth:get();
        pong ->
            pong:get()
    end,
    ws_broadcast_handler:broadcast(JSON),
    timer:sleep(Sleep),
    module_loop(Module, Sleep).
