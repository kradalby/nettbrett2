'use strict'

var bandwidth = (function () {

    var chart_options = {
        pieHole: 0.7,
        backgroundColor: "#efefef",
        chartArea: {'width': '85%', 'height': '80%'},

        pieSliceText: 'none',
        pieSliceBorderColor: "black",
        tooltip: { trigger: 'none' },
        legend: 'none',
        slices: {
            0: { color: 'pink' },
            1: { color: 'transparent', }
        }
    }

    var create_chart_data = function (bits, max) {
        var data = [
            ["", ""]
        ]

        var used = (bits/max) * 100
        var unused = 100 - used

        data.push(["", used])
        data.push(["", unused])

        data = google.visualization.arrayToDataTable(data)
        return data
    }

    var format_speed = function (bits_per_second, decimals) {
        if (bits_per_second == 0) return '0 bit/s'
            var k = 1024
        var dm = decimals + 1 || 3
        var sizes = ['bit/s', 'Kbit/s', 'Mbit/s', 'Gbit/s', 'Tbit/s', 'Pbit/s', 'Ebit/s', 'Zbit/s', 'Ybit/s']
        var i = Math.floor(Math.log(bits_per_second) / Math.log(k))
        return (bits_per_second / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i]
    }

    var chart_bandwidth_in = new google.visualization.PieChart(document.getElementById('bandwidth-in-chart'))
    var chart_bandwidth_out = new google.visualization.PieChart(document.getElementById('bandwidth-out-chart'))

    var draw_chart_bandwidth_in = function (bits, max) {
        var chart_center_bandwidth_in = document.querySelector("#bandwidth-in-center")
        var data = create_chart_data(bits, max)

        chart_bandwidth_in.draw(data, chart_options)
        chart_center_bandwidth_in.innerHTML = format_speed(bits, 2)
    }

    var draw_chart_bandwidth_out = function (bits, max) {
        var chart_center_bandwidth_out = document.querySelector("#bandwidth-out-center")
        var data = create_chart_data(bits, max)

        chart_bandwidth_out.draw(data, chart_options)
        chart_center_bandwidth_out.innerHTML = format_speed(bits, 2)
    }

    var update_peak_bandwidth = function (inn, out) {
        var bandwidth_peak_in = document.querySelector("#bandwidth-peak-in")
        var bandwidth_peak_out = document.querySelector("#bandwidth-peak-out")

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
