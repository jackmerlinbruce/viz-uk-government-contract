String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase()
    })
}

d3.csv('./contracts-over-100m.csv', data => {
    data.map(d => {
        d['Awarded Value'] = +d['Awarded Value']
        d['Published Date'] = d3.isoParse(d['Published Date'])
    })

    data = data.filter(d => {
        cond1 = d['Awarded Value'] > 0
        cond2 = d['Published Date'] > new Date(2015, 1, 1)
        return cond1 && cond2
    })

    rExtent = d3.extent(data.map(d => d['Awarded Value']))
    xExtent = d3.extent(data.map(d => d['Published Date']))

    firstYear = new Date(xExtent[0].getFullYear(), 1, 1)
    lastYear = new Date(xExtent[1].getFullYear(), 12, 31)
    xExtent = [firstYear, lastYear]
    nYearsInData = new Date(xExtent[1] - xExtent[0]).getFullYear() - 1970

    // each window.innerWidth = one year of data
    const [w, h] = [window.innerWidth * nYearsInData, window.innerHeight]
    years = Array.from({ length: nYearsInData }, () => 0).map((d, i) => {
        return {
            pos: i * window.innerWidth,
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
        .range([1, h / 5])

    x = d3
        .scaleLinear()
        .domain(xExtent)
        .range([0, w])

    o = d3
        .scaleLinear()
        .domain(rExtent)
        .range([0.2, 1])

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
        width: window.innerWidth,
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
        .text(d => d.year.getFullYear())
        .attrs(propsYears)

    circles = svg
        .selectAll('.circ')
        .data(data)
        .enter()
        .append('circle')
        .attrs(propsCircle)
        .on('mouseover', handleMousover)
        .on('mouseout', handleMouseout)

    circleText = svg
        .selectAll('.circText')
        .data(data)
        .enter()
        .append('text')
        .attrs(propsCircleText)
        .text(d => {
            if (d['Awarded Value'] >= 5000000000) {
                return formatValue(d['Awarded Value'])
            }
        })

    function formatValue(value) {
        return '£' + (value / 1000000000).toLocaleString('en') + ' bn'
    }

    function handleMousover(d, i) {
        name = d['Organisation Name'].toLowerCase().capitalize()
        value = formatValue(d['Awarded Value'])
        date = d3.timeFormat('%d %B %Y')(d['Published Date'])
        url = d['Links']

        texts = [name, value, date]

        texts.map((text, i) => {
            svg.append('text')
                .attrs({
                    class: 'tooltip',
                    id: i === 0 ? 'orgName' : i === 1 ? 'value' : '',
                    x: this.getAttribute('cx'),
                    y: h / 6 + i * 20,
                    'text-anchor': 'middle',
                    fill: '#626a6e'
                })
                .text(text)
        })
    }

    function handleMouseout(d, i) {
        d3.selectAll('.tooltip').remove()
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
})
