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
    get/0
]).

% Test
-export([
    calculate_speed/4
]).

-record(state, {
    host = "",
    interface_in = [],
    interface_out = [],
    uptime_oid = [],
    community = "public",
    max_speed = 0,
    peak_in = 0,
    peak_out = 0,
    speed_in = 0,
    speed_out = 0,
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
    {ok, Host} = application:get_env(host),
    {ok, InterfaceIn} = application:get_env(interface_in),
    {ok, InterfaceOut} = application:get_env(interface_out),
    {ok, Uptime} = application:get_env(uptime_oid),
    {ok, Community} = application:get_env(community),
    {ok, MaxSpeed} = application:get_env(max_speed),
    State = #state{
        host = Host,
        interface_in = InterfaceIn,
        interface_out = InterfaceOut,
        uptime_oid = Uptime,
        community = Community,
        max_speed = MaxSpeed
    },
    {ok, State}.

handle_call(get, _From, State) ->
    NewState = update_state(State),
    JSON = json_payload(NewState),
    {reply, JSON, NewState}.

handle_cast(_Message, State) ->
    {noreply, State}.

handle_info(Message, State) ->
    io:format("Got unexpected message: ~p~n", [Message]),
    {noreply, State}.

code_change(_OldVersion, State, _Extra) ->
    {ok, State}.

terminate(_Reason, _State) ->
    ok.

update_state(S = #state{interface_in=InterfaceIn,
        interface_out=InterfaceOut,
        uptime_oid=Uptime}
        ) ->

    {BytesIn, TimestampIn} =
        case simple_snmp:get(S#state.host, S#state.community, [InterfaceIn, Uptime]) of
            [{InterfaceIn, _, Bytes},{Uptime, _, Timestamp}] ->
                {Bytes, Timestamp};
            {error, _} ->
                {S#state.bytes_in, S#state.time_in}
        end,
    SpeedIn = calculate_speed(BytesIn, S#state.bytes_in, TimestampIn, S#state.time_in),

    {BytesOut, TimestampOut} =
        case simple_snmp:get(S#state.host, S#state.community, [InterfaceOut, Uptime]) of
            [{InterfaceOut, _, Bytes2},{Uptime, _, Timestamp2}] ->
                {Bytes2, Timestamp2};
            {error, _} ->
                {S#state.bytes_out, S#state.time_out}
        end,
    SpeedOut = calculate_speed(BytesOut, S#state.bytes_out, TimestampOut, S#state.time_out),

    S#state{
        peak_in = max(S#state.peak_in, SpeedIn),
        peak_out = max(S#state.peak_out, SpeedOut),
        speed_in = SpeedIn,
        speed_out = SpeedOut,
        bytes_in = BytesIn,
        bytes_out = BytesOut,
        time_in = TimestampIn,
        time_out = TimestampOut
    }.

json_payload(_State=#state{
        max_speed = MaxSpeed,
        peak_in = PeakIn,
        peak_out = PeakOut,
        speed_in = SpeedIn,
        speed_out = SpeedOut,
        bytes_in = BytesIn,
        bytes_out = BytesOut
    }) ->
        Map = #{
            <<"data_type">> => <<"bandwidth">>,
            <<"data">> => #{
                <<"max_speed">> => MaxSpeed,
                <<"peak_speed_in">> => PeakIn,
                <<"peak_speed_out">> => PeakOut,
                <<"speed_in">> => SpeedIn,
                <<"speed_out">> => SpeedOut,
                <<"bytes_in">> => BytesIn,
                <<"bytes_out">> => BytesOut
            }
        },
    jiffy:encode(Map).


-spec calculate_speed(integer(), integer(), integer(), integer()) -> integer().
calculate_speed(CurrentBytes, PastBytes, CurrentTimeStamp, PastTimeStamp) ->
    % SNMP TimeTicks are based on hundres of seconds.
    Now = CurrentTimeStamp/100,
    Past = PastTimeStamp/100,

    ByteDelta = CurrentBytes - PastBytes,
    TimeDelta = Now - Past,

    % Bits per seconds
    round((ByteDelta * 8) / TimeDelta).

get() ->
    gen_server:call(bandwidth, get).
