-module(ws_handler).

-export([init/2]).

-export([
    % websocket_handle/3,
    websocket_info/3
]).

init(Request, _Options) ->
    {cowboy_websocket, Request, [], 60000}.

websocket_info(Message, Request, State) ->
    {reply, {text, Message}, Request, State}.
