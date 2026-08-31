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
    // Sample the mask around the fragment and rebuild a tangent-space gradient.
    // Tangent runs east, bitangent runs north, matching the equirectangular layout.
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

    // --- Day / night --------------------------------------------------------------
    // The terminator is the single strongest cue that this is a ball and not a disc, so
    // it is tightened to roughly half its old span and sits on a much lower ambient
    // floor. Still soft-edged — the planet is composited over a white band and a hard
    // shadow line would read as a smudge — but now it actually turns the surface away.
    float ndl = dot(N, L);
    float daylight = smoothstep(-0.15, 0.40, ndl);

    vec3 albedo = texture2D(uDayMap, vUv).rgb;

    // Pull saturation down before lighting so the whole globe stays in the muted
    // green/brown/grey and blue-grey range the hero calls for.
    float luma = dot(albedo, vec3(0.2126, 0.7152, 0.0722));
    albedo = mix(albedo, vec3(luma), uDesaturate);

    vec3 color = albedo * (uAmbient + uSunIntensity * daylight);

    // --- Limb darkening -------------------------------------------------------------
    float grazing = 1.0 - max(dot(normalize(vNormalWorld), V), 0.0);
    color *= mix(1.0, 1.0 - uLimbDarkening, grazing * grazing);

    // --- Ocean sheen ---------------------------------------------------------------
    vec3 halfway = normalize(L + V);
    float specular = pow(max(dot(N, halfway), 0.0), 58.0) * (1.0 - land) * daylight;
    color += vec3(0.52, 0.64, 0.78) * specular * uSpecularStrength;

    // Razor-sharp 3D silhouette edge with 100% solid opacity (zero haze, zero blur)
    gl_FragColor = vec4(color, uOpacity);

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
    float daylight = smoothstep(-0.45, 0.72, dot(N, normalize(uSunDirection)));

    float coverage = texture2D(uCloudMap, vUv).a;

    // Clouds only catch the light they are given; on the unlit side they fade out
    // cleanly rather than creating a blurry grey haze.
    vec3 color = vec3(1.0);
    float alpha = coverage * uOpacity * daylight;

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
  /** dot(N, V) at which a view ray grazes the earth surface: sqrt(1 - (1/shellRadius)^2). */
  uniform float uLimb;
  uniform float uInnerFalloff;

  varying vec3 vNormalWorld;
  varying vec3 vWorldPosition;

  void main() {
    vec3 N = normalize(vNormalWorld);
    vec3 V = normalize(cameraPosition - vWorldPosition);

    // Front faces with depth testing off. The profile has to fall back to zero at the
    // shell silhouette (d = 0) or the halo terminates in a hard ring; it peaks around
    // the limb of the earth beneath and decays toward the centre of the disc.
    float d = max(dot(N, V), 0.0);
    float outward = smoothstep(0.0, 1.0, d / uLimb);
    float inward = exp(-max(d - uLimb, 0.0) * uInnerFalloff);
    float lit = smoothstep(-0.10, 0.45, dot(N, normalize(uSunDirection)));

    // Atmosphere rim only appears on the sunlit limb — dark side has zero blurry halo
    float alpha = outward * inward * lit * uStrength;

    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 1.0));
  }
`;
