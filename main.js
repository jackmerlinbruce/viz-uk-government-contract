String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase()
    })
}

const MAX_VALUE = 67000000000

const dataChooser = document.getElementById('choose-data')
const chart = document.querySelector('.chart')

d3.csv(dataChooser.value, data => render(data))

dataChooser.addEventListener('change', e => {
    chart.innerHTML = ''
    d3.csv(dataChooser.value, data => render(data))
})

function render(data) {
    data.map(d => {
        d['Awarded Value'] = +d['Awarded Value']
        d['Published Date'] = d3.isoParse(d['Published Date'])
    })

    data = data.filter(d => {
        cond1 = d['Awarded Value'] > 0
        cond2 = d['Published Date'] > new Date(2015, 1, 1)
        return cond1 && cond2
    })

    rExtent = [d3.min(data.map(d => d['Awarded Value'])), MAX_VALUE]
    xExtent = d3.extent(data.map(d => d['Published Date']))

    firstYear = new Date(xExtent[0].getFullYear(), 1, 1)
    lastYear = new Date(xExtent[1].getFullYear(), 12, 31)
    xExtent = [firstYear, lastYear]
    nYearsInData = new Date(xExtent[1] - xExtent[0]).getFullYear() - 1970

    // each window.innerWidth = one year of data
    const [w, h] = [window.innerWidth * 2 * nYearsInData, window.innerHeight]
    years = Array.from({ length: nYearsInData }, () => 0).map((d, i) => {
        return {
            pos: i * window.innerWidth * 2,
            year: new Date(firstYear.getFullYear() + i, 1, 1)
        }
    })

    const svg = d3
        .select('.chart')
        .append('svg')
        .attrs({ width: w, height: h })

    r = d3
        .scaleSqrt()
        .domain(rExtent)
        .range([1, h / 2])

    x = d3
        .scaleLinear()
        .domain(xExtent)
        .range([0, w])

    o = d3
        .scaleLinear()
        .domain(rExtent)
        .range([0.8, 0.8])

    c = d3
        .scaleLinear()
        .domain(xExtent)
        .range(['white', '#d3d8db'])

    propsCircle = {
        class: 'circ',
        r: d => r(d['Awarded Value']),
        cx: d => x(d['Published Date']),
        cy: h / 2,
        fill: '#1d70b8',
        opacity: d => o(d['Awarded Value'])
    }

    propsCircleText = {
        class: 'circText',
        x: d => x(d['Published Date']),
        y: h / 2,
        fill: 'white',
        'font-weight': 900,
        'text-anchor': 'middle',
        'alignment-baseline': 'middle',
        'pointer-events': 'none'
    }

    propsLine = {
        class: 'line',
        x1: d => d.pos,
        x2: d => d.pos,
        y1: 0,
        y2: h,
        stroke: 'black',
        'stroke-width': '2'
    }

    propsRect = {
        class: 'rect',
        x: d => d.pos,
        y: 0,
        width: window.innerWidth * 2,
        height: h,
        fill: d => c(d.year)
    }

    propsYears = {
        class: 'year',
        x: d => d.pos + 20,
        y: h - 20,
        'font-size': '500%',
        fill: '#626a6e'
    }

    lines = svg
        .selectAll('.line')
        .data(years)
        .enter()
        .append('line')
        .attrs(propsLine)

    rects = svg
        .selectAll('.rect')
        .data(years)
        .enter()
        .append('rect')
        .attrs(propsRect)

    years = svg
        .selectAll('.yearText')
        .data(years)
        .enter()
        .append('text')
        .text(d => d.year.getFullYear() + ' →')
        .attrs(propsYears)

    circles = svg
        .selectAll('.circ')
        .data(data)
        .enter()
        .append('circle')
        .attrs(propsCircle)
        .on('mouseover', handleMousover)
        .on('mouseout', handleMouseout)
        .on('touchstart', handleMousover)
        .on('touchend', handleMouseout)
        .on('click', handleClick)

    circleText = svg
        .selectAll('.circText')
        .data(data)
        .enter()
        .append('text')
        .attrs(propsCircleText)
        .text(d => {
            if (r(d['Awarded Value']) >= 40) {
                return formatValue(d['Awarded Value'])
            }
        })

    function formatValue(value) {
        return '£' + (value / 1000000000).toLocaleString('en') + ' bn'
    }

    function handleMousover(d, i) {
        name = d['Organisation Name']
            .toLowerCase()
            .capitalize()
            .replace(/ *\([^)]*\) */g, '')
        value = formatValue(d['Awarded Value'])
        date = d3.timeFormat('%d %B %Y')(d['Published Date'])
        desc = d['Title'].replace(/ *\([^)]*\) */g, '')

        texts = [value, name, desc, date]

        texts.map((text, i) => {
            svg.append('text')
                .attrs({
                    class: 'tooltip',
                    id: i === 0 ? 'value' : i === 1 ? 'orgName' : '',
                    x: this.getAttribute('cx'),
                    y: h - h / 5 + i * 20,
                    'text-anchor': 'middle',
                    fill: '#0b0c0c'
                })
                .text(text)
            // svg.append('line').attrs({
            //     class: 'tooltip',
            //     x1: this.getAttribute('cx'),
            //     x2: this.getAttribute('cx'),
            //     y1: +this.getAttribute('cy') + 5,
            //     y2: h - h / 5 - texts.length - 1 * 20,
            //     stroke: '#1d70b8',
            //     'stroke-width': 2
            // })
        })
    }

    function handleMouseout(d, i) {
        d3.selectAll('.tooltip').remove()
    }

    function handleClick(d, i) {
        // if (d['Links']) window.open(d['Links'])
    }

    function tick() {
        d3.selectAll('.circ')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
        d3.selectAll('.circText')
            .attr('x', d => d.x)
            .attr('y', d => d.y + 5)
    }

    simulation = d3
        .forceSimulation(data)
        .force('x', d3.forceX(d => x(d['Published Date'])).strength(0.5))
        .force('y', d3.forceY(h / 2).strength(0.5))
        .force(
            'collide',
            d3.forceCollide(
                d => r(d['Awarded Value']) + r(d['Awarded Value']) / 7
            )
        )
        .alphaDecay(0.01)
        .alpha(0.12)
        .on('tick', tick)

    end = svg
        .append('text')
        .text('Most people who scrolled this far followed me at')
        .attrs({
            x: w - window.innerWidth / 2,
            y: h / 2,
            'text-anchor': 'middle'
        })
    end = svg
        .append('text')
        .text('@JackMerlinBruce')
        .attrs({
            class: 'end',
            x: w - window.innerWidth / 2,
            y: h / 2 + 25,
            'text-anchor': 'middle'
        })
        .on('click', () => window.open('https://twitter.com/jackmerlinbruce'))
}
