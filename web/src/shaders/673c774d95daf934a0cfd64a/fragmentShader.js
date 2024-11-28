const fragmentShader = `

// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

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

      	float bx(vec2 st, vec2 sz, vec2 crt) {
      	    st = st-crt;

      	    vec2 rtl = smoothstep(sz, sz+.005, st);
      		float rt = rtl.x*rtl.y;

      	    vec2 rtt = smoothstep(sz, sz + .005, 1.-st);
      		float lt = rtt.x*rtt.y;

      	    return lt*rt;
      	}

      	    vec2 zooom(vec2 _st, float zoom) {
      	        _st *= zoom;
      	        _st.x -= floor(_st.y);
      	        return _st;
      	    }

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    
    vec2 stx = st;
    
    vec4 red = vec4(0.81,0.09,0.08, 1.);
    
    
    vec4 color = vec4(0.85,0.61,0.11, 1.);
    vec4 yellow = vec4(0.715,0.412,0.029,1.000);
    
    vec4 green = vec4(0.043,0.3,0.31, 1.);
    vec4 blue = vec4(0.025,0.543,1.000,0.1);
    vec4 blue2 = vec4(0.07,0.330,.63,1.);
    vec4 black = vec4(.0, .0,.0,1.);
          	float zm = 1.;
    
          	vec2 dt = vec2(.0);
    
    		st=tile(st,3.);
          	st = (st-dt)*zm;

          	vec2 index = vec2(.0);
            float size = 90.000;
      		vec2 sx = zooom(st,size);
          	index = floor(sx);
    
              
    		vec2 sz = vec2(-0.30,0.390);
            vec2 coord = vec2(-0.190,0.260);

    
    color = mix(color, yellow, random(st));
    
    if(mod(index.x +1.,3.) <2.) {
          	color = mix(color, red, bx(st, sz + vec2(0.785,-50.830), vec2(-0.17,0.)));
    }
      
    if(mod(index.x +1.,3.) <2.) {
          	color = mix(color, red, bx(st, sz + vec2(0.785,-0.830), vec2(0.17,.0)));
   } 

  // blue thin horizontal
    
       if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, blue2, bx(st, vec2(-0.,0.492), vec2(0.000,0.162)));
   }

         if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, blue2, bx(st, sz+vec2(0.042,0.10), coord +vec2(-0.0,-0.426)));
   }  
    
    
           if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, blue2, bx(st, vec2(-0.,0.492), vec2(-0.0,0.08)));
   }

         if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, blue2, bx(st, sz+vec2(0.042,0.10), coord +vec2(-0.00,-0.338)));
   }  

    

// red lines
           if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, red, bx(st, vec2(-0.05,0.423), vec2(0.0)));
   }
    
        	if(mod(index.x +1.,3.) <2.) {
          	color = mix(color, red, bx(st, vec2(0.423,-0.05), vec2(0.)));
   } 
    
// green vertical lines
    
       if(mod(index.x,3.) <2.) {
          	color = mix(color, green, bx(st, vec2(0.4108,-0.05), vec2(-0.3665,0.0)));
   }
    
    
    	if(mod(index.x,3.) <2.) {
          	color = mix(color, green, bx(st, vec2(0.4108,-0.05), vec2(0.367,0.000)));
   }

// green horizontal lines
       if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, green, bx(st, vec2(-0.05,.4108), vec2(0.,0.367)));
   }
    
       if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, green, bx(st, vec2(-0.05,.4108), vec2(0.0,-0.367)));
   }
    
 
// red horizontal thin
    
            if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, red, bx(st, vec2(.0, .486), vec2(.0, .18)));
   }

            if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, red, bx(st, vec2(.0, .486), vec2(0.000,-0.18)));
   }
    
          vec4 ucolor = mix(color, blue, bx(st, vec2(.0,.46), vec2(.0,.366)));
			color = mix(color, ucolor, ucolor.a);
    	
    	          vec4 icolor = mix(color, blue, bx(st, vec2(.0,.46), vec2(.0, -.37)));
			color = mix(color, icolor, icolor.a);
     	
    	          vec4 ycolor = mix(color, blue, bx(st, vec2(0.46,0.), vec2(0.37,0.)));
			color = mix(color, ycolor, ycolor.a);

      // blue thin lines vertical
    
	       if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, blue2, bx(st, vec2(0.494,0.), vec2(-0.074,0.0)));
   }
	       if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, blue2, bx(st, vec2(0.494,0.), vec2(0.074,0.000)));
   }
    
    	       if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, blue2, bx(st, vec2(0.494,0.), vec2(-0.152,-0.0)));
   }
    
    	       if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, blue2, bx(st, vec2(0.494,0.), vec2(0.152,0.000)));
   }
    
//black horizontal thin lines
      if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, black, bx(st, vec2(-0.,0.493), vec2(0.0,0.122)));
   }
    
      if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, black, bx(st, vec2(-0.,0.493), vec2(.0,-0.122)));
   }
    
    
    //black vertical thin lines
      if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, black, bx(st, vec2(0.492,.0), vec2(-0.113,0.)));
   }
    
      if(mod(index.x +2.,3.) <2.) {
          	color = mix(color, black, bx(st, vec2(0.492,.0), vec2(0.113,0.0)));
   }
    
    		    	          vec4 ylcolor = mix(color, blue, bx(st, vec2(0.460,.0), vec2(-0.370,0.0)));
			color = mix(color, ylcolor, ylcolor.a);
    
    color = mix(color, black, stx.y*(.6-stx.y));
    gl_FragColor = vec4(color);

} 

`

export default fragmentShader
