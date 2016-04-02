-module(bandwidth_tests).
-include_lib("eunit/include/eunit.hrl").

calculate_speed_test() ->
    Timestamp = 0,
    Timestamp1 = 100, % one second
    Bytes = 0,
    Bytes1 = 1000,
    Expected = 8000,
    Result = bandwidth:calculate_speed(Bytes1, Bytes, Timestamp1, Timestamp),
    ?assertEqual(Expected, Result).

calculate_speed2_test() ->
    Timestamp = 0,
    Timestamp1 = 2000, % 20 seconds
    Bytes = 0,
    Bytes1 = round(500 * 1000 * 1000),
    Expected = round(500 / 20 * 8 * 1000 * 1000),
    Result = bandwidth:calculate_speed(Bytes1, Bytes, Timestamp1, Timestamp),
    ?assertEqual(Expected, Result).

calculate_speed3_test() ->
    Timestamp = 0,
    Timestamp1 = 10000, % 100 seconds
    Bytes = 0,
    Bytes1 = round(100 * 1000 * 1000 * 1000),
    Expected = round(100 / 100 * 8 * 1000 * 1000 * 1000),
    Result = bandwidth:calculate_speed(Bytes1, Bytes, Timestamp1, Timestamp),
    ?assertEqual(Expected, Result).
