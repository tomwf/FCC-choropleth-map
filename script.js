function color(bachelor) {
  if (bachelor < PERCENT[0]) {
    return COLORS[0]
  } else if (bachelor < PERCENT[1]) {
    return COLORS[1]
  } else if (bachelor < PERCENT[2]) {
    return COLORS[2]
  } else if (bachelor < PERCENT[3]) {
    return COLORS[3]
  } else if (bachelor < PERCENT[4]) {
    return COLORS[4]
  } else if (bachelor < PERCENT[5]) {
    return COLORS[5]
  } else {
    return COLORS[6]
  }
}

function showTooltip(event, data) {

  // Prepare data
  const fips = event.target.attributes['data-fips'].value
  const x = event.pageX
  const y = event.pageY
  const county = data.filter(data => data.fips == fips)[0]
  const name = county.area_name
  const state = county.state
  const bachelor = county.bachelorsOrHigher

  // Create tooltip
  const tooltip = chart.append('div')
    .attr('id', 'tooltip')
    .attr('data-education', bachelor)
    .style('left', `${x}px`)
    .style('top', `${y}px`)


  // Add text
  tooltip
    .append('text')
    .text(`${name}, ${state}: ${bachelor}%`)
}

function hideTooltip() {
  d3.select('#tooltip').remove()
}

// Initialization
const width = '960'
const height = '600'
const body = d3.select('body')
const PERCENT = [3, 12, 21, 30, 39, 48, 57, 66]
const COLORS = [
  '#e5f5e0',
  '#c7e9c0',
  '#a1d99b',
  '#74c476',
  '#41ab5d',
  '#238b45',
  '#006d2c'
]

// Add title
body.append('h1')
  .attr('id', 'title')
  .text('United States Educational Attainment')

// Add description
body.append('p')
  .attr('id', 'description')
  .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)')

// Create chart
const chart = body.append('div')
  .attr('id', 'chart')

// Create chart
const svg = chart.append('svg')
  .attr('viewBox', [0, 0, 960, 600])
  .attr('width', width)
  .attr('height', height)

// Fetch data
const educationUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'
const countryUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
const educationJson = d3.json(educationUrl)
const countryJson = d3.json(countryUrl)

// Start fetching
Promise.all([educationJson, countryJson])
  .then(([educationData, countryData]) => {

    // Draw map
    const path = d3.geoPath()
    const mapData = topojson.feature(countryData, countryData.objects.counties).features
    // console.log(mapData)
    svg.append('g')
      .selectAll('path')
      .data(mapData)
      .enter()
      .append('path')
      .attr('class', 'county')
    // Draw each county
      .attr('d', path)
    // Set the color of each country
      .attr('fill', (_, i) => color(educationData[i].bachelorsOrHigher))
      .attr('data-fips', (_, i) => educationData[i].fips)
      .attr('data-education', (_, i) => educationData[i].bachelorsOrHigher)
      .on('mouseover', (event) => {
        showTooltip(event, educationData)
      })
      .on('mouseleave', hideTooltip)

    // Add legend
    const rectWidth = 32
    const rectHeight = 8
    const legendX = 600
    const legendY = 50
    const legend = svg.append('g')
      .attr('id', 'legend')

    // Add legend colors
    legend.selectAll('rect')
      .data(COLORS)
      .enter()
      .append('rect')
      .attr('x', (_, i) => 32 * i + legendX)
      .attr('y', legendY)
      .attr('width',rectWidth)
      .attr('height',rectHeight)
      .attr('fill', (_, i) => COLORS[i])

    // Add legend ticks
    legend.selectAll('line')
      .data(PERCENT)
      .enter()
      .append('line')
      .attr('x1', (_, i) => rectWidth * i + legendX)
      .attr('y1', legendY)
      .attr('x2', (_, i) => rectWidth * i + legendX)
      .attr('y2', legendY + 12)
      .style('stroke', 'black')
      .style('stroke-width', '1')

    // Add legend text
    legend.selectAll('text')
      .data(PERCENT)
      .enter()
      .append('text')
      .attr('x', (_, i) => rectWidth * i + legendX)
      .attr('y', legendY + 22)
      .style('text-anchor', 'middle')
      .style('font-size', '.65rem')
      .text((_, i) => `${PERCENT[i]}%`)
  })
