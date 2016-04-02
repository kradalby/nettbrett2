'use strict'

let datausage = (function () {
  let format_bytes = function (bytes, decimals) {
    if (bytes === 0) return '0 Byte'
    let k = 1000
    let dm = decimals + 1 || 3
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i]
  }

  return {
    format_bytes: format_bytes
  }
})()

module.exports = datausage
