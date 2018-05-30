/* globals shaders,TweenMax,Linear */

/**
 * 整个模型的加载，包括某些模型的克隆，场景中生成连线，以及相应的特效
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
		let testPath = './';
		testPath = '/static/big_screen/';
		let array = [
			{id: 'spark', type: 'texture', url: testPath + 'imgs/spark.png'}, 
			{id: 'smoke', type: 'texture', url: testPath + 'imgs/smokeparticle.png'}, 
			{id: 'font', type: 'font', url: testPath + 'obj/front/FZLanTingHeiS-UL-GB_Regular.json'}, 
		];

		this.areaJson = FTKJ.posMap.areaJson;

		// {id:model,type:'mtl',url:'./obj/area1/model'}
		for (let key in this.areaJson) {
			for (let i = 0; i < this.areaJson[key].length; i++) {
				let name = this.areaJson[key][i];
				array.push({
					id: name,
					type: 'mtl',
					url: testPath + 'obj/' + key + '/' + name
				});
			}
		}

		this.threeBaseInit(array);
		this.container = new THREE.Group();

		this.linkLineAry = []; // 保存所有实线的数组

		this.lineParticlesAry = []; // 保存每个连线所有粒子的数组

		this.wireframeArr = []; // 	保存线框对象的数组

		this.smokeArr = []; // 保存烟雾对象

		this.wireFrameCache = {};	//	线框对象的缓存

		this.autoTween = null;	//	保存tweenMax对象

		this.objPosArr = FTKJ.posMap.objPosArr;

		this.mcMap = {}; // 存3D对象。

		this.positionMap = FTKJ.posMap.positionMap;
	};

	/**
	 * 场景初始化完成，资源加载完成会自动调用的函数
	 */
	p.initObject3D = function() {
		this.controls.maxDistance = 1000;	// 	限制鼠标缩放的最远距离
		this.controls.enableKeys = false;	//	取消键盘控制
		// this.camera.position.set(408 + 3000, 292 + 3000, 190 + 3000);
		this.cameraVec3 = new THREE.Vector3(408, 292, 190);
		this.camera.position.set(this.cameraVec3.x, this.cameraVec3.y, this.cameraVec3.z);
		// this.container.rotation.y = Math.PI;
		this.camToSave = {
			position: this.camera.position.clone(),
			rotation: this.camera.rotation.clone(),
			controlCenter: this.controls.center.clone()
		};

		this.scene.add(this.container);
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		let boxG = new THREE.BoxGeometry(500, 10, 500);
		let boxM = new THREE.MeshBasicMaterial({
			color: new THREE.Color(0x022438)
		});
		let boxMesh = new THREE.Mesh(boxG, boxM);
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
				} else if (item == 'chair') {
					result.position.z = 60;
				} else if (item == 'house') {
					let m = result.children[0].material;
					m.opacity = 0.5;
					m.transparent = true;
				} else if (item == 'plc') { // 处理三个需要旋转的plc
					let box = new THREE.Box3();
					box.setFromObject(result);
					let x = (box.min.x + box.max.x) / 2;
					let z = (box.min.z + box.max.z) / 2;
					for (let j = 0; j < this.objPosArr[4].pos2.length; j++) {
						let item = this.objPosArr[4].pos2[j];
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
						this.setMcMap('area2_plc' + (9 + i), plc);
					}
					this.setMcMap('area2_plc4', result);
				} else if (item == 'pc02') {
					result.position.x = -40;
				} else if (item == 'pc1_01') {
					this.setMcMap('area1_pc1', result);
				} else if (item == 'server4_01') {
					this.setMcMap('area3_server_B1', result);
				} else if (item == 'server4_02') {
					this.setMcMap('area3_server_A1', result);
				}else if (item == 'chimney') {
					result.children[0].material.depthTest = true;
				}

				this.saveMaterialColor(result);

				for (let j = 0; j < this.objPosArr.length; j++) {
					this.cloneObj(result, item, this.objPosArr[j], areaGroup);
				}
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
			if (key == 'area1') {
				areaGroup.position.set(x + 30 / scale, 0, z + 50 / scale);
			} else if (key == 'area2') {
				areaGroup.position.set(x - 30 / scale, 0, z + 50 / scale);
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

		// console.log(this.mcMap);

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
		let autoObj = {
			per: 0
		};

		this.autoTween = new TweenMax(autoObj, 40, {
			per: 1,
			ease: Linear.easeNone,
			delay: 3,
			repeat: -1,
			onUpdateParams: [this.container],
			onUpdate: function(group) {
				group.rotation.y = -Math.PI * 2 * autoObj.per;
			}
		});

		// this.graphicHelper();

		this.initLight();

		this.initParticleMaterial();

		this.initAreaName();

		this.addSmoke(195,20,10);
		this.addSmoke(195,20,50);
		this.addSmoke(198,20,-30);
		this.addSmoke(165,20,-50);

		this.modelReady();
	};

	// 给每个区域添加名称
	p.initAreaName = function() {
		let area1Text = this.createFont({
			text:'监控区',
			y:-12,
			z:-70
		});
		area1Text.rotation.x = Math.PI/2;
		area1Text.rotation.y = Math.PI;

		let area2Text = this.createFont({
			text:'工控区',
			y:-12,
			x:60,
		});
		area2Text.rotation.x = -Math.PI/2;
		area2Text.rotation.z = Math.PI/2;

		let area3Text = this.createFont({
			text:'攻击区',
			y:-12,
			x:-65,
		});	
		area3Text.rotation.x = -Math.PI/2;
		area3Text.rotation.z = -Math.PI/2;

		let area4Text = this.createFont({
			text:'服务器区',
			y:-12,
			z:70,
		});	
		area4Text.rotation.x = -Math.PI/2;
	};

	// 创建线框对象，需要建立缓存，不重复创建。
	p.createWireframeObj = function(obj,color) {
		if (!obj) {return ;}
		if (this.wireFrameCache[obj.uuid] !== undefined) {
			return this.wireFrameCache[obj.uuid];
		}else{
			let cloneObj = obj.clone();
			let mesh = cloneObj.children[0];
			let box = new THREE.Box3().setFromObject(cloneObj);
			// console.log(box);
			let material = new THREE.ShaderMaterial({
				uniforms:{
					t:{value:-0.5},
					yMax:{value:box.max.y},
					yMin:{value:box.min.y},
					aColor:{value:new THREE.Color(color)}
				},
				vertexShader:shaders.wireframeShader.vertexShader,
				fragmentShader:shaders.wireframeShader.fragmentShader,
				transparent:true,
			});
			mesh.material = material;
			mesh.userData['cT'] = 0;
			this.wireframeArr.push(mesh);
			this.wireFrameCache[obj.uuid] = mesh;
			obj.parent.add(cloneObj);
		}
	};

	// 生成文字
	p.createFont = function(json) {
		let x = json.x || 0;
		let y = json.y || 0;
		let z = json.z || 0;
		let color = json.color || new THREE.Color( 0xffffff );
		let size = json.size || 10;
		let height = json.height || 0.2;
		let textGeo = new THREE.TextGeometry(json.text,{
			font: this.resourcesMap['font'].result,
			size:size,
			height: height,
			curveSegments: 4,
			bevelThickness: 2,
			bevelSize: 1.5,
			bevelEnabled: false
		});
		let group = new THREE.Group();

		let tM = new THREE.MeshPhongMaterial({
			color:color
		});
		let mesh = new THREE.Mesh(textGeo,tM);
		let box = new THREE.Box3();
		box.setFromObject(mesh);
		group.add(mesh);
		let w = box.max.x - box.min.x;
		let midx = (box.max.x + box.min.x)/2;
		let midz = (box.max.z + box.min.z)/2;
		group.position.set(midx + x - w/2,y,midz + z);
		mesh.position.set(-midx,0,-midz);
		group.rotation.y = json.rad || 0;
		this.container.add(group);

		return group;
	};

	p.addSmoke = function(x,y,z) {
		let smokeGeometry = new THREE.BufferGeometry();
		let len = 200;
		let posAry = new Float32Array(len * 3);
		let dirAry = new Float32Array(len * 3);
		let sizeAry = new Float32Array(len);
		let opacityAry = new Float32Array(len);
		let i = len;
		let sizeBase = 40;
		while(i >= 0) {
			i--;
			posAry[3*i] = 0;
			posAry[3*i+1] = this.rnd(-100,0);
			posAry[3*i+2] = 0;
			dirAry[3*i] = 0;  // 速度
			dirAry[3*i+1] = 0;	// x角度
			dirAry[3*i+2] = 0;	// z角度
			sizeAry[i] = sizeBase * window.devicePixelRatio;
			opacityAry[i] = 1;
		}
		smokeGeometry.addAttribute('position',new THREE.BufferAttribute(posAry,3));
		smokeGeometry.addAttribute('dir',new THREE.BufferAttribute(dirAry,3));
		smokeGeometry.addAttribute('size',new THREE.BufferAttribute(sizeAry,1));
		smokeGeometry.addAttribute('aOpacity',new THREE.BufferAttribute(opacityAry,1));
		let smokeMaterial = new THREE.ShaderMaterial({
			uniforms:{
				texture: {
					type: 't',
					value: this.resourcesMap['smoke'].result
				},
			},
			vertexShader:shaders.smokeShader.vertexShader,
			fragmentShader:shaders.smokeShader.fragmentShader,
			transparent:true,
			depthTest:false
		});
		let points = new THREE.Points(smokeGeometry,smokeMaterial);
		this.smokeArr.push(points);
		points.position.x = x;
		points.position.y = y;
		points.position.z = z;
		this.container.add(points);
		return points;
	};

	p.initLineMaterial = function() {
		// this.lineMaterial = 
	};

	p.addLine = function(s, e, color,aType) {
		let start = this.positionMap[s] || [0, 0, 0];
		let end = this.positionMap[e] || [0, 0, 0];
		let eObj = this.getMcMap(e);
		let pos = this.getPos(start, end);
		let curve = new THREE.QuadraticBezierCurve3(pos[0], pos[1], pos[2]);

		let lG = new THREE.BufferGeometry();
		let len = 50;
		let posAry = new Float32Array(len * 3);
		let tAry = new Float32Array(len);
		let j = len;
		while (j >= 0) {
			j--;
			let t = j / (len - 1);
			let p = curve.getPoint(t);
			posAry[3 * j] = p.x;
			posAry[3 * j + 1] = p.y;
			posAry[3 * j + 2] = p.z;
			tAry[j] = t;
		}
		lG.addAttribute('position', new THREE.BufferAttribute(posAry, 3));
		lG.addAttribute('tAry', new THREE.BufferAttribute(tAry, 1));
		let lM = new THREE.ShaderMaterial({
			uniforms: {
				color: {
					type: 't',
					value: new THREE.Color(color)
				},
				t: {
					type: 'f',
					value: -1
				}
			},
			vertexShader: shaders.lineShader.vertexShader,
			fragmentShader: shaders.lineShader.fragmentShader
		});
		let line = new THREE.Line(lG, lM);
		line.computeLineDistances();
		line.userData['curve'] = curve;
		line.userData['lineColor'] = new THREE.Color(color);
		this.container.add(line);
		this.linkLineAry.push(line);
		let p1 = pos[2].clone().sub(pos[0]).normalize();
		let p2 = new THREE.Vector3( 1, 0, 0 );
		let rad = Math.acos(p1.dot(p2));
		if (p1.cross(p2).dot(new THREE.Vector3( 0, 1, 0 ))>0) {
			// 判断顺时针还是逆时针
			rad = Math.PI*2 - rad;
		}
		// let tGroup = this.createFont({
		// 	text:'团队',
		// 	color:color,
		// 	x:pos[1].x,
		// 	y:pos[1].y/2, 
		// 	z:pos[1].z,
		// 	rad:rad,
		// });
		this.createWireframeObj(eObj,color);
		this.addLineParticles(line, eObj,aType);
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
		group.position.set(0, -12, 0);
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
		light3.position.set(d, 200, 0);
		this.container.add(light3);
		// 
		let light4 = new THREE.PointLight(0xdce3e4, 0.36, distance);
		light4.position.set(-d, 200, 0);
		this.container.add(light4);
		// 
		let light5 = new THREE.PointLight(0xdce3e4, 0.34, distance);
		light5.position.set(0, 200, d);
		this.container.add(light5);
		// 
		let light6 = new THREE.PointLight(0xdce3e4, 0.36, distance);
		light6.position.set(0, h, -d);
		this.container.add(light6);
	};

	p.addLineParticles = function(line, eObj,aType,tGroup) {
		let item = this.createLineParticlesItem(line);
		this.container.add(item);
		item.userData['cirV'] = 0.015; // 初始化速度为0
		item.userData['opacity'] = 0.5; // 初始化透明度为0
		item.userData['stop'] = false;
		this.lineParticlesAry.push(item);
		let _this = this;
		// eObj = this.getMcMap('area2_plc2');
		new TweenMax({
			per: 0
		}, 10, {
			per: 1,
			onComplete: function() {
				_this.container.remove(item);
				_this.container.remove(line);
				// _this.container.remove(tGroup);
				if (eObj) {
					let count = eObj.userData['count'] || 0;
					eObj.userData['count'] = --count;
					if (eObj && eObj.children[0].material.userData && count == 0) {
						_this.setMaterialColor(eObj);
						_this.endWireframeAni(_this.wireFrameCache[eObj.uuid]);
					}
				}
			}
		});
		if (eObj) {
			let count = eObj.userData['count'] || 0;
			eObj.userData['count'] = ++count; // 记录目标值为该物体的数量，在完成时执行--操作,当值为0时,物体回到原来的颜色
			new TweenMax({
				per: 0
			}, 2.7, {
				per: 1,
				onComplete: function() {
					_this.setMaterialColor(eObj, line.userData['lineColor']);
					_this.startWireframeAni(_this.wireFrameCache[eObj.uuid],line.userData['lineColor'],aType);
				}
			});
		}
	};

	p.initParticleMaterial = function() {
		this.particleMaterial = new THREE.ShaderMaterial({
			uniforms: {
				opacity: {
					type: 'f',
					value: 1
				}, // 最大的透明度
				texture: {
					type: 't',
					value: this.resourcesMap['spark'].result
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
		for (let i = 0; i < this.wireframeArr.length; i++) {
			let item = this.wireframeArr[i];
			let cT = item.userData['cT']; // 移动速度
			let dirDown = item.userData['dirDown'];
			let aType = item.userData['aType'] || 'downToUp';
			let tValue = item.material.uniforms.t.value;
			if (aType == 'downToUp') { // 从下到上循环
				item.material.uniforms.t.value += cT;
				if (tValue >= 1.5) {
					item.material.uniforms.t.value = -0.5;
				}
			} else if (aType == 'back') { // 上下往返循环
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

	p.smokeRender = function() {
		let _this = this;
		for (let i = 0; i < this.smokeArr.length; i++) {
			let item = this.smokeArr[i];
			let positionAry = item.geometry.attributes.position.array;
			let dirAry = item.geometry.attributes.dir.array;
			let opacityAry = item.geometry.attributes.aOpacity.array;
			let sizeAry = item.geometry.attributes.size.array;
			let j = opacityAry.length;
			let j3 = 3*j;
			let maxH = 100;
			let sizeBase = 40;
			while(j > 0) {
				j--;
				j3 -=3;
				// 随机向上的角度
				let speed = dirAry[j3];
				if (speed <= 0) { // 没有速度 随机一个速度
					speed = _this.rnd(0.001,0.01);
					dirAry[j3] = speed;
				}
				let dirX = dirAry[j3 + 1];
				if (dirX === 0) {
					dirX = _this.rnd(-0.2,0.2);
					dirAry[j3 + 1] = dirX;
				}
				let dirY = dirAry[j3 + 2];
				if (dirY === 0) {
					dirY = _this.rnd(-0.2,0.2);
					dirAry[j3 + 2] = dirY;
				}
				let y = positionAry[j3 + 1] + maxH*speed;
				if (y >= maxH) {  // 粒子上升到最高点时重置粒子
					dirAry[j3 + 1] = 0;
					dirAry[j3 + 2] = 0;
					positionAry[j3] = 0;
					positionAry[j3 + 2] = 0;
				}
				y %= maxH;
					positionAry[j3 + 1] = y;
				if (y >= 0) {
					positionAry[j3] += maxH*speed*Math.sin(dirX);
					positionAry[j3 + 2] += maxH*speed*Math.sin(dirY);
					sizeAry[j] = sizeBase * window.devicePixelRatio * (0.2 + 0.8*y/maxH);
					opacityAry[j] = 1 - y/maxH;
				}else{
					sizeAry[j] = 0;
					opacityAry[j] = 0;
				}
			}
			item.geometry.attributes.position.needsUpdate = true;
			item.geometry.attributes.dir.needsUpdate = true;
			item.geometry.attributes.aOpacity.needsUpdate = true;
			item.geometry.attributes.size.needsUpdate = true;
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

	p.startWireframeAni = function(item,color,aType) {
		if (aType == 1) {  //0  工控攻击 1 扫描  2 传统攻击
 			item.userData['aType'] = 'back';
		}else{
			item.userData['aType'] = 'downToUp';
		}
		item.visible = true;
		item.userData['cT'] = 0.04;
		item.material.uniforms.t.value = 0;
		item.material.uniforms.aColor.value = new THREE.Color(color);
	};

	p.endWireframeAni = function(item) {
		item.userData['cT'] = 0;
		item.visible = false;
	};

	// 渲染时会一直调用的函数
	p.renderFun = function() {
		this.lineParticlesRender(); // 粒子运动渲染
		this.wireframeRender(); // 建筑外线框运动渲染
		this.smokeRender(); // 烟雾运动渲染
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
		let obj = {
			per: 0
		};
		let cCenter = _this.controls.center;
		this.backTween = new TweenMax(obj, 3, {
			per: 1,
			ease: Linear.easeNone,
			onUpdate: function() {
				_this.camera.position.x = _this.step(vPos.x, ePos.x, obj.per);
				_this.camera.position.y = _this.step(vPos.y, ePos.y, obj.per);
				_this.camera.position.z = _this.step(vPos.z, ePos.z, obj.per);
				_this.controls.center.x = _this.step(cCenter.x, 0, obj.per);
				_this.controls.center.y = _this.step(cCenter.y, 0, obj.per);
				_this.controls.center.z = _this.step(cCenter.z, 0, obj.per);
				_this.controls.update();
			},
			onComplete: function() {
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
				// 保存material
				newChild.userData['material'] = newChild.children[0].material;

				if (modelName == 'cylinder03') {
					item[2] += 40;
					item[0] += 10;
				}
				newChild.position.set(item[0], item[1], item[2]);
				parent.add(newChild);
				if (!!item[3]) {
					this.setMcMap(item[3], newChild);
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

	p.step = function(s, e, t) {
		return s + (e - s) * t;
	};

	p.setMcMap = function(id, obj) {
		this.mcMap[id] = obj;
	};

	p.getMcMap = function(id) {
		return this.mcMap[id];
	};

	p.saveMaterialColor = function(obj) {
		let m = obj.children[0].material;
		obj.userData['material'] = m;
	};

	p.setMaterialColor = function(obj, color) {
		let newM;
		if (!!color) {
			newM = new THREE.MeshPhongMaterial({
				color: color
			});
		} else {
			newM = obj.userData['material'];
		}
		obj.children[0].material = newM;
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

	p.rnd = function(n,m) {
		return Math.random()*(m-n) + n;
	};

	FTKJ.Model = Model;
})();