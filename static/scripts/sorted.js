$(document).ready(function(){
	console.log('this is here');
	global_force = null;
	track_submit();
});

function track_submit(){
	$('#target_country').on('change', function(){
		//empty the div
		$('#viz').empty();
		$('#grouping').hide();

		var target_country = this.value;
		var obj_ = {'team': target_country};
		console.log('selected target is', obj_);
		fetch_data(obj_);
	});
}

function fetch_data(obj_){
	$.ajax({url: '/get_team/',
		type:'GET',
		data: obj_,
		success: function(resp){
			resp = JSON.parse(resp);
		 	console.log(resp);
		 	draw_options(resp);
		}
	});
}

function draw_options(data){
	$('#opponent_country').empty().append("<option id='null' value='null'></option>");
	for(each in data){
		$('#opponent_country').append("<option id="+each+" value='"+each+"'>"+each+"</option>");
	}

	$('#opponent_country').on('change', function(){
		var opponent_country = this.value;
		var data_ = data[opponent_country];
		draw_data(data_);
	});
}

/**
* Creates k chunks of years (max k = 10 and min is either 4 or the number of years if < 4)
*/
function year_grouping_map(years){
	var years_obj = {};
	var distinct_years = {};
	var colors = d3.scale.category20();

	var k;
	var max_n_years = 10;
	var min_n_years = 4;
	years = years.sort();
	if (years.length < max_n_years*2){
		if (years.length < min_n_years){
			k = years.length
		}
		else{
			k = min_n_years;
		}
	}
	else{
		k = max_n_years;
	}
	var n = Math.floor(years.length/k);
	for (var i=0; i<years.length; i++){
		var year = years[i];
		if (i % n == 0){
			var val_ = years[i]+'-'+(!years[i+n] ? years[i] : years[i+n]);
			var key_ = year;
			years_obj[key_] = val_;	
		}
		else{
			years_obj[year] = val_;	
		}
		distinct_years[val_] = colors(val_);
	}
	return {map: years_obj, keys: Object.keys(distinct_years), colors: distinct_years};
}

function locations_colors(locations){
	var loc_cols = {};
	var col_obj =  d3.scale.category10();
	for (i in locations){
		loc_cols[locations[i]] = col_obj(locations[i]); 
	}
	return loc_cols;
}

function draw_data(data_){
	var viz_div = '#viz';
	$(viz_div).empty();

	//setting the groupings bg color just in case the page is not loaded again
	$('.group').css('background-color', 'whitesmoke');

	if(global_force){
		global_force.stop();
	}

	var width = window.innerWidth;
	var height = window.innerHeight - ((window.innerHeight/100) * 10);
	var padding = 0;
	var n_items = 0;
	var year_groups = [];
	var locations = [];
	for (m_t in data_){
		n_items += data_[m_t].length;
		for (mt in data_[m_t]){
			year_groups.push(data_[m_t][mt].year);
			locations.push(data_[m_t][mt].location_c);

		}
	}
	
	//getting years objects, which gives max 10 chunks for the years played
	var years_obj = year_grouping_map(year_groups);
	var years_map = years_obj.map;
	var years_keys = years_obj.keys;
	var years_colors = years_obj.colors;

	//colors the countries
	loc_cols = locations_colors(locations);

	//constructing the nodes
	var nodes = [];
	for (key in data_){
		for (match in data_[key]){
			nodes.push({
				match_type: key,
				result: data_[key][match].result,
				month: data_[key][match].month,
				year: data_[key][match].year,
				year_group: years_map[data_[key][match].year],
				toss: data_[key][match].toss,
				location: data_[key][match].location,
				location_c: data_[key][match].location_c,
				color: 'gray',//colors[key],
				radius: 9,
				cx: width/2,
				cy: height/2
			});
		}
	}

	//grouping scales
	var scales = {
					all: {},
					match_type: {
									nodes_scale : d3.scale.ordinal().domain(['ODI', 'T20I', 'Test']).rangePoints([width*0.2, width*0.75]),
									text_scale: d3.scale.ordinal().domain(['ODI', 'T20I', 'Test']).rangePoints([width*0.7, width*0.8, width*0.9]),
									circle_scale: d3.scale.ordinal().domain(['ODI', 'T20I', 'Test']).rangePoints([width*0.69, width*0.79, width*0.89], 0.001),
									tick_items: ['ODI', 'T20I', 'Test'],
									circle_colors: {'ODI': '#1E8BC3', 'T20I': '#1BBC9B', 'Test': '#E74C3C'},
								},
					result: 	{
									nodes_scale: d3.scale.ordinal().domain(['won', 'lost', 'draw', 'aban', 'tied', 'n/r']).rangePoints([width*0.2, width*0.8]),
									text_scale: d3.scale.ordinal().domain(['won', 'lost', 'draw', 'aban', 'tied', 'n/r']).rangePoints([width*0.6, width*0.8]),
									circle_scale: d3.scale.ordinal().domain(['won', 'lost', 'draw', 'aban', 'tied', 'n/r']).rangePoints([width*0.4, width*0.8], 0.001),
									tick_items: ['won', 'lost', 'draw', 'aban', 'tied', 'n/r'],
									circle_colors: {'won': '#26A65B', 'lost': '#F5D76E', 'draw': '#E26A6A', 'aban': '#F89406', 'tied': '#6C7A89', 'n/r': '#674172'},
								},
					month: 		{
									nodes_scale: d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']).rangePoints([width*0.2, width*0.8]),
									text_scale: d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']).rangePoints([width*0.1, width*0.9]),
									circle_scale: d3.scale.ordinal().domain(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']).rangePoints([width*0.4, width*0.9], 0.001),
									tick_items: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
									circle_colors: {'Jan': '#2ecc71', 'Feb': '#9b59b6', 'Mar': '#16a085', 'Apr': '#2980b9', 'May': 'teal', 'Jun': '#e67e22', 'Jul': '#f39c12', 'Aug': '#c0392b', 'Sep': '#bdc3c7', 'Oct': '#7f8c8d', 'Nov': 'red', 'Dec': 'cornflowerblue'},
								},
					year_group: {
									nodes_scale: d3.scale.ordinal().domain(years_keys).rangePoints([width*0.2, width*0.8]),
									text_scale: d3.scale.ordinal().domain(years_keys).rangePoints([0, width*0.95], 1),
									circle_scale: d3.scale.ordinal().domain(years_keys).rangePoints([0, width*0.95], 1),
									tick_items: years_keys,
									circle_colors: years_colors						
								},
					toss: 		{	
									nodes_scale : d3.scale.ordinal().domain(['won', '-', 'lost']).rangePoints([width*0.2, width*0.75]),
									text_scale: d3.scale.ordinal().domain(['won', '-', 'lost']).rangePoints([width*0.7, width*0.8, width*0.9]),
									circle_scale: d3.scale.ordinal().domain(['won', '-', 'lost']).rangePoints([width*0.69, width*0.79, width*0.89], 0.001),
									tick_items: ['won', '-', 'lost'],
									circle_colors: {'won': '#1E824C', '-': '#F89406', 'lost': '#D35400'}
								},
					location_c: {
									nodes_scale: d3.scale.ordinal().domain(locations).rangePoints([width*0.2, width*0.9]),
									text_scale: d3.scale.ordinal().domain(locations).rangePoints([0, width*0.9], 1),
									circle_scale: d3.scale.ordinal().domain(locations).rangePoints([0, width*0.9], 1),
									tick_items: locations,
									circle_colors: loc_cols,						
								},

				};

	//tooltip
	var tooltip = d3.select(viz_div).append("div").attr("class", "tooltip").style("opacity", 0);

	//constructing the svg
	var svg = d3.select(viz_div).append('svg').attr('width', width).attr('height', height);

	//creating the force object
	var force = d3.layout.force()
				.nodes(nodes)
				.size([width, height])
				.gravity(0)
				.on("tick", tick)
				.start();

	global_force = force;

	//constructing the circle
	var node = svg.selectAll('.node').data(nodes)
              .enter().append("g")
              .attr("class", "node")
              .call(force.drag);

    node.append("circle")
    	.style("fill", function(d) { return d.color; })
    	.attr("r", function(d) { return d.radius; })
    	.on("mouseover", function(d) {
        	tooltip.transition().duration(50).style("opacity", 0.9);
        	var ttip_html = "<div class='ttip_row'>MATCH TYPE: "+d.match_type+" </div>";
        	ttip_html += "<div class='ttip_row'>RESULT: "+d.result+" </div>";
        	ttip_html += "<div class='ttip_row'>MONTH: "+d.month+" </div>"; 
        	ttip_html += "<div class='ttip_row'>YEAR: "+d.year+" </div>";
        	ttip_html += "<div class='ttip_row'>LOCATION: "+d.location+', '+d.location_c+"</div>";
        	ttip_html += "<div class='ttip_row'>TOSS: "+d.toss+"</div>";

        	tooltip.html(ttip_html).style("left", (d3.event.pageX + 5) + "px").style("top", (d3.event.pageY - 28) + "px");
   	 	})
    	.on("mouseout", function(d) {
        	tooltip.transition().duration(50).style("opacity", 0);
    	});

    //adding legend for no grouping
    svg.append('text')
    	.attr('class', 'tick')
    	.attr('x', width * 0.8)
    	.attr('y', 10)
    	.style('fill', 'gray')
    	.style("text-decoration", "underline")
    	.text('ALL MATCHES ['+nodes.length+']');

    //adding credits
    svg.append('text')
    	.attr('class', 'tick')
    	.attr('x', width * 0.75)
    	.attr('y', height * 0.9)
    	.style('fill', 'gray')
    	.style('font-size', '11px')
    	.text('Data extracted from ESPNCricinfo.com (2015)');

  	function tick(e) {
  		node
     		.each(gravity(0.15 * e.alpha))
      		.each(collide(0.65))
      		.attr("cx", function(d) { return d.x; })
      		.attr("cy", function(d) { return d.y; })
      		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	}

	function gravity(alpha) {
		return function(d) {
			d.y += (d.cy - d.y) * alpha; 
			d.x += (d.cx - d.x)  * alpha;
		};
	}

	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(nodes);
	    return function(d) {
	      var r = d.radius + padding,
	          nx1 = d.x - r,
	          nx2 = d.x + r,
	          ny1 = d.y - r,
	          ny2 = d.y + r;
	      quadtree.visit(function(quad, x1, y1, x2, y2) {
	        if (quad.point && (quad.point !== d)) {
	          var x = d.x - quad.point.x,
	              y = d.y - quad.point.y,
	              l = Math.sqrt(x * x + y * y),
	              r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding ;
	          if (l < r) {
	            l = (l - r) / l * alpha;
	            d.x -= x *= l;
	            d.y -= y *= l;
	            quad.point.x += x;
	            quad.point.y += y;
	          }
	        }
	        force.resume();
	        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	      });
	    };
	}

	$('#grouping').css('display', 'inline');
	$('.group').unbind('click').bind('click', function(){
		$('.group').css('background-color', 'whitesmoke');
		$('#viz').hide();
		$('#load').show();
		var group_id = this.id;
		$('#'+group_id).css('background-color', 'springgreen');
		if (group_id == 'all'){
			regroup();
			return;
		}
		var nodes_scale = scales[group_id].nodes_scale;
		var text_scale = scales[group_id].text_scale;
		var tick_items = scales[group_id].tick_items;
		var circle_scale = scales[group_id].circle_scale;
		var circle_colors = scales[group_id].circle_colors;
		grouping_method(svg, text_scale, circle_scale, circle_colors, nodes_scale, tick_items, group_id);
	});

	function grouping_method(svg, text_scale, circle_scale, circle_colors, node_scale, tick_items, key_){
		$('.tick').remove();
		for (each in tick_items){
			var group_ = d3.selectAll(".node").filter(function(d){ return eval('d.'+key_) == tick_items[each]; });
			svg.append('text').attr('class', 'tick').attr('x', circle_scale(tick_items[each]) ).attr('y', 20).style('fill', circle_colors[tick_items[each]]).style("text-decoration", "underline").text(tick_items[each].toUpperCase() + '['+group_[0].length+']');
			group_.transition().duration(100).attr('cx', function(d){ d.cx = node_scale(tick_items[each]) ; }).selectAll('circle').style('fill', circle_colors[tick_items[each]]);
		}
		//tick({type: "tick", alpha: 0.8});
		$('#load').hide();
		$('#viz').show();
	}

	function regroup(){
		$('.tick').remove();
		var group_ = d3.selectAll(".node").filter(function(d){ return d; });
		group_.transition().duration(2000).attr('cx', function(d){ d.cx = width/2 }).selectAll('circle').style('fill', 'lightgray');
		svg.append('text')
    	.attr('class', 'tick')
    	.attr('x', width*0.8 )
    	.attr('y', 10)
    	.style('fill', 'gray')
    	.style("text-decoration", "underline")
    	.text('ALL MATCHES ['+group_[0].length+']');
    	$('#load').hide();
		$('#viz').show();
	}
}