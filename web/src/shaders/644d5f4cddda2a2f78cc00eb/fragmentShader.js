const fragmentShader = `


#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

vec2 random2( vec2 p ) {
return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float snoise(vec2 v) {
const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                -0.577350269189626,  // -1.0 + 2.0 * C.x
                0.024390243902439); // 1.0 / 41.0
vec2 i  = floor(v + dot(v, C.yy) );
vec2 x0 = v -   i + dot(i, C.xx);
vec2 i1;
i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
vec4 x12 = x0.xyxy + C.xxzz;
x12.xy -= i1;
i = mod289(i);
vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
+ i.x + vec3(0.0, i1.x, 1.0 ));

vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
m = m*m ;
m = m*m ;
vec3 x = 2.0 * fract(p * C.www) - 1.0;
vec3 h = abs(x) - 0.5;
vec3 ox = floor(x + 0.5);
vec3 a0 = x - ox;
m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
vec3 g;
g.x  = a0.x  * x0.x  + h.x  * x0.y;
g.yz = a0.yz * x12.xz + h.yz * x12.yw;
return 130.0 * dot(m, g);
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

vec3 hsb2rgb( in vec3 c ){
vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                     6.0)-3.0)-1.0,
             0.0,
             1.0 );
rgb = rgb*rgb*(3.0-2.0*rgb);
return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
vec2 st = gl_FragCoord.xy/u_resolution.xy;
st.x *= u_resolution.x/u_resolution.y;

vec3 color = vec3(0.);
vec3 color2 = vec3(0.);
vec2 vel = vec2(u_time*.1);
float r = length(st)*snoise(st + vel)*3.;

float a = atan(st.y, st.x);

color = hsb2rgb(vec3(r-u_time/6.280,1.,2.576-r));

vec3 mcolor = mix(color, color2, 1.-r+snoise(st*.3 + vec2(r)));
color+=mix(mcolor, color, r*2.944);

gl_FragColor = vec4(mcolor+color,1.0);
}

`

export default fragmentShader
