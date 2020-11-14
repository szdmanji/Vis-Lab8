d3.csv('driving.csv', d3.autoType).then(data=>{
	console.log(data)
	const margin = {top: 20, right: 10, bottom: 30, left: 40};
	const width = 800 - margin.left - margin.right;
	const height = 720 - margin.top - margin.bottom;
	
	//create svg
	let svg = d3.select('body')
		.append('svg')
		.attr("viewBox", [0, 0, width + 100, height + 100])
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	//x + y scales
	const x = d3.scaleLinear()
		.domain(d3.extent(data, d => d.miles)).nice()
		.range([margin.left, width - margin.right])

	const y = d3.scaleLinear()
		.domain(d3.extent(data, d => d.gas)).nice()
		.range([height - margin.bottom, margin.top])
	
	//generate axes
	const xAxis = d3.axisBottom(x)
		.ticks(width/80)

	let yAxis = d3.axisLeft(y)
		.ticks(null, "$.2f")

	let xAxisGroup = svg
		.append("g")
		.call(xAxis)
		.attr("transform", `translate(0,${height - margin.bottom})`)
		
	let yAxisGroup = svg
		.append("g")
		.call(yAxis)
		.attr("transform", `translate(${margin.left},0)`)

	xAxisGroup.call(xAxis)
		.call(g => g.select(".domain").remove())
	xAxisGroup.selectAll(".tick line").clone()
		.attr("y2", -height)
		.attr("stroke-opacity", 0.1)
	xAxisGroup.call(g=>
		g.append("text")
		.attr("x", width - 4)
		.attr("y", -4)
		.attr("font-weight", "bold")
		.attr("text-anchor", "end")
		.attr("fill", "black")
		.text("Miles per person per year")
		.call(halo) // optional halo effect
	);

	yAxisGroup.call(yAxis)
		.call(g => g.select(".domain").remove())
	yAxisGroup.selectAll(".tick line").clone()
		.attr("x2", width)
		.attr("stroke-opacity", 0.1)
	yAxisGroup.call(g=>
		g.select(".tick:last-of-type text").clone()
		.attr("x",4)
		.attr("font-weight", "bold")
		.attr("text-anchor", "start")
		.attr("fill", "black")
		.text("Cost per year")
		.call(halo) // optional halo effect
	);


	//circles
	svg.append("g")
		.attr("fill", "white")
		.attr("stroke", "black")
		.attr("stroke-width", 2)
		.selectAll("circle")
		.data(data)
		.join("circle")
			.attr("cx", d => x(d.miles))
			.attr("cy", d => y(d.gas))
			.attr("r", 3);

	//labels
	const label = svg.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.selectAll("g")
		.data(data)
		.join("g")
			.attr("transform", d => `translate(${x(d.miles)},${y(d.gas)})`)
			.attr("opacity", 1);

	label.append("text")
		.text(d => d.year)
		.each(position)
		.call(halo);

	//line
	let line = d3.line()
		.x(d => x(d.miles))
		.y(d => y(d.gas))

	svg.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "green")
		.attr("stroke-width", 2.25)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-dasharray", `0,${length(line(data))}`)
		.attr("d", line)
		.transition()
			.duration(1000)
			.ease(d3.easeLinear)
			.attr("stroke-dasharray", `${length(line(data))},${length(line(data))}`);


	//functions
	function position(d) {
		const t = d3.select(this);
		switch (d.side) {
			case "top":
				t.attr("text-anchor", "middle").attr("dy", "-0.7em");
				break;
			case "right":
				t.attr("dx", "0.5em")
					.attr("dy", "0.32em")
					.attr("text-anchor", "start");
				break;
			case "bottom":
				t.attr("text-anchor", "middle").attr("dy", "1.4em");
				break;
			case "left":
				t.attr("dx", "-0.5em")
					.attr("dy", "0.32em")
					.attr("text-anchor", "end");
				break;
						}}
	
	function halo(text) {
		text
			.select(function() {
				return this.parentNode.insertBefore(this.cloneNode(true), this);
			})
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-width", 4)
			.attr("stroke-linejoin", "round");
	}

	function length(path) {
		return d3.create("svg:path").attr("d", path).node().getTotalLength();
	}
});