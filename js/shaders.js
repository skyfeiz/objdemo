var shaders = {
	lineShader:{
		vertexShader:[
			'attribute float tAry;',
            'varying float vT;',
			'void main(){',
                'vT = tAry;',
				'gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);',
			'}'
		].join(''),
		fragmentShader:[
			'uniform vec3 color;',
            'uniform float t;',
            'varying float vT;',
			'void main(){',
                'if(vT < t){',
                    'discard;',
                '}',
				'gl_FragColor = vec4(color,1.);',
			'}'
		].join('')
	},
	wireframeShader:{
		vertexShader:[
			'varying vec2 vUv;',
            'varying vec3 vPosition;',
			'void main(){',
				'vUv = uv;',
                'vPosition = position;',
				'gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);',
			'}'
		].join(''),
		fragmentShader:[
            'uniform float t;',
			'uniform float yMax;',
            'uniform vec3 aColor;',
			'varying vec2 vUv;',
            'varying vec3 vPosition;',
            'float vP;',
            'float vT;',
			'void main(){',
                'vP = vPosition.y / yMax;',
                'vP = 1. - abs(vP - t);',
                'vT = vP*vP*vP;',
				'gl_FragColor = vec4(vec3(aColor*vT),vT);',
			'}'
		].join('')
	},
		/*---------------------------带贴图的粒子-------------------------------*/
    pointShader: {

        uniforms: {
            tDiffuse: {type: 't', value: null},
            color: {type: 'c', value: new THREE.Color( 0xffffff )},
            opacity: {type: 'f', value: 1.0}
        },

        vertexShader: [

            'attribute float size;',

            'attribute vec3 aColor;',

            'attribute vec3 lColor;',

            'attribute float aOpacity;',

            'varying vec3 vColor;',

            'varying vec3 lineColor;',

            'varying float vOpacity;',

            'void main() {',

                'vColor = aColor;',

                'lineColor = lColor;',

                'vOpacity = aOpacity;',

                'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',

                'gl_PointSize = size*( 600.0 / length( mvPosition.xyz ) );',

                'gl_Position = projectionMatrix * mvPosition;',
            '}'

        ].join('\n'),

        fragmentShader: [

            // 'uniform vec3 color;',

            'uniform float opacity;',

            'uniform sampler2D texture;',

            'varying vec3 vColor;',

            'varying vec3 lineColor;',

            'varying float vOpacity;',

            'void main() {',

                // 'gl_FragColor = vec4( mix(vColor,lineColor,vOpacity), opacity*vOpacity );',

                'gl_FragColor = vec4( vColor, opacity*vOpacity );',

                'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );',

            '}'

        ].join('\n')

    }
};