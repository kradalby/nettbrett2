'use strict'
let request = require('browser-request')

let leases = (function () {
  // let dhcp_widget = document.getElementById('dhcp')
  let dhcp_leases = document.getElementById('total-ip-leases')

  let fetch_data = function (url) {
    request(url, function (err, response, body) {
      if (err) {
        throw err
      }
      console.log(body)
      let json = JSON.parse(body)
      update_leases(json['summary']['used'])
    })
  }

  let update_leases = function (amount) {
    dhcp_leases.innerHTML = amount
  }

  let runner = function (url) {
    fetch_data(url)
    window.setTimeout(function () {
      runner(url)
    }, 5000)
  }

  return {
    init: function () {
      let url = 'http://dolly.pp24.polarparty.no:81/cgi-bin/leases.cgi'
      runner(url)
    }
  }
})()

module.exports = leases
