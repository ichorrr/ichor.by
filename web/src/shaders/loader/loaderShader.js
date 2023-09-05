const fragmentShader = `

      #ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}


float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}


vec3 rgb2hsb( in vec3 c ){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}

float shape(vec2 st, float radius) {
	st = vec2(0.5);
    float r = length(st)*2.248;
    float a = atan(st.y,st.x);
	
    float f = radius;
    f += sin(a*15.)*0.044*noise(st);

    return 1.-smoothstep(f,f+0.007,r);
}

float shapeBorder(vec2 st, float radius, float width) {
    return shape(st,radius)-shape(st,radius-width);
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    vec3 color = vec3(0.);
    
    
    float r = length(st - vec2(.5));
    float a = atan(st.y, st.x);
    

    float f = abs(mod(sin(a)*.8,2.596))/3.008;
    
    color.r +=smoothstep(0.260, 0.352, r)*smoothstep(0.308, 0.292, r);
    color.g +=smoothstep(0.284, 0.304, r)*smoothstep(0.348, 0.204, r);
    color.b +=smoothstep(0.228, 0.336, r)*smoothstep(0.316, 0.300, r);
    
    color.b +=smoothstep(0.140, 0.248, r*0.708)*smoothstep(0.292, 0.140, r*0.716);
    
    color.r +=smoothstep(f, f+0.156, r*0.564) -smoothstep(f, f + 0.084, r*0.456+0.044);
    
    color += mix(color.r, color.g, r*-0.438)*noise(st)*sin(u_time)*7.2;
    color += mix(color.r, color.b, r*1.522*noise(st)*sin(u_time)*7.2);

    gl_FragColor = vec4(color,1.0);
}

`

export default fragmentShader
