(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var bandwidth = require('./bandwidth.js');
var datausage = require('./datausage.js');
var pong = require('./pong.js');

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

  var handle_connection_reset = function handle_connection_reset(event) {
    console.log('Got event: ');
    console.log(event);
    app.init();
  };

  return {
    init: function init() {
      var socket = new WebSocket(getWSAddress());

      // socket.onerror = handle_connection_reset
      // socket.onclose = handle_connection_reset

      socket.onmessage = function (event) {
        var msg = JSON.parse(event.data);

        switch (msg.data_type) {
          case 'bandwidth':
            bandwidth.draw_chart_bandwidth_in(msg.data.speed_in, msg.data.max_speed);
            bandwidth.draw_chart_bandwidth_out(msg.data.speed_out, msg.data.max_speed);
            bandwidth.update_peak_bandwidth(msg.data.peak_speed_in, msg.data.peak_speed_out);
            datausage.update_in(msg.data.bytes_in);
            datausage.update_out(msg.data.bytes_out);
            break;
          case 'pong':
            pong.update_pings(msg.data.hosts);
            break;
        }
      };
    }
  };
}();

app.init();

},{"./bandwidth.js":2,"./datausage.js":3,"./pong.js":4}],2:[function(require,module,exports){
'use strict';

var bandwidth = function () {
  var chart_bandwidth_in = null;
  var chart_bandwidth_out = null;

  google.charts.setOnLoadCallback(draw_init_bandwidth_in_chart);
  function draw_init_bandwidth_in_chart() {
    chart_bandwidth_in = new google.visualization.PieChart(document.getElementById('bandwidth-in-chart'));

    chart_bandwidth_in.draw(create_chart_data(0, 100), chart_options);
  }

  google.charts.setOnLoadCallback(draw_init_bandwidth_out_chart);
  function draw_init_bandwidth_out_chart() {
    chart_bandwidth_out = new google.visualization.PieChart(document.getElementById('bandwidth-out-chart'));

    chart_bandwidth_out.draw(create_chart_data(0, 100), chart_options);
  }

  var chart_options = {
    pieHole: 0.7,
    backgroundColor: '#efefef',
    chartArea: { 'width': '85%', 'height': '80%' },
    animation: {
      duration: 1000,
      easing: 'out'
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

    data.push(['', used]);
    data.push(['', unused]);

    data = google.visualization.arrayToDataTable(data);
    return data;
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

    chart_bandwidth_in.draw(data, chart_options);
    chart_center_bandwidth_in.innerHTML = format_speed(bits, 2);
  };

  var draw_chart_bandwidth_out = function draw_chart_bandwidth_out(bits, max) {
    var chart_center_bandwidth_out = document.getElementById('bandwidth-out-center');
    var data = create_chart_data(bits, max);

    chart_bandwidth_out.draw(data, chart_options);
    chart_center_bandwidth_out.innerHTML = format_speed(bits, 2);
  };

  var update_peak_bandwidth = function update_peak_bandwidth(inn, out) {
    var bandwidth_peak_in = document.getElementById('bandwidth-peak-in');
    var bandwidth_peak_out = document.getElementById('bandwidth-peak-out');

    bandwidth_peak_in.innerHTML = format_speed(inn, 2);
    bandwidth_peak_out.innerHTML = format_speed(out, 2);
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

},{}]},{},[1]);
