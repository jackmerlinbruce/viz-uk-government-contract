const [w, h] = [window.innerWidth * 4, window.innerHeight]

const svg = d3
    .select('body')
    .append('svg')
    .attrs({ width: w, height: h })

const data = Array.from({ length: 300 }, () => {
    return {
        val: Math.floor(Math.random() * 30),
        date: Math.floor(Math.random() * w)
    }
})

const propsCircle = {
    class: 'circ',
    r: d => d.val,
    cx: d => d.date,
    cy: h / 2,
    fill: 'black',
    opacity: 0.2
}

const circles = svg
    .selectAll('.circ')
    .data(data)
    .enter()
    .append('circle')
    .attrs(propsCircle)

const tick = () => {
    d3.selectAll('.circ')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
}

const simulation = d3
    .forceSimulation(data)
    .force('x', d3.forceX(d => d.date).strength(0.5))
    .force('y', d3.forceY(h / 2).strength(0.5))
    .force('collide', d3.forceCollide(d => d.val + d.val / 7))
    .alphaDecay(0.01)
    .alpha(0.12)
    .on('tick', tick)

// const stopSimulation = setTimeout(() => simulation.alphaDecay(0.1), 5000)

// const gravitySimulation = d3
//     .forceSimulation(data)
//     .force(
//         'manyBody',
//         d3.forceManyBody().strength(d => {
//             gravity = d.val - d3.max(data.map(d => d.val))
//             return gravity
//         })
//     )
//     .force('center', d3.forceCenter(w / 2, h / 2))
//     .alphaDecay(0.01)
//     .alpha(0.12)
//     .on('tick', tick)
