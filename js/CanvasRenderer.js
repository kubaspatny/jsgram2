var CanvasRenderer = function(debug){
  this.canvas = document.querySelector('canvas');
  this.canvasWrap = document.querySelector("#canvas-wrapper2");
  this.dd = document.querySelector("#dragdrop");
  this.main = document.querySelector('#canvas-wrapper');
  this.canvasData = [];

  if(debug){
    this.main.className += " blue";
  }

  window.addEventListener('resize', this._onResize.bind(this));
  window.addEventListener('load', this._fitCanvasToContainer.bind(this));
}

CanvasRenderer.prototype._onResize = function(){
    this._fitCanvasToContainer();
}

CanvasRenderer.prototype._fitCanvasToContainer = function() {
  console.log('_fitCanvasToContainer');

  // set the canvas size to 0, so that the wrapper can size based on
  // the flex magic -> then read that size and set it to canvas
  this.canvas.width = 0;
  this.canvas.height = 0;

  var rect = this.canvasWrap.getBoundingClientRect();
  this.canvas.width = rect.width;
  this.canvas.height = rect.height;
  console.log('setting canvas size: [' + this.canvas.width + 'x' + this.canvas.height + ']');

  rect = this.dd.getBoundingClientRect();
  console.log('dd size: [' + rect.width + 'x' + rect.height + ']');

  this._redraw();
  // window.requestAnimationFrame(this._fitCanvasToContainer.bind(this));
}

CanvasRenderer.prototype._setBaseImage = function(img) {
  this.canvasData = [img];
  this._redraw();
}

CanvasRenderer.prototype._redraw = function(){
    console.log('_redraw: [' + this.canvas.width + 'x' + this.canvas.height + ']');
    
    var canvasDataLen = this.canvasData.length;
    console.log('currently items in history: ' +  canvasDataLen);

    // check temporary canvas data len
    if(canvasDataLen > 0){
      this.drawImage(this.canvasData[canvasDataLen - 1]);    
    }
}

CanvasRenderer.prototype.drawImage = function(img){
  var hRatio = this.canvas.width  / img.width;
  var vRatio = this.canvas.height / img.height;
  var ratio  = Math.min (hRatio, vRatio);
  this.offsetX = (this.canvas.width - img.width*ratio) / 2;
  this.offsetY = (this.canvas.height - img.height*ratio) / 2;

  var ctx = this.canvas.getContext("2d");
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ctx.drawImage(img, 0,0, img.width, img.height, this.offsetX, this.offsetY, img.width*ratio, img.height*ratio);

  this.imageData = ctx.getImageData(this.offsetX, this.offsetY, img.width*ratio, img.height*ratio);

  // this.applyFilter(Filters.Grayscale.bind(Filters));
  // this.applyFilter(Filters.Invert.bind(Filters));
  // this.applyFilter(Filters.Sepia.bind(Filters));
  // this.applyFilter(Filters.Solarize.bind(Filters));
  // this.applyBrightnessContrast(50, 0);
  // this.applyMosaic(10);
}

CanvasRenderer.prototype.applyFilter = function(func){
  var ctx = this.canvas.getContext("2d");
  var hRatio = this.canvas.width  / img.width;
  var vRatio = this.canvas.height / img.height;
  var ratio  = Math.min (hRatio, vRatio);
  this.offsetX = (this.canvas.width - img.width*ratio) / 2;
  this.offsetY = (this.canvas.height - img.height*ratio) / 2;

  this.imageData = ctx.getImageData(this.offsetX, this.offsetY, img.width*ratio, img.height*ratio);

  imageDataCopy = func(this.imageData, copyImageData(ctx, this.imageData));
  this.imageData = imageDataCopy; //TODO backup imageData to be able to step back

  ctx.putImageData(this.imageData, this.offsetX, this.offsetY);
}

function copyImageData(context, original) {
  var rv = context.createImageData(original.width, original.height);
  
  for (var i = 0; i < original.data.length; ++i){
    rv.data[i] = original.data[i];  
  }
    
  return rv;
}

CanvasRenderer.prototype.createImageData = function(w, h){
  var ctx = this.canvas.getContext("2d");
  if(ctx.createImageData){
    return ctx.createImageData(w,h);
  } else {
    return new ImageData(w,h);
  }
}

CanvasRenderer.prototype.applyBrightnessContrast = function(brigtness, contrast){
  var ctx = this.canvas.getContext("2d");
  var hRatio = this.canvas.width  / img.width; //NOT GOING TO WORK AFTER CROPPING
  var vRatio = this.canvas.height / img.height;
  var ratio  = Math.min (hRatio, vRatio);
  this.offsetX = (this.canvas.width - img.width*ratio) / 2;
  this.offsetY = (this.canvas.height - img.height*ratio) / 2;

  // this.imageData = ctx.getImageData(this.offsetX, this.offsetY, img.width*ratio, img.height*ratio);
  imageDataCopy = Filters.BrightnessContrast(this.imageData, copyImageData(ctx, this.imageData), brigtness, contrast);
  // this.imageData = imageDataCopy; //TODO backup imageData to be able to step back

  ctx.putImageData(imageDataCopy, this.offsetX, this.offsetY);
}

CanvasRenderer.prototype.applyMosaic = function(blockSize){
  var ctx = this.canvas.getContext("2d");
  var hRatio = this.canvas.width  / img.width; //NOT GOING TO WORK AFTER CROPPING
  var vRatio = this.canvas.height / img.height;
  var ratio  = Math.min (hRatio, vRatio);
  this.offsetX = (this.canvas.width - img.width*ratio) / 2;
  this.offsetY = (this.canvas.height - img.height*ratio) / 2;

  this.imageData = ctx.getImageData(this.offsetX, this.offsetY, img.width*ratio, img.height*ratio);
  imageDataCopy = Filters.Mosaic(this.imageData, copyImageData(ctx, this.imageData), blockSize);
  this.imageData = imageDataCopy; //TODO backup imageData to be able to step back

  ctx.putImageData(this.imageData, this.offsetX, this.offsetY);
}

CanvasRenderer.prototype.applyOil = function(range, levels){
  var ctx = this.canvas.getContext("2d");
  var hRatio = this.canvas.width  / img.width; //NOT GOING TO WORK AFTER CROPPING
  var vRatio = this.canvas.height / img.height;
  var ratio  = Math.min (hRatio, vRatio);
  this.offsetX = (this.canvas.width - img.width*ratio) / 2;
  this.offsetY = (this.canvas.height - img.height*ratio) / 2;

  this.imageData = ctx.getImageData(this.offsetX, this.offsetY, img.width*ratio, img.height*ratio);
  imageDataCopy = Filters.Oil(this.imageData, copyImageData(ctx, this.imageData), range, levels);
  this.imageData = imageDataCopy; //TODO backup imageData to be able to step back

  ctx.putImageData(this.imageData, this.offsetX, this.offsetY);
}





