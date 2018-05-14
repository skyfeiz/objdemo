/* globals shaders,TweenMax,Linear */

/**
 *
 */
this.FTKJ = this.FTKJ || {};
(function() {
	function Model(json) {
		FTKJ.ThreeBase.call(this, json.dom);
		this.init();
	}

	let p = Model.prototype = Object.create(FTKJ.ThreeBase.prototype);
	Model.prototype.constructor = Model;

	p.init = function() {
		this.canOrbit = true;

		// 加载预定的资源，加载后的资源会放在this.resourcesMap里面，通过id访问 
		// 当资源加载完成后会自动调用initObject3D方法。
		// mtl 类型，会加载两个文件，url+.mtl 和 url+.obj
		let array = [
			{id: 'spark', type: 'texture', url: './imgs/spark.png'},
			{id: 'smoke', type: 'texture', url: './imgs/smokeparticle.png'}, 
		];

		this.areaJson = {
			area1: ['tv', 'server', 'floor1', 'chair', 'pc1_01', 'desk', 'bigdesk'],
			area2: ['floor2', 'railing', 'railing01', 'chimney', 'chimney01', 'chimney02', 'tower', 'house', 'plc'],
			area3: ['note', 'floor3', 'pc01', 'pc02', 'pc3_01', 'pc3_02', /*'pc3_03',*/ 'phone', 'line1', 'singal', 'cylinder01', 'cylinder02',/* 'cylinder03',*/ 'ipad'],
			area4: ['floor4', 'pc4_01', 'server4_01', 'server4_02', 'chair4_01', 'desk4_01']
		};

		// {id:model,type:'mtl',url:'./obj/area1/model'}
		for (let key in this.areaJson) {
			for (let i = 0; i < this.areaJson[key].length; i++) {
				let name = this.areaJson[key][i];
				array.push({
					id: name,
					type: 'mtl',
					url: './obj/' + key + '/' + name
				});
			}
		}

		this.threeBaseInit(array);
		this.container = new THREE.Group();

		this.linkLineAry = []; // 保存所有实线的数组

		this.lineParticlesAry = []; // 保存每个连线所有粒子的数组

		this.wireframeArr = []; // 保存线框对象的数组

		this.autoTween = null;

		// pos 位置信息，相对于第一个模型的位置信息，不可用在世界坐标系
		// area3 服务器
		this.serverJson1 = {
			modelName: 'server4_01',
			pos: [
				[-1200, 0, 0,'area3_server_B2'],
				[-2400, 0, 0,'area3_server_B3']
			]
		};
		this.serverJson2 = {
			modelName: 'server4_02',
			pos: [
				[-1200, 0, 0,'area3_server_A2'],
				[-2400, 0, 0,'area3_server_A3']
			]
		};

		// area4 电脑
		this.pcJson3 = {
			modelName: 'pc02',
			pos: [
				[-450, 0, 0,'area4_pc_A1_2'],
				[-884, 0, 0,'area4_pc_A1_3'],

				[-40, 0, -430,'area4_pc_A1_4'],
				[-450, 0, -430,'area4_pc_A1_5'],
				[-884, 0, -430,'area4_pc_A1_6'],

				[-40, 0, -860,'area4_pc_A1_7'],
				[-450, 0, -860,'area4_pc_A1_8'],
				[-884, 0, -860,'area4_pc_A1_9'],

				[-40, 0, -3190 - 430*2,'area4_pc_A2_1'],
				[-450, 0, -3190 - 430*2,'area4_pc_A2_2'],
				[-884, 0, -3190 - 430*2,'area4_pc_A2_3'],

				[-40, 0, -3190 - 430,'area4_pc_A2_4'],
				[-450, 0, -3190 - 430,'area4_pc_A2_5'],
				[-884, 0, -3190 - 430,'area4_pc_A2_6'],

				[-40, 0, -3190,'area4_pc_A2_7'],
				[-450, 0, -3190,'area4_pc_A2_8'],
				[-884, 0, -3190,'area4_pc_A2_9'],

				[1600, 0, 420 , 'area4_pc_B1_1'],
				[1600, 0, 420 - 440 - 6 ,'area4_pc_B1_2'],
				[1600, 0, 420 - 440 * 2,'area4_pc_B1_3'],
				[1600, 0, 420 - 440 * 3,'area4_pc_B1_4'],

				[2672, 0, 420,'area4_pc_B1_5'],
				[2672, 0, 420 - 440 - 6,'area4_pc_B1_6'],
				[2672, 0, 420 - 440 * 2,'area4_pc_B1_7'],
				[2672, 0, 420 - 440 * 3,'area4_pc_B1_8'],

				[3738, 0, 420,'area4_pc_B1_9'],
				[3738, 0, 420 - 440 - 6,'area4_pc_B1_10'],
				[3738, 0, 420 - 440 * 2,'area4_pc_B1_11'],
				[3738, 0, 420 - 440 * 3,'area4_pc_B1_12'],

				[1600, 0, 420 - 3160,'area4_pc_B2_1'],
				[1600, 0, 420 - 440 - 6 - 3160,'area4_pc_B2_2'],
				[1600, 0, 420 - 440 * 2 - 3160,'area4_pc_B2_3'],
				[1600, 0, 420 - 440 * 3 - 3160,'area4_pc_B2_4'],

				[2672, 0, 420 - 3160,'area4_pc_B2_5'],
				[2672, 0, 420 - 440 - 6 - 3160,'area4_pc_B2_6'],
				[2672, 0, 420 - 440 * 2 - 3160,'area4_pc_B2_7'],
				[2672, 0, 420 - 440 * 3 - 3160,'area4_pc_B2_8'],

				[3738, 0, 420 - 3160,'area4_pc_B2_9'],
				[3738, 0, 420 - 440 - 6 - 3160,'area4_pc_B2_10'],
				[3738, 0, 420 - 440 * 2 - 3160,'area4_pc_B2_11'],
				[3738, 0, 420 - 440 * 3 - 3160,'area4_pc_B2_12'],
			]
		};
		
		this.caseJson1 = {
			modelName: 'pc3_02',
			pos: [
				[0, 0, -440 - 6],
				[0, 0, -440 * 2],
				[0, 0, -440 * 3],

				[1072, 0, 0],
				[1072, 0, -440 - 6],
				[1072, 0, -440 * 2],
				[1072, 0, -440 * 3],

				[1072 * 2, 0, 0],
				[1072 * 2, 0, -440 - 6],
				[1072 * 2, 0, -440 * 2],
				[1072 * 2, 0, -440 * 3],

				[0,0,-3160],
				[0, 0, -440 - 6 - 3160],
				[0, 0, -440 * 2 - 3160],
				[0, 0, -440 * 3 - 3160],

				[1072, 0, 0 - 3160],
				[1072, 0, -440 - 6 - 3160],
				[1072, 0, -440 * 2 - 3160],
				[1072, 0, -440 * 3 - 3160],

				[1072 * 2, 0, 0 - 3160],
				[1072 * 2, 0, -440 - 6 - 3160],
				[1072 * 2, 0, -440 * 2 - 3160],
				[1072 * 2, 0, -440 * 3 - 3160],
			]
		};
		
		this.caseJson2 = {
			modelName: 'cylinder02',
			pos: [
				[0, 0, -440 - 6],
				[0, 0, -440 * 2],
				[0, 0, -440 * 3],

				[1072, 0, 0],
				[1072, 0, -440 - 6],
				[1072, 0, -440 * 2],
				[1072, 0, -440 * 3],

				[1072 * 2, 0, 0],
				[1072 * 2, 0, -440 - 6],
				[1072 * 2, 0, -440 * 2],
				[1072 * 2, 0, -440 * 3],

				[0,0,-3160],
				[0, 0, -440 - 6 - 3160],
				[0, 0, -440 * 2 - 3160],
				[0, 0, -440 * 3 - 3160],

				[1072, 0, 0 - 3160],
				[1072, 0, -440 - 6 - 3160],
				[1072, 0, -440 * 2 - 3160],
				[1072, 0, -440 * 3 - 3160],

				[1072 * 2, 0, 0 - 3160],
				[1072 * 2, 0, -440 - 6 - 3160],
				[1072 * 2, 0, -440 * 2 - 3160],
				[1072 * 2, 0, -440 * 3 - 3160],
			]
		};

		// area2 plc
		this.plcJson = {
			modelName: 'plc',
			pos: [

				[800, -950, 0,'area2_plc1'],
				[800, -950, -900,'area2_plc2'],
				[800, -950, -2200,'area2_plc3'],

				[0, 0, -900,'area2_plc5'],
				[-200, -950, -1550,'area2_plc6'],
				[-200, -950, -2150,'area2_plc7'],

				[-400, -950, -2850,'area2_plc8'],
			],
			pos2: [
				[-900, -950, -3100],
				[-2000, -950, -3100],
			]
		};

		// area2 chimney
		this.chimneyJson = {
			modelName:'chimney',
			pos:[
				[0,0,2000],
				[-200,0,4000],
				[1500,0,5000],
			]
		};

		// area2 tower
		this.towerJson = {
			modelName:'tower',
			pos:[
				[1000,0,0]
			]
		};

		// area1 pc
		this.pcJson1 = {
			modelName:'pc1_01',
			pos:[
				[0,0,-425,'area1_pc2'],
				[0,0,-425 * 2,'area1_pc3'],
				[0,0,-425 * 3,'area1_pc4'],
				[0,0,-425 * 4,'area1_pc5'],
			]
		};

		// area1 chair
		this.chairJson1 = {
			modelName:'chair',
			pos:[
				[0,0,60-425],
				[0,0,60-425 * 2],
				[0,0,60-425 * 3],
				[0,0,60-425 * 4],

				[1800,0,500],
				[1800,0,0],
				[1800,0,-1800],
				[1800,0,-2300],
			]
		};

		this.mcMap = {}; // 存3D对象。

		this.positionMap = {
			area1_pc1:[-4.4,-1,-115.8],
			area1_pc2:[-4.4,-1,-124.3],
			area1_pc3:[-4.4,-1,-132.8],
			area1_pc4:[-4.4,-1,-141.3],
			area1_pc5:[-4.4,-1,-149.8],
			
			area4_pc_A1_1:[-153.5,-12.6,-51],
			area4_pc_A1_2:[-144.5,-12.6,-51],
			area4_pc_A1_3:[-136.1,-12.6,-51],

			area4_pc_A1_4:[-153.5,-12.6,-42.3],
			area4_pc_A1_5:[-144.5,-12.6,-42.3],
			area4_pc_A1_6:[-136.1,-12.6,-42.3],

			area4_pc_A1_7:[-153.5,-12.6,-34.1],
			area4_pc_A1_8:[-144.5,-12.6,-34.1],
			area4_pc_A1_9:[-136.3,-12.6,-34.1],

			area4_pc_A2_1:[-89.7,-12.6,-51],
			area4_pc_A2_2:[-80.7,-12.6,-51],
			area4_pc_A2_3:[-72.3,-12.6,-51],

			area4_pc_A2_4:[-89.7,-12.6,-42.3],
			area4_pc_A2_5:[-80.7,-12.6,-42.3],
			area4_pc_A2_6:[-72.3,-12.6,-42.3],

			area4_pc_A2_7:[-89.7,-12.6,-34.1],
			area4_pc_A2_8:[-80.7,-12.6,-34.1],
			area4_pc_A2_9:[-72.3,-12.6,-34.1],

			area4_pc_B1_1:[-162,-12.6,-1.3],
			area4_pc_B1_2:[-153,-12.6,-1.3],
			area4_pc_B1_3:[-144.4,-12.6,-1.3],
			area4_pc_B1_4:[-135.7,-12.6,-1.3],

			area4_pc_B1_5:[-162,-12.6,20.1],
			area4_pc_B1_6:[-153,-12.6,20.1],
			area4_pc_B1_7:[-144.4,-12.6,20.1],
			area4_pc_B1_8:[-135.7,-12.6,20.1],

			area4_pc_B1_9:[-162,-12.6,41.4],
			area4_pc_B1_10:[-153,-12.6,41.4],
			area4_pc_B1_11:[-144.4,-12.6,41.4],
			area4_pc_B1_12:[-135.7,-12.6,41.4],

			area4_pc_B2_1:[-98.65,-12.6,-1.3],
			area4_pc_B2_2:[-89.65,-12.6,-1.3],
			area4_pc_B2_3:[-81.05,-12.6,-1.3],
			area4_pc_B2_4:[-72.35,-12.6,-1.3],

			area4_pc_B2_5:[-98.65,-12.6,20.1],
			area4_pc_B2_6:[-89.65,-12.6,20.1],
			area4_pc_B2_7:[-81.05,-12.6,20.1],
			area4_pc_B2_8:[-72.35,-12.6,20.1],

			area4_pc_B2_9:[-98.65,-12.6,41.4],
			area4_pc_B2_10:[-89.65,-12.6,41.4],
			area4_pc_B2_11:[-81.05,-12.6,41.4],
			area4_pc_B2_12:[-72.35,-12.6,41.4],

			area3_server_A1:[-30,-1,108],
			area3_server_A2:[-30,-1,132],
			area3_server_A3:[-30,-1,156],

			area3_server_B1:[29,-1,108],
			area3_server_B2:[29,-1,132],
			area3_server_B3:[29,-1,156],

			area2_plc1:[98,-9,-25.8],
			area2_plc2:[98,-9,-7.8],
			area2_plc3:[98,-9,18.2],
			area2_plc4:[114,10,-25.8],
			area2_plc5:[114,10,-7.8],

			area2_plc6:[118,-9,5.2],
			area2_plc7:[118,-9,17.2],
			area2_plc8:[121.5,-9,31.2],
			area2_plc9:[131.7,-9,36],
			area2_plc10:[131.7,-9,36],
		};
	};

	/**
	 * 场景初始化完成，资源加载完成会自动调用的函数
	 */
	p.initObject3D = function() {
		// this.camera.position.set(408 + 3000, 292 + 3000, 190 + 3000);
		this.cameraVec3 = new THREE.Vector3( 408, 292, 190 );
		this.camera.position.set(this.cameraVec3.x, this.cameraVec3.y, this.cameraVec3.z);
		// this.container.rotation.y = Math.PI;
		this.camToSave = {
			position:this.camera.position.clone(),
			rotation:this.camera.rotation.clone(),
			controlCenter:this.controls.center.clone()
		};

		this.scene.add(this.container);
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		let boxG = new THREE.BoxGeometry(500,10,500);
		let boxM = new THREE.MeshBasicMaterial({
			color:new THREE.Color(0x022438)
		});
		let boxMesh = new THREE.Mesh(boxG,boxM);
		boxMesh.position.y = -20;
		this.container.add(boxMesh);

		let modelGroup = new THREE.Group();
		// 模型过大，设置一定的缩放比例
		let scale = 0.02;
		modelGroup.scale.x = modelGroup.scale.y = modelGroup.scale.z = scale;
		for (let key in this.areaJson) {
			let areaGroup = new THREE.Group();
			for (let i = 0; i < this.areaJson[key].length; i++) {
				let item = this.areaJson[key][i];
				let result = this.resourcesMap[item].result;

				if (item == 'floor1' || item == 'floor2' || item == 'floor3' || item == 'floor4') {
					let m = new THREE.MeshLambertMaterial({
						color: 0xf4f4f4,
						shininess: 10,
						reflectivity: 0.1
					});
					result.children[0].material = m;
				} else {
					result.children[0].material.specular = new THREE.Color(0x333333);
				}
				areaGroup.add(result);

				if (item == 'pc3_03') {
					result.position.z = -20;
				} else if (item == 'cylinder03') {
					result.position.z = 20;
					result.position.x = 10;
				}else if (item == 'chair') {
					result.position.z = 60;
				}else if (item == 'house') {
					let m = result.children[0].material;
					m.opacity = 0.5;
					m.transparent = true;
				}else if (item == 'plc') { // 处理三个需要旋转的plc
					let box = new THREE.Box3();
					box.setFromObject(result);
					let x = (box.min.x + box.max.x) / 2;
					let z = (box.min.z + box.max.z) / 2;
					for (let i = 0; i < this.plcJson.pos2.length; i++) {
						let item = this.plcJson.pos2[i];
						let resultMidGroup = new THREE.Group();
						resultMidGroup.position.set(x + item[0], item[1], z + item[2]);
						let plc = result.clone();
						let plcM = plc.children[0].material.clone();
						plc.children[0].material = plcM;
						plcM.userData['realColor'] = plcM.color;
						resultMidGroup.add(plc);
						plc.position.set(-x, 0, -z);
						resultMidGroup.rotation.y = Math.PI / 2;
						areaGroup.add(resultMidGroup);
						this.setMcMap('area2_plc'+(9+i),plc);
					}
					this.setMcMap('area2_plc4',result);
				}else if (item == 'pc02') {
					result.position.x = -40;
				}else if (item == 'pc1_01') {
					this.setMcMap('area1_pc1',result);	
				}else if (item == 'server4_01') {
					console.log(result);
				}

				this.saveMaterialColor(result.children[0].material);

				// //area1
				this.cloneObj(result, item, this.pcJson1, areaGroup);
				this.cloneObj(result, item, this.chairJson1, areaGroup);
				
				// //area2
				this.cloneObj(result, item, this.plcJson, areaGroup);
				this.cloneObj(result, item, this.chimneyJson, areaGroup);
				this.cloneObj(result, item, this.towerJson, areaGroup);
				

				// // area4
				this.cloneObj(result, item, this.pcJson3, areaGroup);
				this.cloneObj(result, item, this.caseJson1, areaGroup);
				this.cloneObj(result, item, this.caseJson2, areaGroup);
				
				// // area3
				this.cloneObj(result, item, this.serverJson1, areaGroup);
				this.cloneObj(result, item, this.serverJson2, areaGroup);
				
			}
			let box = new THREE.Box3();
			box.setFromObject(areaGroup);
			let x = (box.min.x + box.max.x) / 2;
			let z = (box.min.z + box.max.z) / 2;
			let areaMidGroup = new THREE.Group();
			areaMidGroup.position.set(x, 0, z);
			areaMidGroup.add(areaGroup);
			areaGroup.position.set(-x, 0, -z);
			areaGroup = areaMidGroup;
			if(key == 'area1'){
				areaGroup.position.set(x + 30/scale,0,z + 50/scale);
			}else if (key == 'area2') {
				areaGroup.position.set(x - 30/scale,0,z+ 50/scale);
				areaGroup.rotation.y = Math.PI;
			} else if (key == 'area3') {
				areaGroup.position.set(-125 / scale, 0, 0);
				areaGroup.rotation.y = -Math.PI / 2;
			} else if (key == 'area4') {
				areaGroup.rotation.y = Math.PI / 2;
				areaGroup.position.set(0 / scale, 0, 130 / scale);
			}
			modelGroup.add(areaGroup);
		}

		console.log(this.mcMap);

		this.container.add(modelGroup);
		this.modelGroup = modelGroup;

		// let obj=  {per:1};
		// new TweenMax(obj,2,{
		// 	per:0,
		// 	delay:1,
		// 	onUpdateParams:[this.camera,this.container],
		// 	onUpdate:function(camera,group){
		// 		camera.position.set(408 + 3000*obj.per, 292 + 3000*obj.per, 190 + 3000*obj.per);
		// 		group.rotation.y = Math.PI * obj.per;
		// 	}
		// });
		// 
		let autoObj = {per:0};

		this.autoTween = new TweenMax(autoObj,40,{
			per:1,
			ease:Linear.easeNone,
			delay:3,
			repeat:-1,
			onUpdateParams:[this.container],
			onUpdate:function(group) {
				group.rotation.y = -Math.PI*2*autoObj.per;
			}
		});

		// this.graphicHelper();

		this.initLight();

		this.initParticleMaterial();

		// this.initLineMaterial();

		// this.initLineParticles();
		
		this.modelReady();
	};

	p.initLineMaterial = function() {
		// this.lineMaterial = 
	};

	p.addLine = function(s,e,color) {
		let start = this.positionMap[s] || [0,0,0];
		let end = this.positionMap[e] || [0,0,0];
		let eObj = this.getMcMap(e);
		let pos = this.getPos(start, end);
		let curve = new THREE.QuadraticBezierCurve3(pos[0], pos[1], pos[2]);
		
		let lG = new THREE.BufferGeometry();
		let len = 50;
		let posAry = new Float32Array(len * 3);
		let tAry = new Float32Array(len);
		let j = len;
		while(j >= 0) {
			j --;
			let t = j/(len-1);
			let p = curve.getPoint(t);
			posAry[3*j] = p.x;
			posAry[3*j + 1] = p.y;
			posAry[3*j + 2] = p.z;
			tAry[j] = t;
		}
		lG.addAttribute('position', new THREE.BufferAttribute(posAry, 3));
		lG.addAttribute('tAry', new THREE.BufferAttribute(tAry, 1));
		let lM = new THREE.ShaderMaterial( {
			uniforms:{
				color:{type:'t',value:new THREE.Color(color)},
				t:{type:'f',value:-1}
			},
			vertexShader:shaders.lineShader.vertexShader,
			fragmentShader:shaders.lineShader.fragmentShader
		} );
		let line = new THREE.Line(lG, lM);
		line.computeLineDistances();
		line.userData['curve'] = curve;
		line.userData['lineColor'] = new THREE.Color(color);
		this.container.add(line);
		this.linkLineAry.push(line);
		this.addLineParticles(line,eObj);
	};

	// 辅助图形，正式效果时不显示
	p.graphicHelper = function() {
		let axisHelper = new THREE.AxesHelper(400);
		this.container.add(axisHelper);

		let axis = new FTKJ.Axis({
			dis: 10,
			n: 20
		});
		let group = axis.getGroup();
		group.position.set(0,-12,0);
		this.container.add(group);

	};

	p.initLight = function() {
		let ambient = new THREE.AmbientLight(0x034056);
		this.container.add(ambient);
		let h = 300;
		let d = 200;
		let distance = 400;

		let light2 = new THREE.PointLight(0xdce3e4, 0.40, distance);
		light2.position.set(0, h, 0);
		this.container.add(light2);

		let light3 = new THREE.PointLight(0xdce3e4, 0.33, distance);
		light3.position.set(d * 2, h, 0);
		this.container.add(light3);
		// 
		let light4 = new THREE.PointLight(0xdce3e4, 0.36, distance);
		light4.position.set(-d * 2, h, 0);
		this.container.add(light4);
		// 
		let light5 = new THREE.PointLight(0xdce3e4, 0.34, distance);
		light5.position.set(0, h, d);
		this.container.add(light5);
		// 
		let light6 = new THREE.PointLight(0xdce3e4, 0.36, distance);
		light6.position.set(0, h, -d);
		this.container.add(light6);
	};

	p.addLineParticles = function(line,eObj) {
		let item = this.createLineParticlesItem(line);
		this.container.add(item);
		item.userData['cirV'] = 0.015; // 初始化速度为0
		item.userData['opacity'] = 0.5; // 初始化透明度为0
		item.userData['stop'] = false;
		this.lineParticlesAry.push(item);
		let _this = this;
		// eObj = this.getMcMap('area2_plc2');
		new TweenMax({per:0},10,{
			per:1,
			onComplete:function(){
				_this.container.remove(item);
				_this.container.remove(line);
				if (eObj && eObj.children[0].material.userData) {
					_this.setMaterialColor(eObj.children[0].material);
				}
			}
		});
		if (eObj) {
			new TweenMax({per:0},2.7,{
				per:1,
				onComplete:function(){
					_this.setMaterialColor(eObj.children[0].material,line.userData['lineColor']);
				}
			});
		}
	};

	p.initParticleMaterial = function() {
		let texture = this.resourcesMap['spark'].result;
		this.particleMaterial = new THREE.ShaderMaterial({
			uniforms: {
				opacity: {
					type: 'f',
					value: 1
				}, // 最大的透明度
				texture: {
					type: 't',
					value: texture
				},
			},
			vertexShader: shaders.pointShader.vertexShader,
			fragmentShader: shaders.pointShader.fragmentShader,
			transparent: true,
			depthTest: false
		});
	};

	/**
	 * 粒子运动
	 * 初始化创建粒子，大小颜色，透明度确定，位置在后续计算通过改变位置来运动
	 */
	p.createLineParticlesItem = function(line) {
		let curve = line.userData['curve'];
		let lineColor = line.userData['lineColor'];
		// let particleNum = Math.ceil(curve.getLength());
		let particleNum = 100;
		let positionAry = new Float32Array(particleNum * 3);
		let colorAry = new Float32Array(particleNum * 3);
		let lineColorAry = new Float32Array(particleNum * 3);
		let opacityAry = new Float32Array(particleNum);
		let sizeAry = new Float32Array(particleNum);
		let color = new THREE.Color(lineColor); // 更改粒子的颜色
		let perAry = new Float32Array(particleNum);
		let i = particleNum;
		let i3 = i * 3;
		let range = 0.2; // 粒子覆盖的范围，占总长的百分比
		let sizeBase = 30; // 粒子大小的计算基数。
		while (i3 > 0) {
			i--;
			i3 -= 3;
			//
			let t = range * (i / particleNum);
			opacityAry[i] = 0;
			sizeAry[i] = sizeBase * window.devicePixelRatio * t;
			color.toArray(colorAry, i * 3);
			lineColor.toArray(lineColorAry, i * 3);
			//
			let v = curve.getPoint(t);
			perAry[i] = t; // 保存每个点的t的值
			positionAry[i3] = v.x;
			positionAry[i3 + 1] = v.y;
			positionAry[i3 + 2] = v.z;
		}

		let geometry = new THREE.BufferGeometry();
		geometry.addAttribute('position', new THREE.BufferAttribute(positionAry, 3));
		geometry.addAttribute('aColor', new THREE.BufferAttribute(colorAry, 3));
		geometry.addAttribute('lColor', new THREE.BufferAttribute(lineColorAry, 3));
		geometry.addAttribute('aOpacity', new THREE.BufferAttribute(opacityAry, 1));
		geometry.addAttribute('size', new THREE.BufferAttribute(sizeAry, 1));
		geometry.addAttribute('per', new THREE.BufferAttribute(perAry, 1));
		geometry.addAttribute('perOld', new THREE.BufferAttribute(perAry.slice(0), 1));
		//
		let particles = new THREE.Points(geometry, this.particleMaterial);
		geometry.attributes.position.needsUpdate = true;
		particles.userData['curve'] = curve;
		return particles;
	};

	p.lineParticlesRender = function() {
		if (this.lineParticlesAry) {
			let ary = this.lineParticlesAry;
			for (let i = 0; i < ary.length; i++) {
				this.lineParticlesItemRender(ary[i]);
			}
		}
	};

	p.wireframeRender = function() {
		let type = 'downToUp'; // back ， downToUp
		for (let i = 0; i < this.wireframeArr.length; i++) {
			let item = this.wireframeArr[i];
			let cT = item.userData['cT']; // 移动速度
			let dirDown = item.userData['dirDown'];
			let tValue = item.material.uniforms.t.value;
			if (type == 'downToUp') { // 从下到上循环
				item.material.uniforms.t.value += cT;
				if (tValue >= 1.5) {
					item.material.uniforms.t.value = -0.5;
				}
			} else if (type == 'back') { // 上下往返循环
				if (!dirDown) {
					item.material.uniforms.t.value += cT;
					if (tValue >= 1) {
						item.userData['dirDown'] = true;
					}
				} else {
					item.material.uniforms.t.value -= cT;
					if (tValue <= 0) {
						item.userData['dirDown'] = false;
					}
				}
			}
		}
	};

	p.lineParticlesItemRender = function(lineParticlesItem) {
		let curve = lineParticlesItem.userData['curve'];
		let cirV = lineParticlesItem.userData['cirV'];

		let positionAry = lineParticlesItem.geometry.attributes.position.array;
		let opacityAry = lineParticlesItem.geometry.attributes.aOpacity.array;
		let perAry = lineParticlesItem.geometry.attributes.per.array;
		let particleNum = opacityAry.length;
		let i = particleNum;
		let i3 = i * 3;
		while (i3 > 0) {
			i--;
			i3 -= 3;
			//
			perAry[i] += cirV;
			perAry[i] %= 1;
			let t = perAry[i];
			let v = curve.getPoint(t);
			//
			opacityAry[i] = lineParticlesItem.userData['opacity'] * t;

			positionAry[i3] = v.x;
			positionAry[i3 + 1] = v.y;
			positionAry[i3 + 2] = v.z;
		}
		lineParticlesItem.geometry.attributes.position.needsUpdate = true;
		lineParticlesItem.geometry.attributes.aOpacity.needsUpdate = true;
	};

	p.change = function() {
		for (let i = 0; i < this.lineParticlesAry.length; i++) {
			let item = this.lineParticlesAry[i];
			let v = item.userData['cirV'];
			let perOld = item.geometry.attributes.perOld.array.slice(0);
			if (v == 0) {
				item.userData['cirV'] = 0.015;
				item.userData['opacity'] = 0.5;
				item.geometry.attributes.per.array = perOld; // 粒子回到初始位置。
			} else {
				item.userData['cirV'] = 0; // 粒子取消运动 运动速度为0
				item.userData['opacity'] = 0; // 粒子不可见
			}
		}
	};

	p.windowClick = function(ev) {
		this.mouse.x = ev.clientX / window.innerWidth * 2 - 1;
		this.mouse.y = -ev.clientY / window.innerHeight * 2 + 1;
		if (this.raycaster) {
			this.raycaster.setFromCamera(this.mouse, this.camera);
			let intersects = this.raycaster.intersectObjects(this.modelGroup.children);
			if (intersects.length) {
				let clickObj = intersects[0].object;
				// for (let i = 0; i < this.wireframeArr.length; i++) {
				// 	let item = this.wireframeArr[i];
				// 	if (item.name == clickObj.name) {
				// 		item.userData['cT'] = 0.02;
				// 		item.material.uniforms.t.value = 0;
				// 		item.material.uniforms.aColor.value = new THREE.Color(0xffffff * Math.random());
				// 	}
				// }
				// clickObj.visible = false;
				// console.log(clickObj);
			}
		}
	};

	// 渲染时会一直调用的函数
	p.renderFun = function() {
		this.lineParticlesRender(); // 粒子运动渲染
		this.wireframeRender(); // 建筑外线框运动渲染
	};

	// 暂停，表示有用户操作。
	p.pause = function() {
		this.autoTween.pause();
		if (this.backTween) {
			this.backTween.kill();
		}
	};

	// 自动 ，表示用户操作停止了一段时间，再次重新自动旋转
	p.reauto = function() {
		let _this = this;
		let ePos = _this.cameraVec3;
		let vPos = _this.camera.position;
		let obj = {per:0};
		let cCenter = _this.controls.center;
		this.backTween = new TweenMax(obj,3,{
  			per:1,
  			ease:Linear.easeNone,
  			onUpdate:function(){
  				_this.camera.position.x = _this.step(vPos.x,ePos.x,obj.per);
  				_this.camera.position.y = _this.step(vPos.y,ePos.y,obj.per);
  				_this.camera.position.z = _this.step(vPos.z,ePos.z,obj.per);
  				_this.controls.center.x = _this.step(cCenter.x,0,obj.per);
  				_this.controls.center.y = _this.step(cCenter.y,0,obj.per);
  				_this.controls.center.z = _this.step(cCenter.z,0,obj.per);
				_this.controls.update();
  			},
  			onComplete:function(){
				_this.autoTween.play();
  			}
		});

	};

	// 复制对象，放到指定位置。
	p.cloneObj = function(child, modelName, json, parent) {

		if (modelName === json.modelName) {
			for (let i = 0; i < json.pos.length; i++) {
				let item = json.pos[i];
				let newChild = child.clone();
				if (child.children[0].material.length === undefined) {
					let newM = child.children[0].material.clone();
					newChild.children[0].material = newM;
					newM.userData['realColor'] = newM.color;
				}else{
					if (modelName == 'pc1_01') {
						console.log(child.children[0]);
					}
					for (let j = 0; j < child.children[0].material.length; j++) {
						let newM = child.children[0].material[j].clone();
						newChild.children[0].material[j] = newM;
						newM.userData['realColor'] = newM.color;
					}
				}
				if (modelName == 'cylinder03') {
					item[2] += 40;
					item[0] += 10;
				}
				newChild.position.set(item[0], item[1], item[2]);
				parent.add(newChild);
				if (!!item[3]) {
					this.setMcMap(item[3],newChild);
				}
			}
		}
	};

	/**
	 * [根据两点，计算贝塞尔曲线的控制点]
	 * @param  {[array]} p1 [x,y,z]
	 * @param  {[array]} p2 [x,y,z]
	 * @return {[array]}    [vec3,vec3,vec3]
	 */
	p.getPos = function(p1, p2) {
		let sVec3 = new THREE.Vector3(p1[0], p1[1], p1[2]);
		let eVec3 = new THREE.Vector3(p2[0], p2[1], p2[2]);
		let mVec3 = new THREE.Vector3((p1[0] + p2[0]) / 2, 100, (p1[2] + p2[2]) / 2);
		return [sVec3, mVec3, eVec3];
	};

	p.step = function(s,e,t) {
		return s + (e-s)*t;
	};

	p.QuadraticBezier = function() {

	};

	p.setMcMap = function(id,obj) {
		this.mcMap[id] = obj;
	};

	p.getMcMap = function(id) {
		return this.mcMap[id];
	};

	p.saveMaterialColor = function(m){

		if (m.length === undefined) {
			m.userData['realColor'] = m.color;
		}else{
			for (var i = 0; i < m.length; i++) {
				m[i].userData['realColor'] = m[i].color;
			}
		}
	};

	p.setMaterialColor = function(m,color){
		if (m.length === undefined) {
			m.color = color || m.userData['realColor'];
		}else{
			for (var i = 0; i < m.length; i++) {
				m[i].color = color || m[i].userData['realColor'];
			}
		}
	};

	// 数组里是否有某项
	p.findInArr = function(n, arr) {
		if (!arr || !arr.length) {
			return false;
		} else {
			for (let i = 0; i < arr.length; i++) {
				if (n === arr[i]) {
					return true;
				}
			}
			return false;
		}
	};

	FTKJ.Model = Model;
})();