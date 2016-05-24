var CanvasRenderer = function(debug){
  this.canvas = document.querySelector('canvas');
  this.canvasWrap = document.querySelector("#canvas-wrapper2");
  this.dd = document.querySelector("#dragdrop");
  this.main = document.querySelector('#canvas-wrapper');
  this.canvasData = [];
  this.canvasImageData = [];
  this.tempImage = null;
  this.tempImageData = null;
  this.isEditMode = 0;

  this.dialog = document.querySelector('#loadingDialog');
  this.overlay = document.querySelector('#dialogOverlay');
  this.downloadLink = document.querySelector('#save-button');

  if(debug){
    this.main.className += " blue";
  }

  window.addEventListener('resize', this._onResize.bind(this));
  window.addEventListener('load', this._fitCanvasToContainer.bind(this));
}

CanvasRenderer.prototype._setEditMode = function(editMode){
  this.isEditMode = editMode;
}

CanvasRenderer.prototype._saveTempChanges = function(){
  this.canvasData.push(this.tempImage);
  this.canvasImageData.push(this.tempImageData);
}

CanvasRenderer.prototype._resetTempChanges = function(){
  this.tempImage = this.canvasData[this.canvasData.length - 1];
  this.tempImageData = this.canvasImageData[this.canvasImageData.length - 1];  
}

CanvasRenderer.prototype._onResize = function(){
    this._fitCanvasToContainer();
}

CanvasRenderer.prototype._fitCanvasToContainer = function() {
  // set the canvas size to 0, so that the wrapper can size based on
  // the flex magic -> then read that size and set it to canvas
  this.canvas.width = 0;
  this.canvas.height = 0;

  var rect = this.canvasWrap.getBoundingClientRect();
  this.canvas.width = rect.width;
  this.canvas.height = rect.height;

  this._redraw();
}

CanvasRenderer.prototype._setBaseImage = function(img) {
  this.canvasData = [img];
  this.canvasImageData = [this._getImageData(img)];
  this.tempImage = img;
  this.tempImageData = this.canvasImageData[0];

  this.isLargeInstance = img.width > 2000 || img.height > 2000;
  this._redraw();

  this.downloadLink.setAttribute("download", "JSGramImage.jpg");
  this.downloadLink.setAttribute("href", this.canvasData[0].src);
}

CanvasRenderer.prototype._redraw = function(){
    var canvasDataLen = this.canvasData.length;
    console.log('currently items in history: ' +  canvasDataLen);

    if(this.isEditMode){
      console.log('_redraw - in edit mode');
      this._drawImage(this.tempImage);
    } else if(canvasDataLen > 0){
      console.log('_redraw - in normal mode');
      this._drawImage(this.canvasData[canvasDataLen - 1]);
    }
}

CanvasRenderer.prototype._getImageData = function(img) {
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0,0);

  return ctx.getImageData(0, 0, img.width, img.height);;
}

CanvasRenderer.prototype._setTempImage = function(imageData) {
  var canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  var ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
  this.tempImage = new Image();
  this.tempImage.src = canvas.toDataURL();

  this.tempImageData = imageData;
}

CanvasRenderer.prototype._drawImageData = function(imageData){
  var canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  var ctx = canvas.getContext("2d");
  var hRatio = this.canvas.width  / imageData.width;
  var vRatio = this.canvas.height / imageData.height;
  var ratio  = Math.min (hRatio, vRatio);
  this.offsetX = (this.canvas.width - imageData.width*ratio) / 2;
  this.offsetY = (this.canvas.height - imageData.height*ratio) / 2;

  ctx.putImageData(imageData, this.offsetX, this.offsetY);

  var image = new Image();
  image.src = canvas.toDataURL();
  this._drawImage(image);
}

CanvasRenderer.prototype._drawImage = function(img){
  var hRatio = this.canvas.width  / img.width;
  var vRatio = this.canvas.height / img.height;
  var ratio  = Math.min (hRatio, vRatio);
  this.offsetX = (this.canvas.width - img.width*ratio) / 2;
  this.offsetY = (this.canvas.height - img.height*ratio) / 2;

  var ctx = this.canvas.getContext("2d");
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ctx.drawImage(img, 0,0, img.width, img.height, this.offsetX, this.offsetY, img.width*ratio, img.height*ratio);
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

CanvasRenderer.prototype.copyImageData = function(original) {
  var rv = this.canvas.getContext("2d").createImageData(original.width, original.height);
  
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
  this.showProgress();

  setTimeout(function(){
    var imageData = this.canvasImageData[this.canvasImageData.length - 1];
    imageDataCopy = Filters.BrightnessContrast(imageData, this.copyImageData(imageData), brigtness, contrast);
    this._setTempImage(imageDataCopy);
    this._redraw();
   
    this.hideProgress(); 
  }.bind(this), 100);
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

CanvasRenderer.prototype.showProgress = function(){
  if(this.isLargeInstance){
    this.dialog.className += " md-show";
    this.overlay.className += " md-show";  
  }
}

CanvasRenderer.prototype.hideProgress = function(){
  if(this.isLargeInstance){
    this.dialog.className = this.dialog.className.replace(/(?:^|\s)md-show(?!\S)/g , '');
    this.overlay.className = this.overlay.className.replace(/(?:^|\s)md-show(?!\S)/g , '');
  }
}







