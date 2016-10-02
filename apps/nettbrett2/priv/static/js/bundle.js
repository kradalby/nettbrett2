(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var bandwidth = require('./bandwidth.js');
var datausage = require('./datausage.js');
var pong = require('./pong.js');
var ReconnectingWebSocket = require('shopify-reconnecting-websocket');

var app = function () {
  var getWSAddress = function getWSAddress() {
    var loc = window.location;
    var wsurl = '';
    if (loc.protocol === 'https:') {
      wsurl = 'wss:';
    } else {
      wsurl = 'ws:';
    }
    wsurl += '//' + loc.host + '/ws';

    return wsurl;
  };

  var hideToggle = function hideToggle(element) {
    if (element.style.display === 'none') {
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  };

  return {
    init: function init() {
      var socket = new ReconnectingWebSocket(getWSAddress());

      socket.onmessage = function (event) {
        var msg = JSON.parse(event.data);

        switch (msg.data_type) {
          case 'bandwidth':
            console.log(msg);
            bandwidth.draw_chart_bandwidth_in(msg.data.speed_in, msg.data.max_speed);
            bandwidth.draw_chart_bandwidth_out(msg.data.speed_out, msg.data.max_speed);
            bandwidth.update_peak_bandwidth(msg.data.peak_speed_in, msg.data.peak_speed_out);
            datausage.update_in(msg.data.bytes_in);
            datausage.update_out(msg.data.bytes_out);
            break;
          //case 'pong':
          //  pong.update_pings(msg.data.hosts)
          //  break
          //case 'srcds':
          //  console.log(msg.data)
        }
      };
    }
  };
}();

app.init();

},{"./bandwidth.js":2,"./datausage.js":3,"./pong.js":4,"shopify-reconnecting-websocket":5}],2:[function(require,module,exports){
'use strict';

var bandwidth = function () {
  var chart_bandwidth_in = null;
  var chart_bandwidth_out = null;
  var current_data_in = null;
  var current_data_out = null;

  google.charts.setOnLoadCallback(draw_init_bandwidth_in_chart);
  function draw_init_bandwidth_in_chart() {
    chart_bandwidth_in = new google.visualization.PieChart(document.getElementById('bandwidth-in-chart'));

    current_data_in = create_chart_data(0, 100);
    chart_bandwidth_in.draw(current_data_in, chart_options);
  }

  google.charts.setOnLoadCallback(draw_init_bandwidth_out_chart);
  function draw_init_bandwidth_out_chart() {
    chart_bandwidth_out = new google.visualization.PieChart(document.getElementById('bandwidth-out-chart'));

    current_data_out = create_chart_data(0, 100);
    chart_bandwidth_out.draw(current_data_out, chart_options);
  }

  var chart_options = {
    pieHole: 0.7,
    backgroundColor: '#efefef',
    chartArea: { 'width': '85%', 'height': '80%' },
    animation: {
      duration: 3000,
      easing: 'in'
    },
    pieSliceText: 'none',
    pieSliceBorderColor: 'black',
    tooltip: { trigger: 'none' },
    legend: 'none',
    slices: {
      0: { color: 'pink' },
      1: { color: 'transparent' }
    }
  };

  var create_chart_data = function create_chart_data(bits, max) {
    var data = [['', '']];

    var used = bits / max * 100;
    var unused = 100 - used;

    data.push(['used', used]);
    data.push(['unused', unused]);

    data = google.visualization.arrayToDataTable(data);
    return data;
  };

  var animate_transition = function animate_transition(chart, current_data, new_data) {
    var current_usage = current_data.getValue(0, 1);
    var new_usage = new_data.getValue(0, 1);

    var counter = 0;
    var render_steps = 100;
    var render_time = 1000;

    if (current_usage > new_usage) {
      var _loop = function _loop(p) {
        setTimeout(function () {
          chart.draw(create_chart_data(p, 100 - p), chart_options);
        }, counter * render_time / render_steps);
        counter += 1;
      };

      // Animate from more to less
      for (var p = current_usage; p > new_usage; p -= (current_usage - new_usage) / render_steps) {
        _loop(p);
      }
    } else {
      var _loop2 = function _loop2(_p) {
        setTimeout(function () {
          chart.draw(create_chart_data(_p, 100 - _p), chart_options);
        }, counter * render_time / render_steps);
        counter += 1;
      };

      // Animate from less to more
      for (var _p = current_usage; _p < new_usage; _p += (new_usage - current_usage) / render_steps) {
        _loop2(_p);
      }
    }

    return new_data;
  };

  var format_speed = function format_speed(bits_per_second, decimals) {
    if (bits_per_second === 0) return '0 bit/s';
    var k = 1024;
    var dm = decimals + 1 || 3;
    var sizes = ['bit/s', 'Kbit/s', 'Mbit/s', 'Gbit/s', 'Tbit/s', 'Pbit/s', 'Ebit/s', 'Zbit/s', 'Ybit/s'];
    var i = Math.floor(Math.log(bits_per_second) / Math.log(k));
    return (bits_per_second / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
  };

  var draw_chart_bandwidth_in = function draw_chart_bandwidth_in(bits, max) {
    var chart_center_bandwidth_in = document.getElementById('bandwidth-in-center');
    var data = create_chart_data(bits, max);

    current_data_in = animate_transition(chart_bandwidth_in, current_data_in, data);
    chart_center_bandwidth_in.innerHTML = format_speed(bits, 2);
  };

  var draw_chart_bandwidth_out = function draw_chart_bandwidth_out(bits, max) {
    var chart_center_bandwidth_out = document.getElementById('bandwidth-out-center');
    var data = create_chart_data(bits, max);

    current_data_out = animate_transition(chart_bandwidth_out, current_data_out, data);
    chart_center_bandwidth_out.innerHTML = format_speed(bits, 2);
  };

  var update_peak_bandwidth = function update_peak_bandwidth(inn, out) {
    var bandwidth_peak_in = document.getElementById('bandwidth-peak-in');
    var bandwidth_peak_out = document.getElementById('bandwidth-peak-out');

    // Some wierd formatting error
    if (inn < 1100000000) {
      bandwidth_peak_in.innerHTML = format_speed(inn, 3);
    } else {
      bandwidth_peak_in.innerHTML = format_speed(inn, 2);
    }
    if (out < 1100000000) {
      bandwidth_peak_out.innerHTML = format_speed(out, 3);
    } else {
      bandwidth_peak_out.innerHTML = format_speed(out, 2);
    }
  };

  return {
    format_speed: format_speed,
    draw_chart_bandwidth_in: draw_chart_bandwidth_in,
    draw_chart_bandwidth_out: draw_chart_bandwidth_out,
    update_peak_bandwidth: update_peak_bandwidth
  };
}();

module.exports = bandwidth;

},{}],3:[function(require,module,exports){
'use strict';

var datausage = function () {
  var data_in = document.getElementById('total-data-in');
  var data_out = document.getElementById('total-data-out');
  var format_bytes = function format_bytes(bytes, decimals) {
    if (bytes === 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
  };

  var update_in = function update_in(bytes, decimals) {
    data_in.innerHTML = format_bytes(bytes, decimals);
  };

  var update_out = function update_out(bytes, decimals) {
    data_out.innerHTML = format_bytes(bytes, decimals);
  };

  return {
    format_bytes: format_bytes,
    update_in: update_in,
    update_out: update_out
  };
}();

module.exports = datausage;

},{}],4:[function(require,module,exports){
'use strict';

var pong = function () {
  // let dhcp_widget = document.getElementById('dhcp')
  var total_pings = document.getElementById('total-ping');

  var update_pings = function update_pings(amount) {
    total_pings.innerHTML = amount;
  };
  return {
    update_pings: update_pings
  };
}();

module.exports = pong;

},{}],5:[function(require,module,exports){
// MIT License:
//
// Copyright (c) 2010-2012, Joe Walnes
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * This behaves like a WebSocket in every way, except if it fails to connect,
 * or it gets disconnected, it will repeatedly poll until it successfully connects
 * again.
 *
 * It is API compatible, so when you have:
 *   ws = new WebSocket('ws://....');
 * you can replace with:
 *   ws = new ReconnectingWebSocket('ws://....');
 *
 * The event stream will typically look like:
 *  onconnecting
 *  onopen
 *  onmessage
 *  onmessage
 *  onclose // lost connection
 *  onconnecting
 *  onopen  // sometime later...
 *  onmessage
 *  onmessage
 *  etc...
 *
 * It is API compatible with the standard WebSocket API, apart from the following members:
 *
 * - `bufferedAmount`
 * - `extensions`
 * - `binaryType`
 *
 * Latest version: https://github.com/joewalnes/reconnecting-websocket/
 * - Joe Walnes
 *
 * Syntax
 * ======
 * var socket = new ReconnectingWebSocket(url, protocols, options);
 *
 * Parameters
 * ==========
 * url - The url you are connecting to.
 * protocols - Optional string or array of protocols.
 * options - See below
 *
 * Options
 * =======
 * Options can either be passed upon instantiation or set after instantiation:
 *
 * var socket = new ReconnectingWebSocket(url, null, { debug: true, reconnectInterval: 4000 });
 *
 * or
 *
 * var socket = new ReconnectingWebSocket(url);
 * socket.debug = true;
 * socket.reconnectInterval = 4000;
 *
 * debug
 * - Whether this instance should log debug messages. Accepts true or false. Default: false.
 *
 * automaticOpen
 * - Whether or not the websocket should attempt to connect immediately upon instantiation. The socket can be manually opened or closed at any time using ws.open() and ws.close().
 *
 * reconnectInterval
 * - The number of milliseconds to delay before attempting to reconnect. Accepts integer. Default: 1000.
 *
 * maxReconnectInterval
 * - The maximum number of milliseconds to delay a reconnection attempt. Accepts integer. Default: 30000.
 *
 * reconnectDecay
 * - The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. Accepts integer or float. Default: 1.5.
 *
 * timeoutInterval
 * - The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. Accepts integer. Default: 2000.
 *
 */
(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports){
        module.exports = factory();
    } else {
        global.ReconnectingWebSocket = factory();
    }
})(this, function () {

    if (!('WebSocket' in window)) {
        return;
    }

    function ReconnectingWebSocket(url, protocols, options) {

        // Default settings
        var settings = {

            /** Whether this instance should log debug messages. */
            debug: false,

            /** Whether or not the websocket should attempt to connect immediately upon instantiation. */
            automaticOpen: true,

            /** The number of milliseconds to delay before attempting to reconnect. */
            reconnectInterval: 1000,
            /** The maximum number of milliseconds to delay a reconnection attempt. */
            maxReconnectInterval: 30000,
            /** The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. */
            reconnectDecay: 1.5,

            /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
            timeoutInterval: 2000,

            /** The maximum number of reconnection attempts to make. Unlimited if null. */
            maxReconnectAttempts: null,

            /** The binary type, possible values 'blob' or 'arraybuffer', default 'blob'. */
            binaryType: 'blob'
        }
        if (!options) { options = {}; }

        // Overwrite and define settings with options if they exist.
        for (var key in settings) {
            if (typeof options[key] !== 'undefined') {
                this[key] = options[key];
            } else {
                this[key] = settings[key];
            }
        }

        // These should be treated as read-only properties

        /** The URL as resolved by the constructor. This is always an absolute URL. Read only. */
        this.url = url;

        /** The number of attempted reconnects since starting, or the last successful connection. Read only. */
        this.reconnectAttempts = 0;

        /**
         * The current state of the connection.
         * Can be one of: WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED
         * Read only.
         */
        this.readyState = WebSocket.CONNECTING;

        /**
         * A string indicating the name of the sub-protocol the server selected; this will be one of
         * the strings specified in the protocols parameter when creating the WebSocket object.
         * Read only.
         */
        this.protocol = null;

        // Private state variables

        var self = this;
        var ws;
        var forcedClose = false;
        var timedOut = false;
        var eventTarget = document.createElement('div');

        // Wire up "on*" properties as event handlers

        eventTarget.addEventListener('open',       function(event) { self.onopen(event); });
        eventTarget.addEventListener('close',      function(event) { self.onclose(event); });
        eventTarget.addEventListener('connecting', function(event) { self.onconnecting(event); });
        eventTarget.addEventListener('message',    function(event) { self.onmessage(event); });
        eventTarget.addEventListener('error',      function(event) { self.onerror(event); });

        // Expose the API required by EventTarget

        this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
        this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
        this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);

        /**
         * This function generates an event that is compatible with standard
         * compliant browsers and IE9 - IE11
         *
         * This will prevent the error:
         * Object doesn't support this action
         *
         * http://stackoverflow.com/questions/19345392/why-arent-my-parameters-getting-passed-through-to-a-dispatched-event/19345563#19345563
         * @param s String The name that the event should use
         * @param args Object an optional object that the event will use
         */
        function generateEvent(s, args) {
        	var evt = document.createEvent("CustomEvent");
        	evt.initCustomEvent(s, false, false, args);
        	return evt;
        };

        this.open = function (reconnectAttempt) {
            ws = new WebSocket(self.url, protocols || []);
            ws.binaryType = this.binaryType;

            if (reconnectAttempt) {
                if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
                    return;
                }
            } else {
                eventTarget.dispatchEvent(generateEvent('connecting'));
                this.reconnectAttempts = 0;
            }

            if (self.debug || ReconnectingWebSocket.debugAll) {
                console.debug('ReconnectingWebSocket', 'attempt-connect', self.url);
            }

            var localWs = ws;
            var timeout = setTimeout(function() {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'connection-timeout', self.url);
                }
                timedOut = true;
                localWs.close();
                timedOut = false;
            }, self.timeoutInterval);

            ws.onopen = function(event) {
                clearTimeout(timeout);
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onopen', self.url);
                }
                self.protocol = ws.protocol;
                self.readyState = WebSocket.OPEN;
                self.reconnectAttempts = 0;
                var e = generateEvent('open');
                e.isReconnect = reconnectAttempt;
                reconnectAttempt = false;
                eventTarget.dispatchEvent(e);
            };

            ws.onclose = function(event) {
                clearTimeout(timeout);
                ws = null;
                if (forcedClose) {
                    self.readyState = WebSocket.CLOSED;
                    eventTarget.dispatchEvent(generateEvent('close'));
                } else {
                    self.readyState = WebSocket.CONNECTING;
                    var e = generateEvent('connecting');
                    e.code = event.code;
                    e.reason = event.reason;
                    e.wasClean = event.wasClean;
                    eventTarget.dispatchEvent(e);
                    if (!reconnectAttempt && !timedOut) {
                        if (self.debug || ReconnectingWebSocket.debugAll) {
                            console.debug('ReconnectingWebSocket', 'onclose', self.url);
                        }
                        eventTarget.dispatchEvent(generateEvent('close'));
                    }

                    var timeout = self.reconnectInterval * Math.pow(self.reconnectDecay, self.reconnectAttempts);
                    setTimeout(function() {
                        self.reconnectAttempts++;
                        self.open(true);
                    }, timeout > self.maxReconnectInterval ? self.maxReconnectInterval : timeout);
                }
            };
            ws.onmessage = function(event) {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onmessage', self.url, event.data);
                }
                var e = generateEvent('message');
                e.data = event.data;
                eventTarget.dispatchEvent(e);
            };
            ws.onerror = function(event) {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onerror', self.url, event);
                }
                eventTarget.dispatchEvent(generateEvent('error'));
            };
        }

        // Whether or not to create a websocket upon instantiation
        if (this.automaticOpen == true) {
            this.open(false);
        }

        /**
         * Transmits data to the server over the WebSocket connection.
         *
         * @param data a text string, ArrayBuffer or Blob to send to the server.
         */
        this.send = function(data) {
            if (ws) {
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'send', self.url, data);
                }
                return ws.send(data);
            } else {
                throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
            }
        };

        /**
         * Closes the WebSocket connection or connection attempt, if any.
         * If the connection is already CLOSED, this method does nothing.
         */
        this.close = function(code, reason) {
            // Default CLOSE_NORMAL code
            if (typeof code == 'undefined') {
                code = 1000;
            }
            forcedClose = true;
            if (ws) {
                ws.close(code, reason);
            }
        };

        /**
         * Additional public API method to refresh the connection if still open (close, re-open).
         * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
         */
        this.refresh = function() {
            if (ws) {
                ws.close();
            }
        };
    }

    /**
     * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
     * this indicates that the connection is ready to send and receive data.
     */
    ReconnectingWebSocket.prototype.onopen = function(event) {};
    /** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
    ReconnectingWebSocket.prototype.onclose = function(event) {};
    /** An event listener to be called when a connection begins being attempted. */
    ReconnectingWebSocket.prototype.onconnecting = function(event) {};
    /** An event listener to be called when a message is received from the server. */
    ReconnectingWebSocket.prototype.onmessage = function(event) {};
    /** An event listener to be called when an error occurs. */
    ReconnectingWebSocket.prototype.onerror = function(event) {};

    /**
     * Whether all instances of ReconnectingWebSocket should log debug messages.
     * Setting this to true is the equivalent of setting all instances of ReconnectingWebSocket.debug to true.
     */
    ReconnectingWebSocket.debugAll = false;

    ReconnectingWebSocket.CONNECTING = WebSocket.CONNECTING;
    ReconnectingWebSocket.OPEN = WebSocket.OPEN;
    ReconnectingWebSocket.CLOSING = WebSocket.CLOSING;
    ReconnectingWebSocket.CLOSED = WebSocket.CLOSED;

    return ReconnectingWebSocket;
});

},{}]},{},[1]);
