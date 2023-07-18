const fragmentShader = `

// Author: @patriciogv - 2015
// Title: Metaballs

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


vec3 crcl(vec2 v, vec2 _st, float n){
  float rr = length(_st - v);
  return vec3(smoothstep(-0.265, -0.210, rr*n-0.33) - smoothstep(-0.16, -0.096, rr*n-.376));
}

vec3 path(vec2 _st, float xx){
  float r = length(_st);
  return vec3(smoothstep(0.89, 0.906, r - 0.28+0.087*xx-.06) - smoothstep(.989, 1.006, r-0.28+0.087*xx));
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec3 color = vec3(.0);

  // Scale
  st *= 3.;

  // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  st = st - vec2(1.5)+-vec2(0.010,0.010);
float r = length(st);
float a = atan(st.y, st.x);

//12
  color = path(st, -1.);

// 12*1*l
    if(st.x/st.y > -0.074){ color += crcl(vec2(-0.093, 1.211), st, 3.960); }

// 12*1*r
    if(st.x/st.y < 0.074){ color += crcl(vec2(0.087,1.211), st, 3.960); }

// 12*2*r
    if(st.x/st.y < 0.098){ color += crcl(vec2(0.087,.9495), st, 3.960); }

// 12*2*l
    if(st.x/st.y > -0.098){ color += crcl(vec2(-0.093,0.949), st, 3.960); }

// 12*3*r
    if(st.x/st.y < 0.170){ color += crcl(vec2(0.087,0.511), st, 3.960); }

// 12*3*l
    if(st.x/st.y > -0.170){ color += crcl(vec2(-0.093,0.51), st, 3.960); }


// 6*1*l
    if(st.x/st.y < 0.326){ color += crcl(vec2(-0.14,-0.408), st, 3.960); }

// 6*1*r
    if(st.x/st.y > -0.230){ color += crcl(vec2(0.1,-0.419), st, 3.960); }

// 6*2*l
    if(st.x/st.y <0.242){ color += crcl(vec2(-0.140,-0.589), st, 3.960); }

// 6*3*l
    if(st.x/st.y <0.152){ color += crcl(vec2(-0.140,-0.943), st, 3.960); }

// 6*4*l
    if(st.x/st.y <0.126){ color += crcl(vec2(-0.140,-1.119), st, 3.960); }

// 6*2*r
    if(st.x/st.y > -0.288){ color += crcl(vec2(0.19,-0.666), st, 3.960); }

      // 6*3*r
    if(st.x/st.y > -0.188){ color += crcl(vec2(0.190,-1.023), st, 3.960); }

      // 6*4*r
    if(st.x/st.y > -0.160){ color += crcl(vec2(0.190,-1.199), st, 3.960); }

      // 3*1*r*t
    if(st.y/st.x < 0.097){ color += crcl(vec2(0.775,0.080), st, 3.960); }

    // 3*1*r*t
    if(st.y/st.x < 0.066){ color += crcl(vec2(1.212,0.080), st, 3.960); }

      // 3*1*r*b
    if(st.y/st.x > -0.114){ color += crcl(vec2(0.774,-0.090), st, 3.960); }

    // 3*2*r*b
    if(st.y/st.x > -0.074){ color += crcl(vec2(1.211,-0.090), st, 3.960); }

    // 3*1*r*t
    if(st.y/st.x > -0.114){ color += crcl(vec2(-0.688,0.080), st, 3.960); }

    // 3*1*r*t
    if(st.y/st.x > -0.083){ color += crcl(vec2(-1.037,0.084), st, 3.960); }

      // 3*1*r*b
    if(st.y/st.x < 0.14){ color += crcl(vec2(-0.686,-0.094), st, 3.960); }

    // 3*1*r*b
    if(st.y/st.x < 0.0858){ color += crcl(vec2(-1.036,-0.094), st, 3.960); }


  //11
  if(a >0.066 && a < 1.497   || a >1.768 && a < 3.4 || a >1.6446 && a < 3. || a >-1.4124 && a < -0.074 || a >-3.4 && a < -1.57){
  color += path(st, .0);}
    //10
      if(a >0.0662 && a < 1.497   || a >1.688 && a < 3.4 || a >1.644 && a < 3. || a >-1.412 && a < -0.074 || a >-3.4 && a < -1.696){
    color += path(st, 1.);}
          //09
              if(a > .00 && a < 3.059 || a >-3.057 && a < -1.696 || a >-1.385 && a < 0.){
          color += path(st, 2.);}
              //08
              if(a > .00 && a < 1.473 || a > 1.6685 && a < 3.0588 || a >-3.056 && a < -1.72 || a >-1.385 && a < 0.){
              color += path(st, 3.);}
                //07
              if(a >1.668 && a < 3.9 ||  a >0. && a < 1.473 ||  a >-1.526 && a < 0.  ||  a <-1.721 && a > -3.208 ){
                color += path(st, 4.);}
                  //06
                  if(a > 0.0965 || a < -0.1136   && a >-1.5222 || a < -1.568){
                  color += path(st, 5.);}
                    //05
                    if(a > 0.0965 && a < 3.028 || a >- 3.0026 && a < -1.568 || a >- 1.2905 && a < -0.1136){
                    color += path(st, 6.);}
                      //04
                      if(a >- 3.0026 && a < -1.808 || a >- 1.2905 && a < 3.028 ){
                      color += path(st, 7.);}
                      //03
                                              if(a >1.739 || a < 1.403 && a >-1.495 || a < -1.808  ){
                                            color += path(st, 8.);}
                        //02
                                                  if(a >1.7395 || a < 1.404  && a > -1.345 || a < -1.886){
                                                  color += path(st, 9.);}
                        //01
                                                      if(a >-1.345 || a < -1.886 ){
                                                      color += path(st, 10.);}

  color += vec3(smoothstep(.32, 0.31, r));

  color += vec3(step(-.044, st.x) - step(.001, st.x))*vec3(step(-.75, st.y) - step(.02, st.y));

  color += vec3(step(-.044, st.x) - step(.002, st.x))*vec3(step(-1.26, st.y) - step(-0.812, st.y));

  color += vec3(step(.04, st.x) - step(.084, st.x))*vec3(step(-0.828, st.y) - step(-0.540, st.y));

  color += vec3(step(.04, st.x) - step(.084, st.x))*vec3(step(-1.350, st.y) - step(-0.892, st.y));

  gl_FragColor = vec4(color,1.0);
}

`

export default fragmentShader
