// TODO:
// - add mobile
// - add continuous on-scroll counter

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase()
    })
}

function init() {
    const dataChooser = document.getElementById('choose-data')
    const chart = document.querySelector('.chart')

    d3.csv(dataChooser.value, data => render(data))

    dataChooser.addEventListener('change', e => {
        chart.innerHTML = ''
        d3.csv(dataChooser.value, data => render(data))
    })
}

window.onload = init
