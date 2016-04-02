'use strict'
let bandwidth = require('./bandwidth.js')
let datausage = require('./datausage.js')
// let leases = require('./leases.js')

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

      socket.onerror = handle_connection_reset
      socket.onclose = handle_connection_reset

      socket.onmessage = function (event) {
        console.log(event.data)
        let msg = JSON.parse(event.data)

        switch (msg.dataType) {
          case 'uplink':
            bandwidth.draw_chart_bandwidth_in(msg.data.speedDown, msg.data.maxSpeed)
            bandwidth.draw_chart_bandwidth_out(msg.data.speedUp, msg.data.maxSpeed)
            bandwidth.update_peak_bandwidth(msg.data.peakSpeedDown, msg.data.peakSpeedUp)
            datausage.update_in(msg.data.bytesReceived)
            datausage.update_out(msg.data.bytesSent)
            break
          case 'pong':
            console.log('received from pong:')
            console.log(msg.data)
            break
        }
      }
      // leases.init()
    }
  }
})()

app.init()
