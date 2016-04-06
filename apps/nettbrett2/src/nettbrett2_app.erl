%%%-------------------------------------------------------------------
%% @doc nettbrett2 public API
%% @end
%%%-------------------------------------------------------------------

-module('nettbrett2_app').

-behaviour(application).

%% Application callbacks
-export([
    start/2,
    stop/1
]).

%%====================================================================
%% API
%%====================================================================

start(_StartType, _StartArgs) ->
    Dispatch = cowboy_router:compile([
        {'_', [
            {"/", cowboy_static, {priv_file, nettbrett2, "index.html"}},
            {"/static/[...]", cowboy_static, {priv_dir, nettbrett2, "static/", [{mimetypes, cow_mimetypes, all}]}},
            {"/ws", ws_handler, []}
        ]}
    ]),
    {ok, _} = cowboy:start_http(nettbrett2_http_listener, 100,
        [{port, application:get_env('nettbrett2', http_port, 80)}],
        [{env, [{dispatch, Dispatch}]}]
    ),
    'nettbrett2_sup':start_link().

%%--------------------------------------------------------------------
stop(_State) ->
    ok.

%%====================================================================
%% Internal functions
%%====================================================================
