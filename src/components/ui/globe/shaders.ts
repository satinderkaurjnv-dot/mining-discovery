/**
 * GLSL for the hero globe.
 *
 * Two materials:
 *  - earth      : lit sphere with a soft day/night terminator, ocean-only specular,
 *                 cheap coastal relief derived from the mask gradient, sparse city
 *                 lights on the night side, and a sunset band at the terminator.
 *  - atmosphere : slightly larger shell producing the limb haze. It uses normal
 *                 blending rather than additive, because the hero sits on a white
 *                 card where additive light would be invisible.
 */

export const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalWorld;
  varying vec3 vTangentWorld;
  varying vec3 vBitangentWorld;
  varying float vLatitudeCos;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;

    // Build the tangent frame here: modelMatrix is only available to the vertex
    // stage, and the transform is linear, so perturbing the interpolated world-space
    // frame in the fragment shader gives the same result as perturbing in object space.
    vec3 n = normalize(normal);
    vec3 t = normalize(cross(vec3(0.0, 1.0, 0.0), n) + vec3(1e-5, 0.0, 0.0)); // east
    vec3 b = cross(n, t);                                                     // north

    mat3 model = mat3(modelMatrix);
    vNormalWorld = normalize(model * n);
    vTangentWorld = normalize(model * t);
    vBitangentWorld = normalize(model * b);

    // Meridians converge toward the poles, so a fixed step in u spans less surface
    // there. Clamped so high latitudes do not turn the relief into noise.
    vLatitudeCos = max(sqrt(max(1.0 - n.y * n.y, 0.0)), 0.25);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const earthFragmentShader = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uMaskMap;
  uniform vec2 uMaskTexel;
  uniform vec3 uSunDirection;
  uniform vec3 uHazeColor;
  uniform float uAmbient;
  uniform float uSunIntensity;
  uniform float uReliefStrength;
  uniform float uHazeStrength;
  uniform float uOpacity;
  uniform float uDesaturate;
  uniform float uSpecularStrength;
  uniform float uLimbDarkening;

  varying vec2 vUv;
  varying vec3 vNormalWorld;
  varying vec3 vTangentWorld;
  varying vec3 vBitangentWorld;
  varying float vLatitudeCos;
  varying vec3 vWorldPosition;

  void main() {
    // --- Coastal / terrain relief -------------------------------------------------
    float hL = texture2D(uMaskMap, vUv - vec2(uMaskTexel.x, 0.0)).r;
    float hR = texture2D(uMaskMap, vUv + vec2(uMaskTexel.x, 0.0)).r;
    float hD = texture2D(uMaskMap, vUv - vec2(0.0, uMaskTexel.y)).r;
    float hU = texture2D(uMaskMap, vUv + vec2(0.0, uMaskTexel.y)).r;

    vec3 N = normalize(
      normalize(vNormalWorld)
      - (
          ((hR - hL) / vLatitudeCos) * normalize(vTangentWorld)
          + (hU - hD) * normalize(vBitangentWorld)
        ) * uReliefStrength
    );

    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(uSunDirection);

    float mask = texture2D(uMaskMap, vUv).r;
    float land = smoothstep(0.04, 0.14, mask);

    // --- Day / night lighting & sunset twilight -----------------------------------
    float ndl = dot(N, L);
    float daylight = smoothstep(-0.25, 0.45, ndl);
    
    // Warm golden/amber rim at the terminator (sunset / sunrise zone)
    float terminator = smoothstep(-0.28, 0.12, ndl) * (1.0 - smoothstep(0.08, 0.48, ndl));
    vec3 sunsetColor = vec3(1.0, 0.72, 0.32);

    vec3 albedo = texture2D(uDayMap, vUv).rgb;

    // Combine diffuse daylight + sunset warmth
    vec3 litColor = albedo * (uAmbient * 1.1 + uSunIntensity * daylight * 1.25) + sunsetColor * terminator * 0.45 * land;

    // --- Night-side city lights & mineral luminescence -----------------------------
    // Extract high-elevation peaks & urban hubs on the dark hemisphere
    float nightLightStrength = smoothstep(0.60, 0.95, mask) * land;
    vec3 nightLightColor = vec3(1.0, 0.85, 0.45) * nightLightStrength * 2.8 * (1.0 - daylight);
    litColor += nightLightColor;

    vec3 color = litColor;

    // --- Limb darkening -------------------------------------------------------------
    float grazing = 1.0 - max(dot(normalize(vNormalWorld), V), 0.0);
    color *= mix(1.0, 1.0 - uLimbDarkening * 0.75, grazing * grazing);

    // --- Ocean sheen (dual specular lobes) -----------------------------------------
    vec3 halfway = normalize(L + V);
    float specBase = max(dot(N, halfway), 0.0);
    float sharpSpec = pow(specBase, 64.0);
    float broadSpec = pow(specBase, 16.0) * 0.35;
    float specular = (sharpSpec + broadSpec) * (1.0 - land) * daylight;
    
    // Radiant gold-tinted digital mineral and water sheen
    vec3 specColor = vec3(1.0, 0.88, 0.55);
    color += specColor * specular * (uSpecularStrength * 1.35);

    // --- Digital Cyber Fresnel Rim Glow --------------------------------------------
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.2);
    vec3 cyberRim = mix(vec3(0.35, 0.65, 0.95), vec3(0.95, 0.82, 0.45), land);
    color += cyberRim * fresnel * 0.65 * uHazeStrength;

    // Edge softening for seamless alpha composite
    float edgeSoftening = mix(0.78, 1.0, 1.0 - fresnel);

    gl_FragColor = vec4(color, uOpacity * edgeSoftening);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const cloudVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalWorld;

  void main() {
    vUv = uv;
    vNormalWorld = normalize(mat3(modelMatrix) * normal);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

export const cloudFragmentShader = /* glsl */ `
  uniform sampler2D uCloudMap;
  uniform vec3 uSunDirection;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vNormalWorld;

  void main() {
    vec3 N = normalize(vNormalWorld);
    float daylight = smoothstep(-0.35, 0.65, dot(N, normalize(uSunDirection)));

    float coverage = texture2D(uCloudMap, vUv).a;

    // Clouds catch warm sun on the lit side and settle into soft blue-grey on night side
    vec3 dayCloudColor = vec3(0.98, 0.99, 1.0);
    vec3 nightCloudColor = vec3(0.55, 0.62, 0.72);
    vec3 color = mix(nightCloudColor, dayCloudColor, daylight);
    float alpha = coverage * uOpacity * mix(0.48, 1.0, daylight);

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormalWorld;
  varying vec3 vWorldPosition;

  void main() {
    vNormalWorld = normalize(mat3(modelMatrix) * normal);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSunDirection;
  uniform float uStrength;
  uniform float uLimb;
  uniform float uInnerFalloff;

  varying vec3 vNormalWorld;
  varying vec3 vWorldPosition;

  void main() {
    vec3 N = normalize(vNormalWorld);
    vec3 V = normalize(cameraPosition - vWorldPosition);

    float d = max(dot(N, V), 0.0);
    float outward = smoothstep(0.0, 1.0, d / uLimb);
    float inward = exp(-max(d - uLimb, 0.0) * uInnerFalloff);
    
    float sunDot = dot(N, normalize(uSunDirection));
    float lit = smoothstep(-0.38, 0.60, sunDot);
    
    // Twilight warmth along the rim
    float sunsetRim = smoothstep(-0.25, 0.15, sunDot) * (1.0 - smoothstep(0.15, 0.55, sunDot));
    vec3 dynamicAtmosphereColor = mix(uColor, vec3(0.95, 0.75, 0.52), sunsetRim * 0.45);

    float alpha = outward * inward * (0.22 + 0.78 * lit) * uStrength;

    gl_FragColor = vec4(dynamicAtmosphereColor, clamp(alpha, 0.0, 1.0));
  }
`;
