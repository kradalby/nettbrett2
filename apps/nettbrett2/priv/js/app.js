'use strict'
let bandwidth = require('./bandwidth.js')
let datausage = require('./datausage.js')
let pong = require('./pong.js')

let app = (function () {
  let getWSAddress = function () {
    let loc = window.location
    let wsurl = ''
    if (loc.protocol === 'https:') {
      wsurl = 'wss:'
    } else {
      wsurl = 'ws:'
    }
    wsurl += '//' + loc.host + '/ws'

    return wsurl
  }

  let hideToggle = function (element) {
    if (element.style.display === 'none') {
      element.style.display = 'block'
    } else {
      element.style.display = 'none'
    }
  }

  let handle_connection_reset = function (event) {
    console.log('Got event: ')
    console.log(event)
    app.init()
  }

  return {
    init: function () {
      let socket = new WebSocket(getWSAddress())

      // socket.onerror = handle_connection_reset
      // socket.onclose = handle_connection_reset

      socket.onmessage = function (event) {
        let msg = JSON.parse(event.data)

        switch (msg.data_type) {
          case 'bandwidth':
            bandwidth.draw_chart_bandwidth_in(msg.data.speed_in, msg.data.max_speed)
            bandwidth.draw_chart_bandwidth_out(msg.data.speed_out, msg.data.max_speed)
            bandwidth.update_peak_bandwidth(msg.data.peak_speed_in, msg.data.peak_speed_out)
            datausage.update_in(msg.data.bytes_in)
            datausage.update_out(msg.data.bytes_out)
            break
          case 'pong':
            pong.update_pings(msg.data.hosts)
            break
        }
      }
    }
  }
})()

app.init()
