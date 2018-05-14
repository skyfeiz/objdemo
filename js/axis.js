this.FTKJ = this.FTKJ || {};
(function (){
	function Axis(json){
		this.dis = json.dis || 100;
		this.n = json.n || 10;
	}

	var p = Axis.prototype;

	p.getGroup = function() {
		var dis = this.dis;
		var n = this.n;
		var group = new THREE.Group();
		var sphereG = new THREE.SphereGeometry(this.dis/4,32,32);
		var sphereM = new THREE.MeshBasicMaterial({color:0xffffff*Math.random()});
		var sphere = new THREE.Mesh(sphereG,sphereM);
		group.add(sphere);
		group.add(this.createLine(0,0,-n*dis,0,0,n*dis));
		group.add(this.createLine(-n*dis,0,0,n*dis,0,0));
		for (var i = 1; i <= this.n; i++) {
			group.add(this.createLine(dis*i,0,-n*dis,dis*i,0,n*dis,i%5));
			group.add(this.createLine(-dis*i,0,-n*dis,-dis*i,0,n*dis,i%5));
			group.add(this.createLine(-n*dis,0,dis*i,n*dis,0,dis*i,i%5));
			group.add(this.createLine(-n*dis,0,-dis*i,n*dis,0,-dis*i,i%5));
		}
		return group;
	};

	p.createLine = function(x1,y1,z1,x2,y2,z2,is5){
		var g = new THREE.Geometry();
		g.vertices.push(
			new THREE.Vector3( x1, y1, z1 ),
			new THREE.Vector3( x2, y2, z2 )
		);
		let color = !!is5?0xffff00:0x222222;
		var m = new THREE.MeshBasicMaterial({color:color});
		return new THREE.Line(g,m);
	};
	FTKJ.Axis = Axis;
})();