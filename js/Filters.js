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

    this.utils.mapRGB(srcPixels, dstPixels, function (value) {
        return value > 127 ? (value - 127.5) * 2 : (127.5 - value) * 2;
    });

    return dstImageData;
};

Filters.Binarize = function(srcImageData, dstImageData) {
    var srcPixels    = srcImageData.data;
    var dstPixels    = dstImageData.data;

    // 0.0 <= n <= 1.0
    threshold  = 0.9;
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

    this.utils.mapRGB(srcPixels, dstPixels, function (value) {
        return 255 - value;
    });

    return dstImageData;
};

Filters.Mosaic = function(srcImageData, dstImageData, blockSize) {
    var srcPixels    = srcImageData.data,
        srcWidth     = srcImageData.width,
        srcHeight    = srcImageData.height,
        srcLength    = srcPixels.length,
        dstPixels    = dstImageData.data;
    
    var cols = Math.ceil(srcWidth / blockSize),
        rows = Math.ceil(srcHeight / blockSize),
        row, col,
        x_start, x_end, y_start, y_end,
        x, y, yIndex, index, size,
        r, g, b, a;

    for (row = 0; row < rows; row += 1) {
        y_start = row * blockSize;
        y_end   = y_start + blockSize;
        
        if (y_end > srcHeight) {
            y_end = srcHeight;
        }
        
        for (col = 0; col < cols; col += 1) {
            x_start = col * blockSize;
            x_end   = x_start + blockSize;
            
            if (x_end > srcWidth) {
                x_end = srcWidth;
            }

            // get the average color from the src
            r = g = b = a = 0;
            size = (x_end - x_start) * (y_end - y_start);

            for (y = y_start; y < y_end; y += 1) {
                yIndex = y * srcWidth;
                
                for (x = x_start; x < x_end; x += 1) {
                    index = (yIndex + x) << 2;
                    r += srcPixels[index];
                    g += srcPixels[index + 1];
                    b += srcPixels[index + 2];
                    a += srcPixels[index + 3];
                }
            }

            r = (r / size) + 0.5 | 0;
            g = (g / size) + 0.5 | 0;
            b = (b / size) + 0.5 | 0;
            a = (a / size) + 0.5 | 0;

            // fill the dst with that color
            for (y = y_start; y < y_end; y += 1) {
                yIndex = y * srcWidth;
                
                for (x = x_start; x < x_end; x += 1) {
                    index = (yIndex + x) << 2;
                    dstPixels[index]     = r;
                    dstPixels[index + 1] = g;
                    dstPixels[index + 2] = b;
                    dstPixels[index + 3] = a;
                }
            }
        }
    }

    return dstImageData;
};

/**
 * @param range  1 <= n <= 5
 * @param levels 1 <= n <= 256
 */
Filters.Oil = function (srcImageData, dstImageData, range, levels) {
    var srcPixels    = srcImageData.data,
        srcWidth     = srcImageData.width,
        srcHeight    = srcImageData.height,
        srcLength    = srcPixels.length,
        dstPixels    = dstImageData.data;
    
    var index = 0,
        rh = [],
        gh = [],
        bh = [],
        rt = [],
        gt = [],
        bt = [],
        x, y, i, row, col,
        rowIndex, colIndex, offset, srcIndex,
        sr, sg, sb, ri, gi, bi,
        r, g, b;
    
    for (y = 0; y < srcHeight; y += 1) {
        for (x = 0; x < srcWidth; x += 1) {
            for (i = 0; i < levels; i += 1) {
                rh[i] = gh[i] = bh[i] = rt[i] = gt[i] = bt[i] = 0;
            }
            
            for (row = -range; row <= range; row += 1) {
                rowIndex = y + row;
                
                if (rowIndex < 0 || rowIndex >= srcHeight) {
                    continue;
                }
                
                offset = rowIndex * srcWidth;
                
                for (col = -range; col <= range; col += 1) {
                    colIndex = x + col;
                    if (colIndex < 0 || colIndex >= srcWidth) {
                        continue;
                    }
                    
                    srcIndex = (offset + colIndex) << 2;
                    sr = srcPixels[srcIndex];
                    sg = srcPixels[srcIndex + 1];
                    sb = srcPixels[srcIndex + 2];
                    ri = (sr * levels) >> 8;
                    gi = (sg * levels) >> 8;
                    bi = (sb * levels) >> 8;
                    rt[ri] += sr;
                    gt[gi] += sg;
                    bt[bi] += sb;
                    rh[ri] += 1;
                    gh[gi] += 1;
                    bh[bi] += 1;
                }
            }

            r = g = b = 0;
            for (i = 1; i < levels; i += 1) {
                if(rh[i] > rh[r]) {
                    r = i;
                }
                if(gh[i] > gh[g]) {
                    g = i;
                }
                if(bh[i] > bh[b]) {
                    b = i;
                }
            }

            dstPixels[index]     = rt[r] / rh[r] | 0;
            dstPixels[index + 1] = gt[g] / gh[g] | 0;
            dstPixels[index + 2] = bt[b] / bh[b] | 0;
            dstPixels[index + 3] = srcPixels[index + 3];
            index += 4;
        }
    }

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