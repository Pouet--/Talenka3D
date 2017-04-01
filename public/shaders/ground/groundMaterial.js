var WORLDMONGER = WORLDMONGER || {};

(function () {
    WORLDMONGER.GroundMaterial = function (name, scene, light) {
        BABYLON.Material.call(this, name, scene);
        this.light = light;
        
        this.groundTexture = new BABYLON.Texture("js/shaders/ground/ground.jpg", scene);
        this.groundTexture.uScale = 30;
        this.groundTexture.vScale = 30;
        
        this.grassTexture = new BABYLON.Texture("js/shaders/ground/grass.jpg", scene);
        this.grassTexture.uScale = 48.0;
        this.grassTexture.vScale = 48.0;

        this.snowTexture = new BABYLON.Texture("js/shaders/ground/snow.jpg", scene);
        this.snowTexture.uScale = 30.0;
        this.snowTexture.vScale = 30.0;
        
        this.sandTexture = new BABYLON.Texture("js/shaders/ground/sand.jpg", scene);
        this.sandTexture.uScale = 32.0;
        this.sandTexture.vScale = 32.0;
        
        this.rockTexture = new BABYLON.Texture("js/shaders/ground/rock.jpg", scene);
        this.rockTexture.uScale = 30.0;
        this.rockTexture.vScale = 30.0;
        
        this.blendTexture = new BABYLON.Texture("js/shaders/ground/blend.png", scene);
        this.blendTexture.uOffset = Math.random();
        this.blendTexture.vOffset = Math.random();
        this.blendTexture.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE;
        this.blendTexture.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE;


        this.sandLimit = 1;
        this.rockLimit = 26;
        this.snowLimit = 50;
    };

    WORLDMONGER.GroundMaterial.prototype = Object.create(BABYLON.Material.prototype);

    // Properties   
    WORLDMONGER.GroundMaterial.prototype.needAlphaBlending = function () {
        return false;
    };

    WORLDMONGER.GroundMaterial.prototype.needAlphaTesting = function () {
        return false;
    };

    // Methods   
    WORLDMONGER.GroundMaterial.prototype.isReady = function (mesh) {
        var engine = this._scene.getEngine();

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

        var defines = [];
        if (this._scene.clipPlane) {
            defines.push("#define CLIPPLANE");
        }
		if (this._scene.shadowsEnabled) {
			defines.push("#define SHADOWS");
        }

        var join = defines.join("\n");
        if (this._cachedDefines != join) {
            this._cachedDefines = join;

            this._effect = engine.createEffect("js/shaders/ground/ground3",
                ["position", "normal", "uv"],
                ["worldViewProjection", "groundMatrix", "sandMatrix", "rockMatrix", "snowMatrix", "grassMatrix", "blendMatrix", "world", "vLightPosition", "vLimits", "vClipPlane"],
                ["groundSampler", "sandSampler", "rockSampler", "snowSampler", "grassSampler", "blendSampler"],
                join);
        }

        if (!this._effect.isReady()) {
            return false;
        }

        return true;
    };

    WORLDMONGER.GroundMaterial.prototype.bind = function (world, mesh) {
        this._effect.setMatrix("world", world);
        this._effect.setMatrix("worldViewProjection", world.multiply(this._scene.getTransformMatrix()));        
        this._effect.setVector3("vLightPosition", this.light.position);

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
        
		// Limits
        this._effect.setFloat3("vLimits", this.sandLimit, this.rockLimit, this.snowLimit);
		
		// Shadows
		// One light for now.
		// If you want to add another light for shadows computing, see :
		// https://github.com/BabylonJS/Babylon.js/blob/master/src/Materials/babylon.standardMaterial.js#664
		if (this.light.isEnabled())
		{
			if (this.light instanceof BABYLON.PointLight) {
				// Point Light
				this.light.transferToEffect(this._effect, "vLightData0");
			}
			else if (this.light instanceof BABYLON.DirectionalLight) {
				// Directional Light
				this.light.transferToEffect(this._effect, "vLightData0");
			}
			else if (this.light instanceof BABYLON.SpotLight) {
				// Spot Light
				this.light.transferToEffect(this._effect, "vLightData0", "vLightDirection0");
			}
			else if (this.light instanceof BABYLON.HemisphericLight) {
				// Hemispheric Light
				this.light.transferToEffect(this._effect, "vLightData0", "vLightGround0");
			}
			/*
			this.light.diffuse.scaleToRef(this.light.intensity, this._scaledDiffuse);
			this._effect.setColor4("vLightDiffuse0", this._scaledDiffuse, this.light.range);
			if (this._defines.SPECULARTERM) {
				this.light.specular.scaleToRef(this.light.intensity, this._scaledSpecular);
				this._effect.setColor3("vLightSpecular0", this._scaledSpecular);
			}
			*/
			// Shadows
			if (this._scene.shadowsEnabled)
			{
				var shadowGenerator = this.light.getShadowGenerator();
				if (mesh.receiveShadows && shadowGenerator) {
					this._effect.setMatrix("lightMatrix0", shadowGenerator.getTransformMatrix());
					this._effect.setTexture("shadowSampler0", shadowGenerator.getShadowMapForRendering());
					this._effect.setFloat3("shadowsInfo0", shadowGenerator.getDarkness(), shadowGenerator.getShadowMap().getSize().width, shadowGenerator.bias);
				}
			}
		}
			
        
        if (this._scene.clipPlane) {
            var clipPlane = this._scene.clipPlane;
            this._effect.setFloat4("vClipPlane", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
        }
    };
    
    WORLDMONGER.GroundMaterial.prototype.dispose = function () {
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

        BABYLON.Material.dispose(this);
    };
})();