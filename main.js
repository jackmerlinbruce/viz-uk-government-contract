// const data = Array.from({ length: 300 }, () => {
//     return {
//         val: Math.floor(Math.random() * 30),
//         date: Math.floor(Math.random() * w)
//     }
// })

// function circles(data) {
//     svg.selectAll('.circ')
//         .data(data)
//         .enter()
//         .append('circle')
//         .attrs(propsCircle)
// }

// function tick() {
//     d3.selectAll('.circ')
//         .attr('cx', d => d.x)
//         .attr('cy', d => d.y)
// }

// function simulation(data) {
//     d3.forceSimulation(data)
//         .force('x', d3.forceX(d => d.publishedDate).strength(0.5))
//         .force('y', d3.forceY(h / 2).strength(0.5))
//         .force('collide', d3.forceCollide(d => d.value + d.value / 7))
//         .alphaDecay(0.01)
//         .alpha(0.12)
//         .on('tick', tick)
// }

// circles(data)
// simulation()

d3.csv('./notices(1).csv', data => {
    data.forEach(d => {
        d.value = +d.value
        d.publishedDate = d3.isoParse(d.publishedDate)
    })

    rExtent = d3.extent(data.map(d => d.value))
    xExtent = d3.extent(data.map(d => d.publishedDate))
    yearsInData = new Date(xExtent[1] - xExtent[0]).getFullYear() - 1970

    // each window.innerWidth = one year of data
    const [w, h] = [window.innerWidth * yearsInData, window.innerHeight]
    years = Array.from({ length: yearsInData }, () => 0).map(
        (d, i) => i * window.innerWidth
    )

    const svg = d3
        .select('body')
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

    propsCircle = {
        class: 'circ',
        r: d => r(d.value),
        cx: d => x(d.publishedDate),
        cy: h / 2,
        fill: 'black',
        opacity: 0.2
    }

    propsLine = {
        class: 'line',
        x1: d => d,
        x2: d => d,
        y1: 0,
        y2: h,
        stroke: 'black',
        'stroke-width': '2',
        opacity: 0.2
    }

    circles = svg
        .selectAll('.circ')
        .data(data)
        .enter()
        .append('circle')
        .attrs(propsCircle)

    circles.on('mouseover', d => {
        console.log(d['orgName'], d.value, d.publishedDate)
    })

    function tick() {
        d3.selectAll('.circ')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    }

    simulation = d3
        .forceSimulation(data)
        .force('x', d3.forceX(d => x(d.publishedDate)).strength(0.5))
        .force('y', d3.forceY(h / 2).strength(0.5))
        .force('collide', d3.forceCollide(d => r(d.value) + r(d.value) / 7))
        .alphaDecay(0.01)
        .alpha(0.12)
        .on('tick', tick)

    lines = svg
        .selectAll('.line')
        .data(years)
        .enter()
        .append('line')
        .attrs(propsLine)
})
