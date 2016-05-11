'use strict'

let bandwidth = (function () {
  let chart_bandwidth_in = null
  let chart_bandwidth_out = null
  let current_data_in = null
  let current_data_out = null

  google.charts.setOnLoadCallback(draw_init_bandwidth_in_chart)
  function draw_init_bandwidth_in_chart () {
    chart_bandwidth_in = new google.visualization.PieChart(document.getElementById('bandwidth-in-chart'))

    current_data_in = create_chart_data(0, 100)
    chart_bandwidth_in.draw(current_data_in, chart_options)
  }

  google.charts.setOnLoadCallback(draw_init_bandwidth_out_chart)
  function draw_init_bandwidth_out_chart () {
    chart_bandwidth_out = new google.visualization.PieChart(document.getElementById('bandwidth-out-chart'))

    current_data_out = create_chart_data(0, 100)
    chart_bandwidth_out.draw(current_data_out, chart_options)
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

  let animate_transition = function (chart, current_data, new_data) {
    let current_usage = current_data.getValue(0, 1)
    let new_usage = new_data.getValue(0, 1)

    let start = 0
    let end = 0

    let counter = 0
    let render_steps = 100
    let render_time = 1000

    if (current_usage > new_usage) {
        // Animate from more to less
        for (let p = current_usage; p > new_usage; p -= ((current_usage-new_usage) / render_steps)) {
            setTimeout(() => {
                chart.draw(create_chart_data(p, 100 - p), chart_options)
            }, counter * render_time/render_steps)
            counter += 1
        }
    } else {
        // Animate from less to more
        for (let p = current_usage; p < new_usage; p += ((new_usage-current_usage) / render_steps)) {
            setTimeout(() => {
                chart.draw(create_chart_data(p, 100 - p), chart_options)
            }, counter * render_time/render_steps)
            counter += 1
        }
    }

    return new_data
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

    current_data_in = animate_transition(chart_bandwidth_in, current_data_in, data)
    chart_center_bandwidth_in.innerHTML = format_speed(bits, 2)
  }

  let draw_chart_bandwidth_out = function (bits, max) {
    let chart_center_bandwidth_out = document.getElementById('bandwidth-out-center')
    let data = create_chart_data(bits, max)

    current_data_out = animate_transition(chart_bandwidth_out, current_data_out, data)
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
