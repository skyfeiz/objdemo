this.FTKJ = this.FTKJ || {};

/**模型相关的信息
 * 05-14 by Field
 * areaJson : 模型文件名称 一个名称含代表两个文件 ,例如 tv 代表 有一个tv.obj文件和tv.mtl文件。会在ThreeGroupLoader.js里加载。
 * objPosArr :  模型中当文件的复制信息，modelName 对应要复制的文件。pos对应要复制的个数和位置(该位置是相对于被复制的对象的位置）。pos[3]有信息，代表在config/config.js里配置ip。通过ip找到该对象。
 * positionMap: 需要连线的对象的连线点的坐标。
 */
this.FTKJ.posMap = {
	areaJson:{
		area1: ['tv', 'server', 'floor1', 'chair', 'pc1_01', 'desk', 'bigdesk'],
		area2: ['floor2', 'railing', 'railing01', 'chimney', 'chimney01', 'chimney02', 'tower', 'house', 'plc'],
		area3: ['note', 'floor3', 'pc01', 'pc02', 'pc3_01', 'pc3_02', 'phone', 'line1', 'singal', 'cylinder01', 'cylinder02', 'ipad'],
		area4: ['floor4', 'pc4_01', 'server4_01', 'server4_02', 'chair4_01', 'desk4_01']
	},
	objPosArr:[
		{	// 	area1
			modelName:'pc1_01',
			pos:[
				[0,0,-425,'area1_pc2'],
				[0,0,-425 * 2,'area1_pc3'],
				[0,0,-425 * 3,'area1_pc4'],
				[0,0,-425 * 4,'area1_pc5'],
			]
		},{
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
		},{	// 	area2
			modelName:'tower',
			pos:[
				[1000,0,0]
			]
		},{
			modelName:'chimney',
			pos:[
				[0,0,2000],
				[-200,0,4000],
				[1500,0,5000],
			]
		},{
			modelName: 'plc',  // 保持该项的索引为4， 在model.js里面有直接用到索引4；
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
		},{	// 	area3
			modelName: 'server4_02',
			pos: [
				[-1200, 0, 0,'area3_server_A2'],
				[-2400, 0, 0,'area3_server_A3']
			]
		},{
			modelName: 'server4_01',
			pos: [
				[-1200, 0, 0,'area3_server_B2'],
				[-2400, 0, 0,'area3_server_B3']
			]
		},{	//	area4
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
		},{
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
		},{
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
		}
	],
	positionMap:{
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
	}
};