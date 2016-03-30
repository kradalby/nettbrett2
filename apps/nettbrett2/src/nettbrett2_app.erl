%%%-------------------------------------------------------------------
%% @doc nettbrett2 public API
%% @end
%%%-------------------------------------------------------------------

-module('nettbrett2_app').

-behaviour(application).

%% Application callbacks
-export([start/2
        ,stop/1]).

%%====================================================================
%% API
%%====================================================================

start(_StartType, _StartArgs) ->
    'nettbrett2_sup':start_link().

%%--------------------------------------------------------------------
stop(_State) ->
    ok.

%%====================================================================
%% Internal functions
%%====================================================================
