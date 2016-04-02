-module(bandwidth).
-behaviour(gen_server).

% Supervisor
-export([
    start/0,
    start_link/0
]).

% gen_server
-export([
    init/1,
    handle_call/3,
    handle_cast/2,
    handle_info/2,
    code_change/3,
    terminate/2
]).

% API
-export([
]).

% Test
-export([
    calculate_speed/4
]).

-record(state, {
    max_speed = 0,
    peak_in = 0,
    peak_out = 0,
    bytes_in = 0,
    bytes_out = 0,
    time_in = 0,
    time_out = 0
}).

start() ->
    gen_server:start({local, ?MODULE}, ?MODULE, [], []).

start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

init([]) ->
    {ok, #state{}}.

handle_call({test}, _From, S) ->
    Host = "129.241.105.205",
    InterfaceIn = [1,3,6,1,2,1,31,1,1,1,6,2],
    Uptime = [1,3,6,1,2,1,1,3,0],

    [{InterfaceIn, _, BytesIn},{Uptime, _, TimeTicks}] = simple_snmp:get(Host, [InterfaceIn, Uptime]),
    io:format("In: ~p~n Ticks: ~p~n", [BytesIn, TimeTicks]),

    Speed = calculate_speed(BytesIn, S#state.bytes_in, TimeTicks, S#state.time_in),

    {reply, Speed, S#state{bytes_in=BytesIn, time_in=TimeTicks}}.

handle_cast(_Message, State) ->
    {noreply, State}.

handle_info(Message, State) ->
    io:format("Got unexpected message: ~p~n", [Message]),
    {noreply, State}.

code_change(_OldVersion, State, _Extra) ->
    {ok, State}.

terminate(_Reason, _State) ->
    ok.

-spec calculate_speed(integer(), integer(), integer(), integer()) -> integer().
calculate_speed(CurrentBytes, PastBytes, CurrentTimeStamp, PastTimeStamp) ->
    % SNMP TimeTicks are based on hundres of seconds.
    Now = CurrentTimeStamp/100,
    Past = PastTimeStamp/100,

    ByteDelta = CurrentBytes - PastBytes,
    TimeDelta = Now - Past,

    % Bits per seconds
    round((ByteDelta * 8) / TimeDelta).
