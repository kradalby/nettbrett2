-module(pong).
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
    alive/0,
    scan/1
]).

-record(state, {
    hosts_alive = 0,
    hosts_left,
    refs = [],
    caller
}).

start() ->
    gen_server:start({local, pong}, ?MODULE, [], []).

start_link() ->
    gen_server:start_link({local, pong}, ?MODULE, [], []).

init([]) ->
    {ok, #state{}}.

handle_call({scan, Networks}, From, State = #state{}) ->
    IPList = networks_to_ip_addresses(Networks, []),
    io:format("IPList: ~p~n", [IPList]),
    Hosts = length(IPList),
    io:format("Number of addr: ~p ~n", [Hosts]),
    Refs = [ping_spawn(IP) || IP <- IPList],
    {noreply, State#state{caller=From, hosts_left=Hosts, refs=Refs}}.

handle_cast({alive}, State = #state{hosts_alive=Alive}) ->
    io:format("Received alive +1~n"),
    {noreply, State#state{hosts_alive=Alive + 1}}.

handle_info({'DOWN', Ref, process, Pid, _Info}, State = #state{refs=Refs, hosts_left=Left, hosts_alive=Alive, caller=Caller}) ->
    NewRefs = lists:delete({Pid, Ref}, Refs),
    case Left - 1 of
        0 ->
            gen_server:reply(Caller, {ok, Alive}),
            {noreply, #state{}};
        N ->
            {noreply, State#state{refs=NewRefs, hosts_left=N}}
    end;

handle_info(Message, State) ->
    io:format("Got unexpected message: ~p~n", [Message]),
    {noreply, State}.

code_change(_OldVersion, State, _Extra) ->
    {ok, State}.

terminate(_Reason, _State) ->
    ok.

alive() ->
    gen_server:cast(?MODULE, {alive}).

scan(Networks) ->
    gen_server:call(?MODULE, {scan, Networks}, infinity).

networks_to_ip_addresses([], State) ->
    State;
networks_to_ip_addresses([{Network, Bits}|Tail], State) ->
    NewState = State ++ erl_ip4_utils:network_to_ip_list(Network, Bits),
    networks_to_ip_addresses(Tail, NewState).

ping_spawn(IP) ->
    spawn_monitor(fun () ->
        % io:format("Pinging: ~p from ~p ~n", [IP, self()]),
        case gen_icmp:ping(IP, [{sequence, 10}]) of
            [{ok, IP, IP, IP, _, _}] ->
                ?MODULE:alive();
            X ->
                io:format("Got: ~p~n", [X]),
                X
        end
    end).
