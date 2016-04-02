%%%-------------------------------------------------------------------
%% @doc nettbrett2 top level supervisor.
%% @end
%%%-------------------------------------------------------------------

-module('nettbrett2_sup').

-behaviour(supervisor).

%% API
-export([start_link/0]).

%% Supervisor callbacks
-export([init/1]).

-define(SERVER, ?MODULE).

%%====================================================================
%% API functions
%%====================================================================

start_link() ->
    supervisor:start_link({local, ?SERVER}, ?MODULE, []).

%%====================================================================
%% Supervisor callbacks
%%====================================================================

%% Child :: {Id,StartFunc,Restart,Shutdown,Type,Modules}
init([]) ->
    {ok, { {one_for_all, 3, 60}, [
        {
            ws_broadcast, {ws_broadcast_handler, start_link, []},
            permanent,
            5000,
            worker,
            [ws_broadcast_handler]
        },
        {
            bw, {bandwidth, start_link, []},
            permanent,
            5000,
            worker,
            [bandwidth]
        },
        {
            ping, {pong, start_link, []},
            permanent,
            5000,
            worker,
            [pong]
        }
    ]} }.

%%====================================================================
%% Internal functions
%%====================================================================
