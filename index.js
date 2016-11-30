var finder = new PF.AStarFinder( {allowDiagonal: false});
var Map = function(c){
	this.id = '#map';
	this.char = c;
	this.tiles=[
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[2],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[2],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]]
	];
	this.init = function(){
		$(this.id).css('width',(this.tiles[0].length*12)+'px');
		for (var i = 0; i < this.tiles.length; i++) {
			$(this.id).append('<div id="Y'+i+'"></div>');
			for (var e = 0; e < this.tiles.length; e++) {
				var classes = tileType[this.tiles[i][e][0]];
				if (this.tiles[i][e][0] === 1){
					this.char.pos = {x:e,y:i};
					this.char.view = {found:true,x:e,y:i+1};
				}
				if (this.char.view.found && e === this.char.view.x && i === this.char.view.y) {
					classes += ' viewpoint';
				}
				$('#Y'+i).append('<div id="X'+e+'" class="tile '+classes+'"></div>');
			}
		}
	};
	this.toogleTile = function(t,p,a){
		if (a===0){
			$('#Y'+p.y+' #X'+ p.x).removeClass(tileType[t]);
		}else{
			$('#Y'+p.y+' #X'+ p.x).addClass(tileType[t]);	
		}
	};
};
var Character = function(){
	this.tile = 1;
	this.life = 100;
	this.speed = 100;
	this.inventory = {};
	this.pos = {x:0,y:0};
	this.view = {x:0,y:0};
	this.walk = function(oX,oY){
		var nX = this.pos.x + oX;
		var nY = this.pos.y + oY;
		if (nX >= 0 && nY >= 0 && nX <= map.tiles[0].length-1 && nY <= map.tiles.length-1 && map.tiles[nY][nX][0] === 0 ) {
			map.toogleTile(this.tile, this.pos,0);
			map.toogleTile('vp', this.view,0);
			this.pos = {x:nX,y:nY};
			this.view = {x:nX,y:nY};
			map.toogleTile(this.tile, this.pos,1);
			map.toogleTile('vp', this.view,1);
		}
	};
	this.move = function(x,y){
		map.toogleTile(this.tile, this.pos,0);
		this.pos = {x:x,y:y};
		map.toogleTile(this.tile, this.pos,1);
	};
	this.addToInventory = function(o){

	};
};
var tileType = {
	0: 'empty',
	1: 'char',
	vp: 'viewpoint',
	2: 'tree',
	3: 'water',
	4: 'rock'
};
function tilesToGrid(){
	var grid = [];
	for (var i = 0; i < map.tiles.length; i++) {
		grid.push([]);
		for (var e = 0; e < map.tiles[i].length; e++) {
			grid[i].push(map.tiles[i][e][0] === 0 ? 0 : 1);		
		}
	}
	return new PF.Grid(grid);
}
var char,map;
var timeouts = [];
function stopTimeouts(){
	for (var i = 0; i < timeouts.length; i++) {
		clearTimeout(timeouts[i]);
	}
}
$(function(){
	char = new Character();
	map = new Map(char);
	map.init();
	$('.tile').click(function(){
		stopTimeouts();
		$('.viewpoint').removeClass('viewpoint');
		var y = parseInt(this.parentElement.id.replace('Y',''));
		var x = parseInt(this.id.replace('X',''));
		var grid = tilesToGrid();
		var path = finder.findPath(char.pos.x, char.pos.y, x, y, grid);
		for (var i = 0; i < path.length; i++) {
			var xm = path[i][0];
			var ym = path[i][1];
			$('#Y'+ym+' #X'+xm).addClass('viewpoint');
			timeouts.push(setTimeout(function(o){
							char.move(o[0],o[1]);
						},150*i,[xm,ym]));
		}
	});
});

var arrow = {37: {code:37 ,name:'left',offset:[-1,0]}, 38: {code:38 ,name:'up',offset:[0,-1]}, 39: {code:39 ,name:'right',offset:[1,0]}, 40: {code:40 ,name:'down',offset:[0,1]} };
$(document).keydown(function(e){
    var k = e.keyCode || e.which;
    if(arrow[k])
    if (k == arrow[k].code || k == arrow[k].code || k == arrow[k].code || k == arrow[k].code) { 
       char.walk(arrow[k].offset[0],arrow[k].offset[1]);
    }
});
