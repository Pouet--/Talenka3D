var WORLDCASTOR = WORLDCASTOR || {};

(function () {
    
	WORLDCASTOR.DiffuseTextureEnabled = true;
    WORLDCASTOR.AmbientTextureEnabled = true;
    WORLDCASTOR.OpacityTextureEnabled = true;
    WORLDCASTOR.ReflectionTextureEnabled = true;
    WORLDCASTOR.EmissiveTextureEnabled = true;
    WORLDCASTOR.SpecularTextureEnabled = true;
    WORLDCASTOR.BumpTextureEnabled = true;
	WORLDCASTOR.FresnelEnabled = true;
	
	var FresnelParameters = (function () {
        function FresnelParameters() {
            this.isEnabled = true;
            this.leftColor = BABYLON.Color3.White();
            this.rightColor = BABYLON.Color3.Black();
            this.bias = 0;
            this.power = 1;
        }
        return FresnelParameters;
    })();
    BABYLON.FresnelParameters = FresnelParameters;
	
		WORLDCASTOR.GroundMaterial = function (name, scene, light) {
        
		BABYLON.Material.call(this, name, scene);
		
		var that = this;		
		var root = BABYLON.Engine.ShadersRepository;		
		this.texture1 = root+"textures/ground.jpg";
		this.texture2 = root+"textures/grass.jpg";
		this.texture3 = root+"textures/snow.jpg";
		this.texture4 = root+"textures/sand.png";
		this.texture5 = root+"textures/rock.jpg";
		this.texture6 = root+"textures/blend.png";			
		this.name = name;
        this.id = name;
        this.light = light;
        this._scene = this.getScene();
		
        scene.materials.push(this);
        
        this.groundTexture = new BABYLON.Texture(this.texture1, scene);
        this.groundTexture.uScale = 90.0;
        this.groundTexture.vScale = 90.0;
        this.grassTexture = new BABYLON.Texture(this.texture2, scene);
        this.grassTexture.uScale = 90.0;
        this.grassTexture.vScale = 90.0;
        this.snowTexture = new BABYLON.Texture(this.texture3, scene);
        this.snowTexture.uScale = 30.0;
        this.snowTexture.vScale = 30.0;        
        this.sandTexture = new BABYLON.Texture(this.texture4, scene);
        this.sandTexture.uScale = 32.0;
        this.sandTexture.vScale = 32.0;        
        this.rockTexture = new BABYLON.Texture(this.texture5, scene);
        this.rockTexture.uScale = 30.0;
        this.rockTexture.vScale = 30.0;
        this.blendTexture = new BABYLON.Texture(this.texture6, scene);
        this.blendTexture.uScale = 1.0;
        this.blendTexture.vScale = 1.0;
		this.blendTexture.uOffset = 0.16;
        this.blendTexture.vOffset = 0.16;
        this.blendTexture.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE;
        this.blendTexture.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE;		
        this.sandLimit = 2;
        this.rockLimit = 26;
        this.snowLimit = 50;
				
        this.ambientColor = new BABYLON.Color3(0, 0, 0);
        this.diffuseColor = new BABYLON.Color3(1, 1, 1);
        this.specularColor = new BABYLON.Color3(1, 1, 1);
        this.specularPower = 64;
        this.emissiveColor = new BABYLON.Color3(0, 0, 0);
		this.useAlphaFromDiffuseTexture = false;
		this.useSpecularOverAlpha = true;
        this._cachedDefines = null;
		
		this._renderTargets = new BABYLON.SmartArray(16);
		
        // Internals
        this._worldViewProjectionMatrix = BABYLON.Matrix.Zero();
        this._lightMatrix = BABYLON.Matrix.Zero();
        this._globalAmbientColor = new BABYLON.Color3(0, 0, 0);
        this._scaledDiffuse = new BABYLON.Color3();
        this._scaledSpecular = new BABYLON.Color3();

		this.getRenderTargetTextures = function () {
            that._renderTargets.reset();

            if (that.reflectionTexture && that.reflectionTexture.isRenderTarget) {
                that._renderTargets.push(that.reflectionTexture);
            }

            return that._renderTargets;
        };		
    };	

  WORLDCASTOR.GroundMaterial.prototype = Object.create(BABYLON.Material.prototype);

    WORLDCASTOR.GroundMaterial.prototype.needAlphaBlending = function () {
       return (this.alpha < 1.0) || (this.opacityTexture != null) || this._shouldUseAlphaFromDiffuseTexture() || this.opacityFresnelParameters && this.opacityFresnelParameters.isEnabled;
    };

    WORLDCASTOR.GroundMaterial.prototype.needAlphaTesting = function () {
        return this.diffuseTexture != null && this.diffuseTexture.hasAlpha && !this.diffuseTexture.getAlphaFromRGB;
    };

    WORLDCASTOR.GroundMaterial.prototype._shouldUseAlphaFromDiffuseTexture = function () {
        return this.diffuseTexture != null && this.diffuseTexture.hasAlpha && this.useAlphaFromDiffuseTexture;
    };

    WORLDCASTOR.GroundMaterial.prototype.getAlphaTestTexture = function () {
        return this.diffuseTexture;
    };

    // Methods   
    WORLDCASTOR.GroundMaterial.prototype.isReady = function (mesh, useInstances) {
        var engine = this._scene.getEngine();
		var scene = this.getScene() || this._scene;
		
		if (this.checkReadyOnlyOnce) {
            if (this._wasPreviouslyReady) {
                return true;
            }
        } 

        if (!this.checkReadyOnEveryCall) {
            if (this._renderId === scene.getRenderId()) {
                return true;
            }
        }

        if (!this.groundTexture.isReady)
            return false;
        if (!this.snowTexture.isReady)
            return false;
        if (!this.sandTexture.isReady)
            return false;
        if (!this.rockTexture.isReady)
            return false;
        if (!this.grassTexture.isReady)
            return false;
      
        var engine = scene.getEngine(),
        defines = [],
        fallbacks = new BABYLON.EffectFallbacks(),
        needNormals = false,
        needUVs = false;
		
        // Textures
            if (scene.texturesEnabled) {
                if (this.diffuseTexture && WORLDCASTOR.DiffuseTextureEnabled) {
                    if (!this.diffuseTexture.isReady()) {
                        return false;
                    } else {
						needUVs = true;
                        defines.push("#define DIFFUSE");
                    }
                }

                if (this.ambientTexture && WORLDCASTOR.AmbientTextureEnabled) {
                    if (!this.ambientTexture.isReady()) {
                        return false;
                    } else {
						needUVs = true;
                        defines.push("#define AMBIENT");
                    }
                }

                if (this.opacityTexture && WORLDCASTOR.OpacityTextureEnabled) {
                    if (!this.opacityTexture.isReady()) {
                        return false;
                    } else {
						needUVs = true;
                        defines.push("#define OPACITY");
                        if (this.opacityTexture.getAlphaFromRGB) {
                            defines.push("#define OPACITY");
                        }
                    }
                }

                if (this.reflectionTexture && WORLDCASTOR.ReflectionTextureEnabled) {
                    if (!this.reflectionTexture.isReady()) {
                        return false;
                    } else {
						needNormals = true;
                        needUVs = true;
                        defines.push("#define REFLECTION");
						fallbacks.addFallback(0, "REFLECTION");
                    }
                }

                if (this.emissiveTexture && WORLDCASTOR.EmissiveTextureEnabled) {
                    if (!this.emissiveTexture.isReady()) {
                        return false;
                    } else {
						needUVs = true;
                        defines.push("#define EMISSIVE");
                    }
                }

                if (this.specularTexture && WORLDCASTOR.SpecularTextureEnabled) {
                    if (!this.specularTexture.isReady()) {
                        return false;
                    } else {
						needUVs = true;
                        defines.push("#define SPECULAR");
                        fallbacks.addFallback(0, "SPECULAR");
                    }
                }
            }

            if (scene.getEngine().getCaps().standardDerivatives && this.bumpTexture && WORLDCASTOR.BumpTextureEnabled) {
                if (!this.bumpTexture.isReady()) {
                    return false;
                } else {
					needUVs = true;
                    defines.push("#define BUMP");
                    fallbacks.addFallback(0, "BUMP");
                }
            }

           // Effect
            if (this.useSpecularOverAlpha) {
                defines.push("#define SPECULAROVERALPHA");
                fallbacks.addFallback(0, "SPECULAROVERALPHA");
            }

            if (scene.clipPlane) {
                defines.push("#define CLIPPLANE");
            }
			
			if (engine.getAlphaTesting()) {
                defines.push("#define ALPHATEST");
            }

            if (this._shouldUseAlphaFromDiffuseTexture()) {
                defines.push("#define ALPHAFROMDIFFUSE");
            }
			
			// Point size
            if (this.pointsCloud || scene.forcePointsCloud) {
                defines.push("#define POINTSIZE");
            }

            // Fog
			if (scene.fogEnabled && mesh && mesh.applyFog && scene.fogMode !== BABYLON.Scene.FOGMODE_NONE && this.fogEnabled) {
                defines.push("#define FOG");
                fallbacks.addFallback(1, "FOG");
            }

            var shadowsActivated = false;
            var lightIndex = 0;
            if (scene.lightsEnabled) {
                for (var index = 0; index < scene.lights.length; index++) {
                    var light = scene.lights[index];

                    if (!light.isEnabled()) {
                        continue;
                    }

                    // Excluded check
                    if (light._excludedMeshesIds.length > 0) {
                        for (var excludedIndex = 0; excludedIndex < light._excludedMeshesIds.length; excludedIndex++) {
                            var excludedMesh = scene.getMeshByID(light._excludedMeshesIds[excludedIndex]);

                            if (excludedMesh) {
                                light.excludedMeshes.push(excludedMesh);
                            }
                        }

                        light._excludedMeshesIds = [];
                    }

                    // Included check
                    if (light._includedOnlyMeshesIds.length > 0) {
                        for (var includedOnlyIndex = 0; includedOnlyIndex < light._includedOnlyMeshesIds.length; includedOnlyIndex++) {
                            var includedOnlyMesh = scene.getMeshByID(light._includedOnlyMeshesIds[includedOnlyIndex]);

                            if (includedOnlyMesh) {
                                light.includedOnlyMeshes.push(includedOnlyMesh);
                            }
                        }

                        light._includedOnlyMeshesIds = [];
                    }

                    if (!light.canAffectMesh(mesh)) {
                        continue;
                    }
					
					needNormals = true;
                    defines.push("#define LIGHT" + lightIndex);

                    if (lightIndex > 0) {
                        fallbacks.addFallback(lightIndex, "LIGHT" + lightIndex);
                    }

                    var type;
                    if (light instanceof BABYLON.SpotLight) {
                        type = "#define SPOTLIGHT" + lightIndex;
                    } else if (light instanceof BABYLON.HemisphericLight) {
                        type = "#define HEMILIGHT" + lightIndex;
                    } else {
                        type = "#define POINTDIRLIGHT" + lightIndex;
                    }

                    defines.push(type);
                    if (lightIndex > 0) {
                       fallbacks.addFallback(lightIndex, type.replace("#define ", ""));
                    }

                    // Shadows
                    if (scene.shadowsEnabled) {
                        var shadowGenerator = light.getShadowGenerator();
                        if (mesh && mesh.receiveShadows && shadowGenerator) {
                            defines.push("#define SHADOW" + lightIndex);
                            fallbacks.addFallback(0, "SHADOW" + lightIndex);
                            if (!shadowsActivated) {
                                defines.push("#define SHADOWS");
                                shadowsActivated = true;
                            }
                            if (shadowGenerator.useVarianceShadowMap || shadowGenerator.useBlurVarianceShadowMap) {
                                defines.push("#define SHADOWVSM" + lightIndex);
                                if (lightIndex > 0) {
                                    fallbacks.addFallback(0, "SHADOWVSM" + lightIndex);
                                }
                            }
                            if (shadowGenerator.usePoissonSampling) {
                                defines.push("#define SHADOWPCF" + lightIndex);
                                if (lightIndex > 0) {
                                    fallbacks.addFallback(0, "SHADOWPCF" + lightIndex);
                                }
                            }
                        }
                    }
                    lightIndex++;
                    if (lightIndex == this.maxSimultaneousLights)
                        break;
                }
            }
			if (WORLDCASTOR.FresnelEnabled) {
				// Fresnel
				if (this.diffuseFresnelParameters && this.diffuseFresnelParameters.isEnabled || this.opacityFresnelParameters && this.opacityFresnelParameters.isEnabled || this.emissiveFresnelParameters && this.emissiveFresnelParameters.isEnabled || this.reflectionFresnelParameters && this.reflectionFresnelParameters.isEnabled) {
					var fresnelRank = 1;

					if (this.diffuseFresnelParameters && this.diffuseFresnelParameters.isEnabled) {
						defines.push("#define DIFFUSEFRESNEL");
						fallbacks.addFallback(fresnelRank, "DIFFUSEFRESNEL");
						fresnelRank++;
					}

					if (this.opacityFresnelParameters && this.opacityFresnelParameters.isEnabled) {
						defines.push("#define OPSEASTEADITYFRESNEL");
						fallbacks.addFallback(fresnelRank, "OPSEASTEADITYFRESNEL");
						fresnelRank++;
					}

					if (this.reflectionFresnelParameters && this.reflectionFresnelParameters.isEnabled) {
						defines.push("#define REFLECTIONFRESNEL");
						fallbacks.addFallback(fresnelRank, "REFLECTIONFRESNEL");
						fresnelRank++;
					}

					if (this.emissiveFresnelParameters && this.emissiveFresnelParameters.isEnabled) {
						defines.push("#define EMISSIVEFRESNEL");
						fallbacks.addFallback(fresnelRank, "EMISSIVEFRESNEL");
						fresnelRank++;
					}
					needNormals = true;
					defines.push("#define FRESNEL");
					fallbacks.addFallback(fresnelRank - 1, "FRESNEL");
				}
			 }
			
			var attribs = [BABYLON.VertexBuffer.PositionKind];
		    if (mesh) {                
				if (needNormals && mesh.isVerticesDataPresent(BABYLON.VertexBuffer.NormalKind)) {
                    attribs.push(BABYLON.VertexBuffer.NormalKind);
                    defines.push("#define NORMAL");
                }
				
                if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.UVKind)) {
					attribs.push(BABYLON.VertexBuffer.UVKind);
					defines.push("#define UV1");
				}
				
				if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.UV2Kind)) {
					attribs.push(BABYLON.VertexBuffer.UV2Kind);
					defines.push("#define UV2");
				}
				
                if (mesh.useVertexColors && mesh.isVerticesDataPresent(BABYLON.VertexBuffer.ColorKind)) {
                    attribs.push(BABYLON.VertexBuffer.ColorKind);
                    defines.push("#define VERTEXCOLOR");
                    if (mesh.hasVertexAlpha) {
                        defines.push("#define VERTEXALPHA");
                    }
                }
				
                if (mesh.useBones) {
                    attribs.push(BABYLON.VertexBuffer.MatricesIndicesKind);
                    attribs.push(BABYLON.VertexBuffer.MatricesWeightsKind);
                    defines.push("#define BONES");
                    defines.push("#define BonesPerMesh " + (mesh.skeleton.bones.length + 1));
                    defines.push("#define BONES4");
                    fallbacks.addFallback(0, "BONES4");
                }

                // Instances
                if (useInstances) {
                    defines.push("#define INSTANCES");
                    attribs.push("world0");
                    attribs.push("world1");
                    attribs.push("world2");
                    attribs.push("world3");
                }
            }

		var join = defines.join("\n");
		if (this._cachedDefines != join) {
            this._cachedDefines = join;
			scene.resetCachedMaterial();
            this._effect = engine.createEffect("shaders/castor/ground", attribs, [
					"worldViewProjection", "groundMatrix", "sandMatrix", "rockMatrix", "snowMatrix", "grassMatrix", "blendMatrix", "vLightPosition", "vLimits",
					"world", "view", "viewProjection", "vEyePosition", "vLightsType", "vAmbientColor", "vDiffuseColor", "vSpecularColor", "vEmissiveColor",
                    "vLightData0", "vLightDiffuse0", "vLightSpecular0", "vLightDirection0", "vLightGround0", "lightMatrix0",
                    "vLightData1", "vLightDiffuse1", "vLightSpecular1", "vLightDirection1", "vLightGround1", "lightMatrix1",
                    "vLightData2", "vLightDiffuse2", "vLightSpecular2", "vLightDirection2", "vLightGround2", "lightMatrix2",
                    "vLightData3", "vLightDiffuse3", "vLightSpecular3", "vLightDirection3", "vLightGround3", "lightMatrix3",
                    "vFogInfos", "vFogColor", "pointSize",
                    "vDiffuseInfos", "vAmbientInfos", "vOpacityInfos", "vReflectionInfos", "vEmissiveInfos", "vSpecularInfos", "vBumpInfos",
                    "mBones",
                    "vClipPlane", "diffuseMatrix", "ambientMatrix", "opacityMatrix", "reflectionMatrix", "emissiveMatrix", "specularMatrix", "bumpMatrix",
                    "shadowsInfo0", "shadowsInfo1", "shadowsInfo2", "shadowsInfo3",
					"diffuseLeftColor", "diffuseRightColor", "opacityParts", "reflectionLeftColor", "reflectionRightColor", "emissiveLeftColor", "emissiveRightColor"
				], [
					"groundSampler", "sandSampler", "rockSampler", "snowSampler", "grassSampler", "blendSampler",
                    "diffuseSampler", "ambientSampler", "opacitySampler", "reflectionCubeSampler", "reflection2DSampler", "emissiveSampler", "specularSampler", "bumpSampler",
                    "shadowSampler0", "shadowSampler1", "shadowSampler2", "shadowSampler3"
                ], join, fallbacks, this.onCompiled, this.onError);
        }

        if (!this._effect.isReady()) {
            return false;
        }

		this._renderId = scene.getRenderId();
        this._wasPreviouslyReady = true;
        return true;
    };
	
	WORLDCASTOR.GroundMaterial.prototype.unbind = function () {
        if (this.reflectionTexture && this.reflectionTexture.isRenderTarget) {
            this._effect.setTexture("reflection2DSampler", null);
        }
    };

    WORLDCASTOR.GroundMaterial.prototype.bindOnlyWorldMatrix = function (world) {
        this._effect.setMatrix("world", world);
    };

    WORLDCASTOR.GroundMaterial.prototype.bind = function (world, mesh) {
		var scene = this.getScene();
		
        this.bindOnlyWorldMatrix(world);
		this._effect.setMatrix("viewProjection", scene.getTransformMatrix());
        this._effect.setMatrix("worldViewProjection", world.multiply(this._scene.getTransformMatrix()));        
        this._effect.setVector3("vLightPosition", this.light.position);

		// Bones
		if (mesh.useBones) {
			this._effect.setMatrices("mBones", mesh.skeleton.getTransformMatrices());
		}
		if (scene.getCachedMaterial() !== this) {
            if (WORLDCASTOR.FresnelEnabled) {
				// Fresnel
				if (this.diffuseFresnelParameters && this.diffuseFresnelParameters.isEnabled) {
					this._effect.setColor4("diffuseLeftColor", this.diffuseFresnelParameters.leftColor, this.diffuseFresnelParameters.power);
					this._effect.setColor4("diffuseRightColor", this.diffuseFresnelParameters.rightColor, this.diffuseFresnelParameters.bias);
				}

				if (this.opacityFresnelParameters && this.opacityFresnelParameters.isEnabled) {
					this._effect.setColor4("opacityParts", new BABYLON.Color3(this.opacityFresnelParameters.leftColor.toLuminance(), this.opacityFresnelParameters.rightColor.toLuminance(), this.opacityFresnelParameters.bias), this.opacityFresnelParameters.power);
				}

				if (this.reflectionFresnelParameters && this.reflectionFresnelParameters.isEnabled) {
					this._effect.setColor4("reflectionLeftColor", this.reflectionFresnelParameters.leftColor, this.reflectionFresnelParameters.power);
					this._effect.setColor4("reflectionRightColor", this.reflectionFresnelParameters.rightColor, this.reflectionFresnelParameters.bias);
				}

				if (this.emissiveFresnelParameters && this.emissiveFresnelParameters.isEnabled) {
					this._effect.setColor4("emissiveLeftColor", this.emissiveFresnelParameters.leftColor, this.emissiveFresnelParameters.power);
					this._effect.setColor4("emissiveRightColor", this.emissiveFresnelParameters.rightColor, this.emissiveFresnelParameters.bias);
				}
			}
			// Textures
			if (this.groundTexture) {
				this._effect.setTexture("groundSampler", this.groundTexture);
				this._effect.setMatrix("groundMatrix", this.groundTexture.getTextureMatrix());
			}
			
			if (this.sandTexture) {
				this._effect.setTexture("sandSampler", this.sandTexture);
				this._effect.setMatrix("sandMatrix", this.sandTexture.getTextureMatrix());
			}
			
			if (this.rockTexture) {
				this._effect.setTexture("rockSampler", this.rockTexture);
				this._effect.setMatrix("rockMatrix", this.rockTexture.getTextureMatrix());
			}
			
			if (this.snowTexture) {
				this._effect.setTexture("snowSampler", this.snowTexture);
				this._effect.setMatrix("snowMatrix", this.snowTexture.getTextureMatrix());
			}
			
			if (this.grassTexture) {
				this._effect.setTexture("grassSampler", this.grassTexture);
				this._effect.setMatrix("grassMatrix", this.grassTexture.getTextureMatrix());
			}
			
			if (this.blendTexture) {
				this._effect.setTexture("blendSampler", this.blendTexture);
				this._effect.setMatrix("blendMatrix", this.blendTexture.getTextureMatrix());
			}
			
			if (this.diffuseTexture && WORLDCASTOR.DiffuseTextureEnabled) {
                this._effect.setTexture("diffuseSampler", this.diffuseTexture);

                this._effect.setFloat2("vDiffuseInfos", this.diffuseTexture.coordinatesIndex, this.diffuseTexture.level);
                this._effect.setMatrix("diffuseMatrix", this.diffuseTexture.getTextureMatrix());
            }

            if (this.ambientTexture && WORLDCASTOR.AmbientTextureEnabled) {
                this._effect.setTexture("ambientSampler", this.ambientTexture);

                this._effect.setFloat2("vAmbientInfos", this.ambientTexture.coordinatesIndex, this.ambientTexture.level);
                this._effect.setMatrix("ambientMatrix", this.ambientTexture.getTextureMatrix());
            }

            if (this.opacityTexture && WORLDCASTOR.OpacityTextureEnabled) {
                this._effect.setTexture("opacitySampler", this.opacityTexture);

                this._effect.setFloat2("vOpacityInfos", this.opacityTexture.coordinatesIndex, this.opacityTexture.level);
                this._effect.setMatrix("opacityMatrix", this.opacityTexture.getTextureMatrix());
            }

            if (this.reflectionTexture && WORLDCASTOR.ReflectionTextureEnabled) {
                if (this.reflectionTexture.isCube) {
                    this._effect.setTexture("reflectionCubeSampler", this.reflectionTexture);
                } else {
                    this._effect.setTexture("reflection2DSampler", this.reflectionTexture);
                }

                this._effect.setMatrix("reflectionMatrix", this.reflectionTexture.getReflectionTextureMatrix());
                this._effect.setFloat3("vReflectionInfos", this.reflectionTexture.coordinatesMode, this.reflectionTexture.level, this.reflectionTexture.isCube ? 1 : 0);
            }

            if (this.emissiveTexture && WORLDCASTOR.EmissiveTextureEnabled) {
                this._effect.setTexture("emissiveSampler", this.emissiveTexture);

                this._effect.setFloat2("vEmissiveInfos", this.emissiveTexture.coordinatesIndex, this.emissiveTexture.level);
                this._effect.setMatrix("emissiveMatrix", this.emissiveTexture.getTextureMatrix());
            }

            if (this.specularTexture && WORLDCASTOR.SpecularTextureEnabled) {
                this._effect.setTexture("specularSampler", this.specularTexture);

                this._effect.setFloat2("vSpecularInfos", this.specularTexture.coordinatesIndex, this.specularTexture.level);
                this._effect.setMatrix("specularMatrix", this.specularTexture.getTextureMatrix());
            }

            if (this.bumpTexture && scene.getEngine().getCaps().standardDerivatives && WORLDCASTOR.BumpTextureEnabled) {
                this._effect.setTexture("bumpSampler", this.bumpTexture);

                this._effect.setFloat2("vBumpInfos", this.bumpTexture.coordinatesIndex, this.bumpTexture.level);
                this._effect.setMatrix("bumpMatrix", this.bumpTexture.getTextureMatrix());
            }
		
        
			this._effect.setFloat3("vLimits", this.sandLimit, this.rockLimit, this.snowLimit);
		
			// Clip plane
                if (scene.clipPlane) {
                    var clipPlane = scene.clipPlane;
                    this._effect.setFloat4("vClipPlane", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
                }
                // Point size
                if (this.pointsCloud) {
                    this._effect.setFloat("pointSize", this.pointSize);
                }			
			
			// Colors
				scene.ambientColor.multiplyToRef(this.ambientColor, this._globalAmbientColor);
				// Scaling down color according to emissive
                this._scaledSpecular.r = this.specularColor.r * BABYLON.MathTools.Clamp(1.0 - this.emissiveColor.r);
                this._scaledSpecular.g = this.specularColor.g * BABYLON.MathTools.Clamp(1.0 - this.emissiveColor.g);
                this._scaledSpecular.b = this.specularColor.b * BABYLON.MathTools.Clamp(1.0 - this.emissiveColor.b);
                this._effect.setVector3("vEyePosition", scene.activeCamera.position);
                this._effect.setColor3("vAmbientColor", this._globalAmbientColor);
                this._effect.setColor4("vSpecularColor", this._scaledSpecular, this.specularPower);
                this._effect.setColor3("vEmissiveColor", this.emissiveColor);
		}
				
			// Scaling down color according to emissive
            this._scaledDiffuse.r = this.diffuseColor.r * BABYLON.MathTools.Clamp(1.0 - this.emissiveColor.r);
            this._scaledDiffuse.g = this.diffuseColor.g * BABYLON.MathTools.Clamp(1.0 - this.emissiveColor.g);
            this._scaledDiffuse.b = this.diffuseColor.b * BABYLON.MathTools.Clamp(1.0 - this.emissiveColor.b);
            this._effect.setColor4("vDiffuseColor", this._scaledDiffuse, this.alpha * mesh.visibility);
            	
            if (scene.lightsEnabled) {
                var lightIndex = 0;
                for (var index = 0; index < scene.lights.length; index++) {
                    var light = scene.lights[index];

                    if (!light.isEnabled()) {
                        continue;
                    }

                    if (mesh && light.excludedMeshes.indexOf(mesh) !== -1) {
                        continue;
                    }

                    if (light instanceof BABYLON.PointLight) {
                        // Point Light
                        light.transferToEffect(this._effect, "vLightData" + lightIndex);
                    } else if (light instanceof BABYLON.DirectionalLight) {
                        // Directional Light
                        light.transferToEffect(this._effect, "vLightData" + lightIndex);
                    } else if (light instanceof BABYLON.SpotLight) {
                        // Spot Light
                        light.transferToEffect(this._effect, "vLightData" + lightIndex, "vLightDirection" + lightIndex);
                    } else if (light instanceof BABYLON.HemisphericLight) {
                        // Hemispheric Light
                        light.transferToEffect(this._effect, "vLightData" + lightIndex, "vLightGround" + lightIndex);
                    }

                    light.diffuse.scaleToRef(light.intensity, this._scaledDiffuse);
                    light.specular.scaleToRef(light.intensity, this._scaledSpecular);
                    this._effect.setColor4("vLightDiffuse" + lightIndex, this._scaledDiffuse, light.range);
                    this._effect.setColor3("vLightSpecular" + lightIndex, this._scaledSpecular);

                    // Shadows
                    if (scene.shadowsEnabled) {
						var shadowGenerator = light.getShadowGenerator();
						if (mesh.receiveShadows && shadowGenerator) {
							this._effect.setMatrix("lightMatrix" + lightIndex, shadowGenerator.getTransformMatrix());
							this._effect.setTexture("shadowSampler" + lightIndex, shadowGenerator.getShadowMap());
							this._effect.setFloat3("shadowsInfo" + lightIndex, shadowGenerator.getDarkness(), shadowGenerator.getShadowMap().getSize().width, shadowGenerator.bias);
						}
					}
                    lightIndex++;

                    if (lightIndex == this.maxSimultaneousLights)
                        break;
                }
            }

            // View
            if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== BABYLON.Scene.FOGMODE_NONE || this.reflectionTexture) {
                this._effect.setMatrix("view", scene.getViewMatrix());
            }
            // Fog
            if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
                this._effect.setFloat4("vFogInfos", scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity);
                this._effect.setColor3("vFogColor", scene.fogColor);
            }
			BABYLON.Material.prototype.bind.call(this, world, mesh);
    };
	
	WORLDCASTOR.GroundMaterial.prototype.getAnimatables = function () {
            var results = [];

            if (this.diffuseTexture && this.diffuseTexture.animations && this.diffuseTexture.animations.length > 0) {
                results.push(this.diffuseTexture);
            }

            if (this.ambientTexture && this.ambientTexture.animations && this.ambientTexture.animations.length > 0) {
                results.push(this.ambientTexture);
            }

            if (this.opacityTexture && this.opacityTexture.animations && this.opacityTexture.animations.length > 0) {
                results.push(this.opacityTexture);
            }

            if (this.reflectionTexture && this.reflectionTexture.animations && this.reflectionTexture.animations.length > 0) {
                results.push(this.reflectionTexture);
            }

            if (this.emissiveTexture && this.emissiveTexture.animations && this.emissiveTexture.animations.length > 0) {
                results.push(this.emissiveTexture);
            }

            if (this.specularTexture && this.specularTexture.animations && this.specularTexture.animations.length > 0) {
                results.push(this.specularTexture);
            }

            if (this.bumpTexture && this.bumpTexture.animations && this.bumpTexture.animations.length > 0) {
                results.push(this.bumpTexture);
            }

            return results;
    };
    
    WORLDCASTOR.GroundMaterial.prototype.dispose = function (forceDisposeEffect) {
        if (this.grassTexture) {
            this.grassTexture.dispose();
        }
        
        if (this.groundTexture) {
            this.groundTexture.dispose();
        }

        if (this.snowTexture) {
            this.snowTexture.dispose();
        }

        if (this.sandTexture) {
            this.sandTexture.dispose();
        }

        if (this.rockTexture) {
            this.rockTexture.dispose();
        }
		
		if (this.diffuseTexture) {
			this.diffuseTexture.dispose();
		}

		if (this.ambientTexture) {
			this.ambientTexture.dispose();
		}

		if (this.opacityTexture) {
			this.opacityTexture.dispose();
		}

		if (this.reflectionTexture) {
			this.reflectionTexture.dispose();
		}

		if (this.emissiveTexture) {
			this.emissiveTexture.dispose();
		}

		if (this.specularTexture) {
			this.specularTexture.dispose();
		}

		if (this.bumpTexture) {
			this.bumpTexture.dispose();
		}

        BABYLON.Material.prototype.dispose.call(this, forceDisposeEffect);
    };
	
	WORLDCASTOR.GroundMaterial.prototype.clone = function (name) {
            var newStandardMaterial = new WORLDCASTOR.GroundMaterial(name, this.getScene());

            // Base material
            newStandardMaterial.checkReadyOnEveryCall = this.checkReadyOnEveryCall;
            newStandardMaterial.alpha = this.alpha;
            newStandardMaterial.fillMode = this.fillMode;
            newStandardMaterial.backFaceCulling = this.backFaceCulling;

            // Standard material
            if (this.diffuseTexture && this.diffuseTexture.clone) {
                newStandardMaterial.diffuseTexture = this.diffuseTexture.clone();
            }
            if (this.ambientTexture && this.ambientTexture.clone) {
                newStandardMaterial.ambientTexture = this.ambientTexture.clone();
            }
            if (this.opacityTexture && this.opacityTexture.clone) {
                newStandardMaterial.opacityTexture = this.opacityTexture.clone();
            }
            if (this.reflectionTexture && this.reflectionTexture.clone) {
                newStandardMaterial.reflectionTexture = this.reflectionTexture.clone();
            }
            if (this.emissiveTexture && this.emissiveTexture.clone) {
                newStandardMaterial.emissiveTexture = this.emissiveTexture.clone();
            }
            if (this.specularTexture && this.specularTexture.clone) {
                newStandardMaterial.specularTexture = this.specularTexture.clone();
            }
            if (this.bumpTexture && this.bumpTexture.clone) {
                newStandardMaterial.bumpTexture = this.bumpTexture.clone();
            }

            newStandardMaterial.ambientColor = this.ambientColor.clone();
            newStandardMaterial.diffuseColor = this.diffuseColor.clone();
            newStandardMaterial.specularColor = this.specularColor.clone();
            newStandardMaterial.specularPower = this.specularPower;
            newStandardMaterial.emissiveColor = this.emissiveColor.clone();

            return newStandardMaterial;
    };
})();