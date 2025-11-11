precision highp float;

uniform vec3 color;
uniform float time;

varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vec3 light = vec3(0.0, 1.0, 0.0);
    float intensity = dot(vNormal, light) * 0.5 + 0.5;
    
    vec3 baseColor = color * intensity;
    vec3 pulse = vec3(sin(time * 2.0) * 0.1 + 0.9);
    
    gl_FragColor = vec4(baseColor * pulse, 0.8);
}