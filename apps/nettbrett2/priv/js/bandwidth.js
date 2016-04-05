'use strict'

let bandwidth = (function () {
  let chart_bandwidth_in = null
  let chart_bandwidth_out = null

  google.charts.setOnLoadCallback(draw_init_bandwidth_in_chart)
  function draw_init_bandwidth_in_chart () {
    chart_bandwidth_in = new google.visualization.PieChart(document.getElementById('bandwidth-in-chart'))

    chart_bandwidth_in.draw(create_chart_data(0, 100), chart_options)
  }

  google.charts.setOnLoadCallback(draw_init_bandwidth_out_chart)
  function draw_init_bandwidth_out_chart () {
    chart_bandwidth_out = new google.visualization.PieChart(document.getElementById('bandwidth-out-chart'))

    chart_bandwidth_out.draw(create_chart_data(0, 100), chart_options)
  }

  let chart_options = {
    pieHole: 0.7,
    backgroundColor: '#efefef',
    chartArea: {'width': '85%', 'height': '80%'},
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
  }

  let create_chart_data = function (bits, max) {
    let data = [
      ['', '']
    ]

    let used = (bits / max) * 100
    let unused = 100 - used

    data.push(['used', used])
    data.push(['unused', unused])

    data = google.visualization.arrayToDataTable(data)
    return data
  }

  let format_speed = function (bits_per_second, decimals) {
    if (bits_per_second === 0) return '0 bit/s'
    let k = 1024
    let dm = decimals + 1 || 3
    let sizes = ['bit/s', 'Kbit/s', 'Mbit/s', 'Gbit/s', 'Tbit/s', 'Pbit/s', 'Ebit/s', 'Zbit/s', 'Ybit/s']
    let i = Math.floor(Math.log(bits_per_second) / Math.log(k))
    return (bits_per_second / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i]
  }

  let draw_chart_bandwidth_in = function (bits, max) {
    let chart_center_bandwidth_in = document.getElementById('bandwidth-in-center')
    let data = create_chart_data(bits, max)

    chart_bandwidth_in.draw(data, chart_options)
    chart_center_bandwidth_in.innerHTML = format_speed(bits, 2)
  }

  let draw_chart_bandwidth_out = function (bits, max) {
    let chart_center_bandwidth_out = document.getElementById('bandwidth-out-center')
    let data = create_chart_data(bits, max)

    chart_bandwidth_out.draw(data, chart_options)
    chart_center_bandwidth_out.innerHTML = format_speed(bits, 2)
  }

  let update_peak_bandwidth = function (inn, out) {
    let bandwidth_peak_in = document.getElementById('bandwidth-peak-in')
    let bandwidth_peak_out = document.getElementById('bandwidth-peak-out')

    bandwidth_peak_in.innerHTML = format_speed(inn, 2)
    bandwidth_peak_out.innerHTML = format_speed(out, 2)
  }

  return {
    format_speed: format_speed,
    draw_chart_bandwidth_in: draw_chart_bandwidth_in,
    draw_chart_bandwidth_out: draw_chart_bandwidth_out,
    update_peak_bandwidth: update_peak_bandwidth
  }
})()

module.exports = bandwidth
