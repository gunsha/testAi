var finder = new PF.AStarFinder( {allowDiagonal: false});
var char,map;
var timeouts = [];
var arrow = {37: {code:37 ,name:'left',offset:[-1,0]}, 38: {code:38 ,name:'up',offset:[0,-1]}, 39: {code:39 ,name:'right',offset:[1,0]}, 40: {code:40 ,name:'down',offset:[0,1]} };
var tileType = {
	0: 'empty',
	1: 'char',
	vp: 'viewpoint',
	2: 'tree',
	3: 'water',
	4: 'rock',
	5: 'bridge'
};
var Map = function(c){
	this.id = '#map';
	this.char = c;
	this.tiles=[
		[[0],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[2],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[2],[2],[0],[0],[0],[0],[0],[3],[4],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[2]],
		[[2],[2],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[2]],
		[[2],[2],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[2]],
		[[2],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[2]],
		[[2],[0],[0],[0],[0],[0],[0],[3],[0],[1],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[3],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[4],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[4],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[2],[2]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[3],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[2]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[4],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[2]],
		[[0],[0],[0],[0],[0],[0],[0],[0],[4],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[2]]
	];
	this.init = function(){
		$(this.id).css('width',(this.tiles[0].length*12)+'px');
		for (var y = 0; y < this.tiles.length; y++) {
			$(this.id).append('<div id="Y'+y+'"></div>');
			for (var x = 0; x < this.tiles.length; x++) {
				var classes = tileType[this.tiles[y][x][0]];
				if (this.tiles[y][x][0] === 1){
					this.char.pos = {x:x,y:y};
					this.char.view = {found:true,x:x,y:y+1};
				} else if (this.tiles[y][x][0] === 2){
					this.tiles[y][x][1] = new Tree(x,y);
				} else if (this.tiles[y][x][0] === 3){
					this.tiles[y][x][1] = new Water(x,y);
				}
				if (this.char.view.found && x === this.char.view.x && y === this.char.view.y) {
					classes += ' viewpoint';
				}
				$('#Y'+y).append('<div id="X'+x+'" class="tile '+classes+'"></div>');
			}
		}
	};
	this.toogleTile = function(t,p,a){
		if (a===0){
			$('#Y'+p.y+' #X'+ p.x).removeClass(tileType[t]);
			if(t !== 'vp') this.tiles[p.y][p.x][0] = 0;
		}else{
			$('#Y'+p.y+' #X'+ p.x).addClass(tileType[t]);	
		}
	};
	this.moveTiles = function(t,o,n){
		this.tiles[o.y][o.x][0] = 0;
		this.tiles[n.y][n.x][0] = t;
	};
};

var Character = function(){
	this.tile = 1;
	this.life = 100;
	this.speed = 100;
	this.inventory = {};
	this.skills = {};
	this.pos = {x:0,y:0};
	this.view = {x:0,y:0};
	this.walk = function(oX,oY){
		var nX = this.pos.x + oX;
		var nY = this.pos.y + oY;
		map.toogleTile('vp', this.view,0);
		if (nX >= 0 && nY >= 0 && nX <= map.tiles[0].length-1 && nY <= map.tiles.length-1 && map.tiles[nY][nX][0] === 0 ) {
			map.toogleTile(this.tile, this.pos,0);
			map.moveTiles(this.tile,this.pos,{x:nX,y:nY});
			this.pos = {x:nX,y:nY};
			this.view = {x:nX+oX,y:nY+oY};
			map.toogleTile(this.tile, this.pos,1);
		}else{
			this.view = {x:nX,y:nY};
		}
		map.toogleTile('vp', this.view,1);
	};
	this.move = function(x,y){
		map.toogleTile(this.tile, this.pos,0);
		map.moveTiles(this.tile,this.pos,{x:x,y:y});
		map.toogleTile('vp', this.view,0);
		var dir = detectDirection(x,y);
		this.pos = {x:x,y:y};
		this.view = {x:x+dir[0],y:y+dir[1]};
		map.toogleTile('vp', this.view,1);
		map.toogleTile(this.tile, this.pos,1);
	};
	this.getObject = function(o,a){
		if(!a[o.name]){
			a[o.name] = o.amt;
		}else{
			a[o.name] += o.amt;
		}	
		console.log('gained '+o.amt+' '+o.name);
	};
	this.addToInventory = function(o){
		this.getObject(o,this.inventory);
	};
	this.skill = function(s){
		this.getObject(s,this.skills);
	};
	this.hasItem = function(o){
		return this.inventory[o.name] && this.inventory[o.name] >= o.amt;
	};
	this.spendItem = function(o){
		this.inventory[o.name] -= o.amt;
	};
};


var Tree = function(x,y){
	this.tile = 2;
	this.life = 100;
	this.respawn = 500;
	this.respawnCt = 0;
	this.skillGiven = {name:'woodchop',amt:0.1};
	this.item = {name:'wood',amt: 10 };
	this.pos = {x:x,y:y};
	this.action = function(){
		if(this.life !== 0){
			var cSkill = char.skills[this.skillGiven.name];
			this.life -= 10*(cSkill && cSkill>0 ? cSkill : 0.1);
			console.log('chopping wood-'+this.life);
			if(this.life <= 0){
				map.toogleTile(this.tile,this.pos,0);
				char.skill(this.skillGiven);
				this.item.amt -= this.respawnCt;
				char.addToInventory(this.item);
				this.respawn++;
				this.life = 0;
			}
		}
	};
};

var Water = function(x,y){
	this.tile = 2;
	this.pos = {x:x,y:y};
	this.hasBridge = false;
	this.build = function(){
		if(!this.hasBridge){
			var need = {name:'wood',amt: 60 };
		if(char.hasItem(need)){
			char.spendItem(need);
			map.toogleTile(this.tile,this.pos,0);
			map.toogleTile(5,this.pos,1);
			this.hasBridge = true;
			console.log('bridge builded!');
		}else{
			console.log('you need more wood!');
		}
		}
	};
};

function detectDirection(x,y){
	var o = char.pos;
	var xm = o.x < x;
	var ym = o.y < y;
	var xs = o.x == x;
	var ys = o.y == y;
	var dir = xm+''+ym+''+xs+''+ys;
	if ('falsefalsetruefalse' == dir){
		return [0,-1];
	}
	else if ('falsetruetruefalse' == dir){
		return [0,1];
	}
	else if ('falsefalsefalsetrue' == dir){
		return [-1,0];
	}
	else if ('truefalsefalsetrue' == dir){
		return [1,0];
	}
}
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
		$('.pathf').removeClass('pathf');
		var y = parseInt(this.parentElement.id.replace('Y',''));
		var x = parseInt(this.id.replace('X',''));
		var path = finder.findPath(char.pos.x, char.pos.y, x, y, tilesToGrid());
		for (var i = 1; i < path.length; i++) {
			var xm = path[i][0];
			var ym = path[i][1];
			$('#Y'+ym+' #X'+xm).addClass('pathf');
			timeouts.push(setTimeout(function(o){
							char.move(o[0],o[1]);
						},150*i,[xm,ym]));
		}
	});
});

$(document).keydown(function(e){
    var k = e.keyCode || e.which;
    if(arrow[k]){
        if (k >= 37 && 40 >= k) { 
           char.walk(arrow[k].offset[0],arrow[k].offset[1]);
        }
    }else{
    	var pos = $('.viewpoint');
    	var y = parseInt(pos[0].parentElement.id.replace('Y',''));
		var x = parseInt(pos[0].id.replace('X',''));
    	if(k === 65 && map.tiles[y][x][1]){
			map.tiles[y][x][1].action();
    	}else if(k === 66 && map.tiles[y][x][1]){
    		map.tiles[y][x][1].build();
    	}	
    }
    
});
