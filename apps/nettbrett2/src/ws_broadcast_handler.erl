-module(ws_broadcast_handler).
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
    register/1,
    broadcast/1
]).

start() ->
    gen_server:start({local, ws_broadcast_handler}, ?MODULE, [], []).

start_link() ->
    gen_server:start_link({local, ws_broadcast_handler}, ?MODULE, [], []).

init([]) ->
    {ok, []}.

handle_call({broadcast, Message}, _From, State) ->
    io:format("Sending to ~p~n", [State]),
    % [Pid ! Message || {_Ref, Pid} <- State],
    lists:foreach(fun({_Ref, Pid}) -> Pid ! Message end, State),
    {reply, ok, State};

handle_call(Message, _From, State) ->
    {reply, Message, State}.

handle_cast({register, Pid}, State) when is_pid(Pid) ->
    Ref = monitor(process, Pid),
    io:format("Added new connection: ~p, ~p~n", [Pid, Ref]),
    {noreply, [{Ref, Pid} | State]};

handle_cast(_Message, State) ->
    {noreply, State}.

handle_info({'DOWN', Ref, process, Pid, _}, State) ->
    io:format("Connection to ~p lost ~n", [{Ref, Pid}]),
    case lists:keyfind(Ref, 1, State) of
        false -> {noreply, State};
        {Ref, Pid} ->
            NewState = lists:delete({Ref, Pid}, State),
            io:format("NewState: ~p~n", [NewState]),
            {noreply, NewState}
    end;

handle_info(Message, State) ->
    io:format("Unknown msg: ~p~n", [Message]),
    {noreply, State}.

code_change(_OldVersion, State, _Extra) ->
    {ok, State}.

terminate(_Reason, _State) ->
    ok.

register(Pid) when is_pid(Pid) ->
    gen_server:cast(?MODULE, {register, Pid}).

broadcast(Message) ->
    gen_server:call(?MODULE, {broadcast, Message}).
