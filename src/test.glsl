#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load

float plot(vec2 st, float pct){
  return  smoothstep( pct-0.12, pct, st.y) -
          smoothstep( pct, pct+0.12, st.y);
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    vec2 pos = vec2(0.5)-st;

    float r = length(pos)*2.0 ;
    float a = atan(pos.y,pos.x) ; //* abs(sin(u_time));

    float f = cos(a*3.);
    //f = abs(cos(a*3.)) ;
    //f = abs(cos(a*2.5))*.5+.3;
    //f = abs(cos(a*12.)*sin(a*3.))*.8+.1;
    //f = smoothstep(-.5,1., cos(a*10.))*0.2+0.5;

    float pct = plot(st, f);


    color = vec3( 1.-smoothstep(f,f+0.02,r) ) * pct * vec3(0.8118, 0.0, 0.0);

    gl_FragColor = vec4(color, 1.0);
}

//y = mod(x,0.5); // return x modulo of 0.5
//y = fract(x); // return only the fraction part of a number
//y = ceil(x);  // nearest integer that is greater than or equal to x
//y = floor(x); // nearest integer less than or equal to x
//y = sign(x);  // extract the sign of x
//y = abs(x);   // return the absolute value of x
//y = clamp(x,0.0,1.0); // constrain x to lie between 0.0 and 1.0
//y = min(0.0,x);   // return the lesser of x and 0.0
//y = max(0.0,x);   // return the greater of x and 0.0 
