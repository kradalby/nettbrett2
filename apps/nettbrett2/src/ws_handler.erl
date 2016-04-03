-module(ws_handler).

-export([init/2]).

-export([
    websocket_handle/3,
    websocket_info/3
]).

init(Request, _Options) ->
    ws_broadcast_handler:register(self()),
    {cowboy_websocket, Request, [], infinity}.

websocket_handle(Frame, Request, State) ->
    io:format("Got HANDLE message: ~p~n", [Frame]),
    {ok, Request, State}.

websocket_info(Message, Request, State) ->
    {reply, {text, Message}, Request, State}.
