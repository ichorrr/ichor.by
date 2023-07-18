const fragmentShader = `

      	#ifdef GL_ES
      	precision highp float;
      	#endif

      	#define PI 3.14159265359

      	uniform vec2 u_resolution;
      	uniform float u_time;

      	vec2 rotate2D(vec2 _st, float _angle){
      	    _st -= 0.5;
      	    _st =  mat2(cos(_angle),-sin(_angle),
      	                sin(_angle),cos(_angle)) * _st;
      	    _st += 0.5;
      	    return _st;
      	}

      		vec2 tile (vec2 _st, float _zoom) {
      	    _st *= _zoom;
      	    return fract(_st);
      	}


      	    vec2 zooom(vec2 _st, float zoom) {
      	        _st *= zoom;
      	        _st.x -= floor(_st.y);
      	        return _st;
      	    }

      	    vec2 zooom2(vec2 _st2, float zoom) {
      	        _st2 *= zoom;
      	        _st2.x += floor(_st2.y);
      	        return _st2;
      	    }

      	float bx(vec2 st, vec2 sz, vec2 crt) {
      	    st = st-crt;

      	    vec2 rtl = step(sz, st);
      		float rt = rtl.x*rtl.y;

      	    vec2 rtt = step(sz, 1.-st);
      		float lt = rtt.x*rtt.y;

      	    return lt*rt;
      	}

      void main(){
      	vec2 st = gl_FragCoord.xy/u_resolution.xy;
          	st.x *= u_resolution.x/u_resolution.y;

          	vec3 color = vec3(0.14,0.14,0.15);


            	st = rotate2D(st,PI*0.25);
      		st = tile(st,5.208);

          	float zm = 0.87;
          	vec2 dt = vec2(-0.06,-0.080);
          	st = (st-dt)*zm;

          	vec2 index = vec2(0., 0.);
         		 // Scale up the space by 3


          float size = 90.;
      		vec2 sx = zooom(st,size);
          	index = floor(sx);


              vec2 sz = vec2(0.090);
              vec2 coord = vec2(0.0);


              if(mod(index.x +2.,4.0) < 2.) {
                  // blue box top left
                  color = mix(color, vec3(0.05,0.22,0.35), bx(st, vec2(0.37), vec2(-0.32,0.31)));
              }

              if(mod(index.x +3.,4.0) < 2.) {
                  // blue box bottom right
                  color = mix(color, vec3(0.05,0.22,0.35), bx(st, vec2(0.37), vec2(0.31,-0.31)));
              }


          	if(mod(index.x +1.,4.0)  < 2. && st.x > 0.5 && st.y < 0.5) {
                  vec2 sz = vec2(0.111,0.122);
                  vec2 coord = vec2(-0.0);
                   color = mix(color, vec3(0.), bx(st, sz, coord)-bx(st, sz + vec2(0.022,0.02), coord));
          	}

              	if(mod(index.x + 4.,4.0)  < 2. && st.x < 0.5 && st.y > 0.5) {
                  vec2 sz = vec2(0.122,0.111);
                  vec2 coord = vec2(-0.0);
                   color = mix(color, vec3(0.), bx(st, sz, coord)-bx(st, sz + vec2(0.022,0.024), coord));
          	}


          	if(mod(index.x + 5.,4.0) < 2. && st.x > 0.5 && st.y < 0.5) {
      		vec2 sz = vec2(.09, .1);
              //black box bottom right
              color = mix(color, vec3(0.010,0.001,0.001), bx(st, vec2(0.16, .17), vec2(-0.0)));
          	color = mix(color, vec3(0.65,0.,0.05), bx(st, sz, coord)-bx(st, sz + .02, coord));
                  color = mix(color, vec3(0.82,0.63,0.51), bx(st, vec2(0.425, 0.435), vec2(-0.0)));
          	}

              if(mod(index.x + 4.,4.0) +.5 < 2. && st.x < 0.5 && st.y > 0.5) {
      		vec2 sz = vec2(.1, .09);
              //black box  left top
              color = mix(color, vec3(0.010,0.001,0.001), bx(st, vec2(0.17, .16), vec2(-0.0)));
          	color = mix(color, vec3(0.65,0.,0.05), bx(st, sz, coord)-bx(st, sz + .02, coord));
              color = mix(color, vec3(0.82,0.63,0.51), bx(st, vec2(0.435, 0.425), vec2(-0.0)));
          	}

          	sx = zooom2(st,size);
          	index = floor(sx);

           	if(mod(index.x + 1.,4.0) < 2.) {
              // blue box right top
              color = mix(color, vec3(0.05,0.22,0.35), bx(st, vec2(0.374, .368), vec2(0.31, 0.31)));
          	}

          	if(mod(index.x,4.0) < 2.) {
              // blue box left bottom
              color = mix(color, vec3(0.05,0.22,0.35), bx(st, vec2(0.37), vec2(-0.32,-0.31)));
          	}


      		if(mod(index.x + 3.,4.0)  < 2. && st.x > 0.5 && st.y > 0.5) {
      	      vec2 sz = vec2(0.111,0.111);
              color = mix(color, vec3(0.), bx(st, sz, coord)-bx(st, sz + 0.022, coord));
          	}

          	if(mod(index.x + 2.,4.0)  < 2. && st.x < 0.5 && st.y < 0.5) {
      	      vec2 sz = vec2(0.122,0.122);
              color = mix(color, vec3(0.), bx(st, sz, coord)-bx(st, sz + 0.022, coord));
          	}

              if(mod(index.x + 2.,4.0) < 2. && st.x < 0.5 && st.y < 0.5 ) {
                  vec2 sz = vec2(.1, .1);
               // black box bottom left
              color = mix(color, vec3(0.020,0.020,0.008), bx(st, vec2(0.17), vec2(-0.0)));
              color = mix(color, vec3(0.65,0.,0.05), bx(st, sz, coord)-bx(st, sz + .02, coord));
      		    color = mix(color, vec3(0.82,0.63,0.51), bx(st, vec2(0.435), vec2(-0.0)));

              }

              if(mod(index.x + 3.,4.0)  < 2. && st.x > 0.5 && st.y > 0.5) {
               // black box   right top
              color = mix(color, vec3(0.), bx(st, vec2(0.160,0.160), vec2(-0.0)));
              color = mix(color, vec3(0.65,0.,0.05), bx(st, sz, coord)-bx(st, sz + 0.02, coord));
              color = mix(color, vec3(0.82,0.63,0.51), bx(st, vec2(0.425), vec2(-0.0)));

              }

      	    	float dln =0.468- length(st*0.908 - vec2(0.380,0.290));
      				color *= mix(vec3(1.), vec3(0.), dln);

      	    gl_FragColor = vec4(color,1.0);

      			}

`

export default fragmentShader
