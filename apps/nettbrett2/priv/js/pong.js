'use strict'

let pong = (function () {
  // let dhcp_widget = document.getElementById('dhcp')
  let total_pings = document.getElementById('total-ping')

  let update_pings = function (amount) {
    total_pings.innerHTML = amount
  }
  return {
    update_pings: update_pings
  }
})()

module.exports = pong
