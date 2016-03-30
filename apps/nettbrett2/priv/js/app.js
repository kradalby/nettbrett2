'use strict'
var util = require("util")
var bandwidth = require("./bandwidth.js")
var du = require("./datausage.js")
var leases = require('./leases.js')


var app = (function () {

    var getWSAddress = function () {
        var loc = window.location, wsurl
        if (loc.protocol === "https:") {
            wsurl = "wss:"
        } else {
            wsurl = "ws:"
        }
        wsurl += "//" + loc.host + "/ws"

        return wsurl
    }



    var hideToggle = function (element) {
        if (element.style.display === "none") {
            element.style.display = "block"
        } else {
            element.style.display = "none"
        }
    }

    return {
        init: function () {
            var socket = new WebSocket(getWSAddress())

            socket.onmessage = function (event) {
                var msg = JSON.parse(event.data)

                switch(msg.dataType) {
                    case "uplink":
                        bandwidth.draw_chart_bandwidth_in(msg.data.speedDown, msg.data.maxSpeed)
                        bandwidth.draw_chart_bandwidth_out(msg.data.speedUp, msg.data.maxSpeed)
                        bandwidth.update_peak_bandwidth(msg.data.peakSpeedDown, msg.data.peakSpeedUp)
                        document.querySelector("#total-data-in").innerHTML = du.format_bytes(msg.data.bytesReceived, 3)
                        document.querySelector("#total-data-out").innerHTML = du.format_bytes(msg.data.bytesSent, 3)
                        break
                }

            }

            leases.init()

        },
    }

})()

app.init()
