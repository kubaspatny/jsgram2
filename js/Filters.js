var Filters = {};
Filters.utils = {
	buildMap: function (f) {
        for (var m = [], k = 0, v; k < 256; k += 1) {
            m[k] = (v = f(k)) > 255 ? 255 : v < 0 ? 0 : v | 0;
        }
        return m;
    },
    
    applyMap: function (src, dst, map) {
        for (var i = 0, l = src.length; i < l; i += 4) {
            dst[i]     = map[src[i]];
            dst[i + 1] = map[src[i + 1]];
            dst[i + 2] = map[src[i + 2]];
            dst[i + 3] = src[i + 3];
        }
    },
    
    mapRGB: function (src, dst, func) {
        this.applyMap(src, dst, this.buildMap(func));
    }

};

Filters.Grayscale = function(srcImageData, dstImageData){
	var data = dstImageData.data;

	for(var i = 0; i < data.length; i += 4) {
		var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];

		data[i] = brightness;     //R
		data[i + 1] = brightness; //G
		data[i + 2] = brightness; //B
	}

	return dstImageData;
};

Filters.Sepia = function (srcImageData, dstImageData) {
    var srcPixels    = srcImageData.data,
        dstPixels    = dstImageData.data;

    var r, g, b, i, value;

    for (i = 0; i < srcPixels.length; i += 4) {
        r = srcPixels[i];
        g = srcPixels[i + 1];
        b = srcPixels[i + 2];

        dstPixels[i]     = (value = r * 0.393 + g * 0.769 + b * 0.189) > 255 ? 255 : value < 0 ? 0 : value + 0.5 | 0;
        dstPixels[i + 1] = (value = r * 0.349 + g * 0.686 + b * 0.168) > 255 ? 255 : value < 0 ? 0 : value + 0.5 | 0;
        dstPixels[i + 2] = (value = r * 0.272 + g * 0.534 + b * 0.131) > 255 ? 255 : value < 0 ? 0 : value + 0.5 | 0;
        dstPixels[i + 3] = srcPixels[i + 3];
    }

    return dstImageData;
};

Filters.Solarize = function (srcImageData, dstImageData) {
    var srcPixels    = srcImageData.data,
        dstPixels    = dstImageData.data;

    Filters.utils.mapRGB(srcPixels, dstPixels, function (value) {
        return value > 127 ? (value - 127.5) * 2 : (127.5 - value) * 2;
    });

    return dstImageData;
};

Filters.Binarize = function(srcImageData, dstImageData) {
    var srcPixels    = srcImageData.data;
    var dstPixels    = dstImageData.data;

    // 0.0 <= n <= 1.0
    threshold  = 1;
    threshold *= 255;

    for (var i = 0; i < srcPixels.length; i += 4) {
        var avg = srcPixels[i] + srcPixels[i + 1] + srcPixels[i + 2] / 3;

        dstPixels[i] = dstPixels[i + 1] = dstPixels[i + 2] = avg <= threshold ? 0 : 255;
        dstPixels[i + 3] = 255;
    }

    return dstImageData;
};

Filters.Invert = function(srcImageData, dstImageData) {
    var srcPixels    = srcImageData.data;
    var dstPixels    = dstImageData.data;

    Filters.utils.mapRGB(srcPixels, dstPixels, function (value) {
        return 255 - value;
    });

    return dstImageData;
};

/**
 * @param brightness -100 <= n <= 100
 * @param contrast -100 <= n <= 100
 */
Filters.BrightnessContrast = function(srcImageData, dstImageData, brightness, contrast) {
    var srcPixels    = srcImageData.data;
    var dstPixels    = dstImageData.data;

    brightness = (brightness + 100) / 100;
    contrast = (contrast + 100) / 100;

    this.utils.mapRGB(srcPixels, dstPixels, function (value) {
        value *= brightness;
        value = (value - 127.5) * contrast + 127.5;
        return value + 0.5 | 0;
    });

    return dstImageData;
};