#ifdef GL_ES
precision highp float;
#endif

uniform vec3 vLimits;
uniform vec3 vLightPosition;

// UVs
varying vec4 vGroundSnowUV;
varying vec4 vGrassBlendUV;
varying vec4 vRockSandUV;

// Samplers
uniform sampler2D groundSampler;
uniform sampler2D sandSampler;
uniform sampler2D rockSampler;
uniform sampler2D snowSampler;
uniform sampler2D grassSampler;
uniform sampler2D blendSampler;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;

#ifdef CLIPPLANE
varying float fClipDistance;
#endif

#ifdef SHADOWS
varying vec4 vPositionFromLight0;
uniform sampler2D shadowSampler0;
uniform vec3 shadowsInfo0;

float unpack(vec4 color)
{
	const vec4 bit_shift = vec4(1.0 / (255.0 * 255.0 * 255.0), 1.0 / (255.0 * 255.0), 1.0 / 255.0, 1.0);
	return dot(color, bit_shift);
}

// Shadows
float computeShadow(vec4 vPositionFromLight, sampler2D shadowSampler, float darkness, float bias)
{
	vec3 depth = vPositionFromLight.xyz / vPositionFromLight.w;
	depth = 0.5 * depth + vec3(0.5);
	vec2 uv = depth.xy;

	if (uv.x < 0. || uv.x > 1.0 || uv.y < 0. || uv.y > 1.0)
	{
		return 1.0;
	}

	float shadow = unpack(texture2D(shadowSampler, uv)) + bias;

	if (depth.z > shadow)
	{
		return darkness;
	}
	return 1.;
}
#endif

void main(void) {
	// Clip plane
#ifdef CLIPPLANE
	if (fClipDistance > 0.0)
		discard;
#endif

	// Light
	vec3 lightVectorW = normalize(vLightPosition - vPositionW);

	// diffuse
	float ndl = max(0., dot(vNormalW, lightVectorW));
	
	// Shadow
	float shadow = computeShadow(vPositionFromLight0, shadowSampler0, shadowsInfo0.x, shadowsInfo0.z);
	//float shadow = 1.0;

	// Final composition
	vec3 finalColor = vec3(0., 0., 0.);
	vec2 uvOffset = vec2(1.0 / 512.0, 1.0 / 512.0);

	if (vPositionW.y <= vLimits.x) 
	{
		float lowLimit = vLimits.x - 2.;
		float gradient = clamp((vPositionW.y - lowLimit) / (vLimits.x - lowLimit), 0., 1.);

		float blend = texture2D(blendSampler, vGrassBlendUV.zw).r;
		vec3 groundColor = texture2D(groundSampler, vGroundSnowUV.xy).rgb * (1.0 - blend) + blend * texture2D(grassSampler, vGrassBlendUV.xy).rgb;

		finalColor = shadow * ndl * (texture2D(sandSampler, vRockSandUV.zw).rgb * (1.0 - gradient) + gradient * groundColor);
	}
	else if (vPositionW.y > vLimits.x && vPositionW.y <= vLimits.y)
	{
		float lowLimit = vLimits.y - 10.;
		float gradient = clamp((vPositionW.y - lowLimit) / (vLimits.y - lowLimit), 0., 1.);

		float blend = texture2D(blendSampler, vGrassBlendUV.zw).r;
		vec3 currentColor = texture2D(groundSampler, vGroundSnowUV.xy).rgb * (1.0 - blend) + blend  * texture2D(grassSampler, vGrassBlendUV.xy).rgb;

		finalColor = shadow * ndl * (currentColor * (1.0 - gradient) + gradient * texture2D(rockSampler, vRockSandUV.xy + uvOffset).rgb);
	}
	else if (vPositionW.y > vLimits.y && vPositionW.y <= vLimits.z)
	{
		float lowLimit = vLimits.z - 12.;
		float gradient = clamp((vPositionW.y - lowLimit) / (vLimits.z - lowLimit), 0., 1.);

		finalColor = shadow * ndl * (texture2D(rockSampler, vRockSandUV.xy + uvOffset).rgb * (1.0 - gradient)) + gradient *(ndl * texture2D(snowSampler, vGroundSnowUV.zw).rgb);
	}
	else
	{
		finalColor = texture2D(snowSampler, vGroundSnowUV.zw).rgb * ndl * shadow;
	}

	gl_FragColor = vec4(finalColor, 1.);
}