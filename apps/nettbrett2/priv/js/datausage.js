'use strict'

let datausage = (function () {
  let data_in = document.getElementById('total-data-in')
  let data_out = document.getElementById('total-data-out')
  let format_bytes = function (bytes, decimals) {
    if (bytes === 0) return '0 Byte'
    let k = 1000
    let dm = decimals + 1 || 3
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i]
  }

  let update_in = function (bytes, decimals) {
    data_in.innerHTML = format_bytes(bytes, decimals)
  }

  let update_out = function (bytes, decimals) {
    data_out.innerHTML = format_bytes(bytes, decimals)
  }

  return {
    format_bytes: format_bytes,
    update_in: update_in,
    update_out: update_out
  }
})()

module.exports = datausage
