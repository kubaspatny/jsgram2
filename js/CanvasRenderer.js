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

  this._setCropper();

  this.cropperHandleTopLeft = new CropperHandle(-1, -1);
  this.cropperHandleTopRight = new CropperHandle(-1, -1);
  this.cropperHandleBottomLeft = new CropperHandle(-1, -1);
  this.cropperHandleBottomRight = new CropperHandle(-1, -1);
  this.cropRatio = new RatioCrop(0, 0, 1, 1);
  this.dragging = 0;
  this.showCropper = 0;
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
}

CanvasRenderer.prototype._discardImage = function() {
  this.canvasData = [];
  this.canvasImageData = [];
  this.tempImage = null;
  this.tempImageData = null;
  this.isEditMode = 0;
}

CanvasRenderer.prototype._redraw = function(){
    var canvasDataLen = this.canvasData.length;
    console.log('currently items in history: ' +  canvasDataLen);

    if(this.isEditMode && this.tempImage != null){
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

  return ctx.getImageData(0, 0, img.width, img.height);
}

CanvasRenderer.prototype._saveImage = function() {
  if(this.canvasData.length == 0){
    return;
  }

  var img = this.canvasData[this.canvasData.length - 1];


  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0,0);

  canvas.toBlob(function(blob) {
    saveAs(blob, "jsgram_image.png");
  });
}

CanvasRenderer.prototype._setCropper = function(){
  console.log('setCropper');
  var canvas = document.querySelector('canvas');

  canvas.addEventListener("mousemove", function (e) {
      this.onMouseInteraction(e, 'move');
  }.bind(this), false);

  canvas.addEventListener("mousedown", function (e) {
      this.onMouseInteraction(e, 'down');
  }.bind(this), false);

  canvas.addEventListener("mouseup", function (e) {
      this.onMouseInteraction(e, 'up');
  }.bind(this), false);

  canvas.addEventListener("mouseout", function (e) {
      this.onMouseInteraction(e, 'out');
  }.bind(this), false);
}

CanvasRenderer.prototype.onMouseInteraction = function(e, res) {
  e.preventDefault();

  console.log('onMouseInteraction: ' + res);

  if (res == 'down') {
      currX = e.clientX - this.canvas.offsetLeft;
      currY = e.clientY - this.canvas.offsetTop;

      //dragging TOP LEFT
      if(Math.abs(this.cropperHandleTopLeft.x - currX) < 10 && Math.abs(this.cropperHandleTopLeft.y - currY) < 10){
          this.dragging = 1;
      }

      //dragging TOP RIGHT
      if(Math.abs(this.cropperHandleTopRight.x - currX) < 10 && Math.abs(this.cropperHandleTopRight.y - currY) < 10){
          this.dragging = 2;
      }

      //dragging BOTTOM RIGHT
      if(Math.abs(this.cropperHandleBottomRight.x - currX) < 10 && Math.abs(this.cropperHandleBottomRight.y - currY) < 10){
          this.dragging = 3;
      }

      //dragging BOTTOM LEFT
      if(Math.abs(this.cropperHandleBottomLeft.x - currX) < 10 && Math.abs(this.cropperHandleBottomLeft.y - currY) < 10){
          this.dragging = 4;
      }
  }

  if (res == 'up' || res == "out") {
      this.dragging = 0;
  }

  if (res == 'move') {

      if(this.dragging == 1){ // TOP LEFT
        this.cropperHandleTopLeft.x = e.clientX - this.canvas.offsetLeft;
        this.cropperHandleTopLeft.y = e.clientY - this.canvas.offsetTop;

        this.cropperHandleTopRight.y = this.cropperHandleTopLeft.y;
        this.cropperHandleBottomLeft.x = this.cropperHandleTopLeft.x;

        //over the left edge of the image
        if(this.cropperHandleTopLeft.x < this.offsetX){
          this.cropperHandleTopLeft.x = this.offsetX;
          this.cropperHandleBottomLeft.x = this.offsetX;
        }

        //over the right edge of selection
        if(this.cropperHandleTopLeft.x > this.cropperHandleTopRight.x - 30){
          this.cropperHandleTopLeft.x = this.cropperHandleTopRight.x - 30;
          this.cropperHandleBottomLeft.x = this.cropperHandleTopRight.x - 30;
        }

        //over the top of the image
        if(this.cropperHandleTopLeft.y < this.offsetY){
          this.cropperHandleTopLeft.y = this.offsetY;
          this.cropperHandleTopRight.y = this.offsetY;
        }

        //over the bottom edge of selection
        if(this.cropperHandleTopLeft.y > this.cropperHandleBottomLeft.y - 30){
          this.cropperHandleTopLeft.y = this.cropperHandleBottomLeft.y - 30;
          this.cropperHandleTopRight.y = this.cropperHandleBottomLeft.y - 30;
        }

      } else if(this.dragging == 2){ // TOP RIGHT
        this.cropperHandleTopRight.x = e.clientX - this.canvas.offsetLeft;
        this.cropperHandleTopRight.y = e.clientY - this.canvas.offsetTop;

        this.cropperHandleTopLeft.y = this.cropperHandleTopRight.y;
        this.cropperHandleBottomRight.x = this.cropperHandleTopRight.x;

        //over the right edge of the image
        if(this.cropperHandleTopRight.x > this.canvas.width - this.offsetX){
          this.cropperHandleTopRight.x = this.canvas.width - this.offsetX;
          this.cropperHandleBottomRight.x = this.canvas.width - this.offsetX;
        }

        //over the top edge of the image
        if(this.cropperHandleTopRight.y < this.offsetY){
          this.cropperHandleTopRight.y = this.offsetY;
          this.cropperHandleTopLeft.y = this.offsetY;
        }

        //over the left edge of the selection
        if(this.cropperHandleTopRight.x < this.cropperHandleTopLeft.x + 30){
          this.cropperHandleTopRight.x = this.cropperHandleTopLeft.x + 30;
          this.cropperHandleBottomRight.x = this.cropperHandleTopLeft.x + 30;
        }

        //over the bottom edge of the selection
        if(this.cropperHandleTopRight.y > this.cropperHandleBottomRight.y - 30){
          this.cropperHandleTopRight.y = this.cropperHandleBottomRight.y - 30;
          this.cropperHandleTopLeft.y = this.cropperHandleBottomRight.y - 30;
        }

      } else if(this.dragging == 3){ // BOTTOM RIGHT
        this.cropperHandleBottomRight.x = e.clientX - this.canvas.offsetLeft;
        this.cropperHandleBottomRight.y = e.clientY - this.canvas.offsetTop;

        this.cropperHandleBottomLeft.y = this.cropperHandleBottomRight.y;
        this.cropperHandleTopRight.x = this.cropperHandleBottomRight.x;

        //over the right edge of the image
        if(this.cropperHandleBottomRight.x > this.canvas.width - this.offsetX){
          this.cropperHandleTopRight.x = this.canvas.width - this.offsetX;
          this.cropperHandleBottomRight.x = this.canvas.width - this.offsetX;
        }

        //over the bottom edge of the image
        if(this.cropperHandleBottomRight.y > this.canvas.height - this.offsetY){
          this.cropperHandleBottomLeft.y = this.canvas.height - this.offsetY;
          this.cropperHandleBottomRight.y = this.canvas.height - this.offsetY;
        }

        //over the left edge of the selection
        if(this.cropperHandleBottomRight.x < this.cropperHandleBottomLeft.x + 30){
          this.cropperHandleTopRight.x = this.cropperHandleBottomLeft.x + 30;
          this.cropperHandleBottomRight.x = this.cropperHandleBottomLeft.x + 30;
        }

        //over the top edge of the selection
        if(this.cropperHandleBottomRight.y < this.cropperHandleTopRight.y + 30){
          this.cropperHandleBottomRight.y = this.cropperHandleTopRight.y + 30;
          this.cropperHandleBottomLeft.y = this.cropperHandleTopRight.y + 30;
        }

      } else if(this.dragging == 4){ // BOTTOM LEFT
        this.cropperHandleBottomLeft.x = e.clientX - this.canvas.offsetLeft;
        this.cropperHandleBottomLeft.y = e.clientY - this.canvas.offsetTop;

        this.cropperHandleBottomRight.y = this.cropperHandleBottomLeft.y;
        this.cropperHandleTopLeft.x = this.cropperHandleBottomLeft.x;

        //over the left edge of the image
        if(this.cropperHandleBottomLeft.x < this.offsetX){
          this.cropperHandleTopLeft.x = this.offsetX;
          this.cropperHandleBottomLeft.x = this.offsetX;
        }

        //over the bottom edge of the image
        if(this.cropperHandleBottomLeft.y > this.canvas.height - this.offsetY){
          this.cropperHandleBottomLeft.y = this.canvas.height - this.offsetY;
          this.cropperHandleBottomRight.y = this.canvas.height - this.offsetY;
        }

        //over the right edge of the selection
        if(this.cropperHandleBottomLeft.x > this.cropperHandleBottomRight.x - 30){
          this.cropperHandleBottomLeft.x = this.cropperHandleBottomRight.x - 30;
          this.cropperHandleTopLeft.x = this.cropperHandleBottomRight.x - 30;
        }

        //over the top edge of the selection
        if(this.cropperHandleBottomLeft.y < this.cropperHandleTopLeft.y + 30){
          this.cropperHandleBottomLeft.y = this.cropperHandleTopLeft.y + 30;
          this.cropperHandleBottomRight.y = this.cropperHandleTopLeft.y + 30;
        }
      }

      //COMPUTE POSITION BASED ON RATIO
      imageWidth = this.canvas.width - 2*this.offsetX;
      imageHeight = this.canvas.height - 2*this.offsetY;

      handleLeft = this.cropperHandleTopLeft.x - this.offsetX;
      handleRight = this.cropperHandleTopRight.x - this.offsetX;
      handleTop = this.cropperHandleTopRight.y - this.offsetY;
      handleBottom = this.cropperHandleBottomRight.y - this.offsetY;
      
      this.cropRatio.left = handleLeft / imageWidth;
      this.cropRatio.right = handleRight / imageWidth;
      this.cropRatio.top = handleTop / imageHeight;
      this.cropRatio.bottom = handleBottom / imageHeight;

      if(this.dragging != 0){
        this._redraw();  
      }
  }
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

CanvasRenderer.prototype.initCropper = function(){
  this.cropperHandleTopLeft.x = this.offsetX;
  this.cropperHandleTopLeft.y = this.offsetY;

  this.cropperHandleTopRight.x = this.offsetX + this.tempImage.width*this.ratio;
  this.cropperHandleTopRight.y = this.offsetY;

  this.cropperHandleBottomLeft.x = this.offsetX;
  this.cropperHandleBottomLeft.y = this.offsetY + this.tempImage.height*this.ratio;

  this.cropperHandleBottomRight.x = this.offsetX + this.tempImage.width*this.ratio;
  this.cropperHandleBottomRight.y = this.offsetY + this.tempImage.height*this.ratio;  
}

CanvasRenderer.prototype.resetCropper = function(){
  this.cropperHandleTopLeft.reset();
  this.cropperHandleBottomLeft.reset();
  this.cropperHandleBottomRight.reset();
  this.cropperHandleTopRight.reset();
}

CanvasRenderer.prototype.setRenderCropper = function(show){
  this.renderCropper = show;
}

CanvasRenderer.prototype.drawCropper = function(ctx){
  // DARK OVERLAY OVER CROPPED AREA
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(this.offsetX, this.offsetY, this.cropperHandleTopLeft.x - this.offsetX, this.tempImage.height*this.ratio);
  ctx.fillRect(this.cropperHandleTopLeft.x, this.offsetY, this.cropperHandleTopRight.x - this.cropperHandleTopLeft.x, this.cropperHandleTopLeft.y - this.offsetY);
  ctx.fillRect(this.cropperHandleTopRight.x, this.offsetY, this.offsetX + this.tempImage.width*this.ratio - this.cropperHandleTopRight.x, this.tempImage.height*this.ratio);
  ctx.fillRect(this.cropperHandleBottomLeft.x, this.cropperHandleBottomLeft.y, this.cropperHandleBottomRight.x - this.cropperHandleBottomLeft.x, this.offsetY + this.tempImage.height*this.ratio - this.cropperHandleBottomLeft.y);

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;

  // TOP LEFT HANDLE
  ctx.fillRect(this.cropperHandleTopLeft.x, this.cropperHandleTopLeft.y, 10, 10);

  // TOP RIGHT HANDLE
  ctx.fillRect(this.cropperHandleTopRight.x - 10, this.cropperHandleTopRight.y, 10, 10);

  // BOTTOM LEFT HANDLE
  ctx.fillRect(this.cropperHandleBottomLeft.x, this.cropperHandleBottomLeft.y - 10, 10, 10);

  // BOTTOM RIGHT HANDLE
  ctx.fillRect(this.cropperHandleBottomRight.x - 10, this.cropperHandleBottomRight.y - 10, 10, 10);

  // ctx.setLineDash([10, 5]);
  
  //TOP LEFT -> TOP RIGHT
  ctx.beginPath();
  ctx.moveTo(this.cropperHandleTopLeft.x + 1, this.cropperHandleTopLeft.y + 1);
  ctx.lineTo(this.cropperHandleTopRight.x - 1, this.cropperHandleTopRight.y + 1);
  ctx.stroke();

  //TOP LEFT -> BOTTOM LEFT
  ctx.beginPath();
  ctx.moveTo(this.cropperHandleTopLeft.x + 1, this.cropperHandleTopLeft.y + 1);
  ctx.lineTo(this.cropperHandleBottomLeft.x + 1, this.cropperHandleBottomLeft.y - 1);
  ctx.stroke();

  //TOP RIGHT -> BOTTOM RIGHT
  ctx.beginPath();
  ctx.moveTo(this.cropperHandleTopRight.x - 1, this.cropperHandleTopRight.y + 1);
  ctx.lineTo(this.cropperHandleBottomRight.x -1, this.cropperHandleBottomRight.y - 1);
  ctx.stroke();

  //BOTTOM LEFT -> BOTTOM RIGHT
  ctx.beginPath();
  ctx.moveTo(this.cropperHandleBottomLeft.x + 1, this.cropperHandleBottomLeft.y - 1);
  ctx.lineTo(this.cropperHandleBottomRight.x - 1, this.cropperHandleBottomRight.y - 1);
  ctx.stroke();

  sizeX = this.cropperHandleBottomRight.x - this.cropperHandleBottomLeft.x;
  sizeY = this.cropperHandleBottomLeft.y - this.cropperHandleTopLeft.y;

  // RULE OF THIRDS - LINE 1/3
  ctx.beginPath();
  ctx.moveTo(this.cropperHandleTopLeft.x + sizeX/3, this.cropperHandleTopLeft.y);
  ctx.lineTo(this.cropperHandleTopLeft.x + sizeX/3, this.cropperHandleBottomLeft.y);
  ctx.stroke();

  // RULE OF THIRDS - LINE 2/3
  ctx.beginPath();
  ctx.moveTo(this.cropperHandleTopLeft.x + sizeX*(2/3), this.cropperHandleTopLeft.y);
  ctx.lineTo(this.cropperHandleTopLeft.x + sizeX*(2/3), this.cropperHandleBottomLeft.y);
  ctx.stroke();

  // RULE OF THIRDS - LINE 1/3
  ctx.beginPath();
  ctx.moveTo(this.cropperHandleTopLeft.x, this.cropperHandleTopLeft.y + sizeY/3);
  ctx.lineTo(this.cropperHandleTopRight.x, this.cropperHandleTopLeft.y + sizeY/3);
  ctx.stroke();

  // RULE OF THIRDS - LINE 2/3
  ctx.beginPath();
  ctx.moveTo(this.cropperHandleTopLeft.x, this.cropperHandleTopLeft.y + sizeY*(2/3));
  ctx.lineTo(this.cropperHandleTopRight.x, this.cropperHandleTopLeft.y + sizeY*(2/3));
  ctx.stroke();
}

CanvasRenderer.prototype._drawImage = function(img){
  var hRatio = this.canvas.width  / img.width;
  var vRatio = this.canvas.height / img.height;
  var ratio  = Math.min (hRatio, vRatio);

  this.ratio = ratio;
  this.offsetX = (this.canvas.width - img.width*ratio) / 2;
  this.offsetY = (this.canvas.height - img.height*ratio) / 2;

  var ctx = this.canvas.getContext("2d");
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ctx.drawImage(img, 0,0, img.width, img.height, this.offsetX, this.offsetY, img.width*ratio, img.height*ratio);


  if(this.renderCropper){
    if(this.cropperHandleTopLeft.x < 0){
      this.initCropper();  
    }

    this.drawCropper(ctx); 
  }
  
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

CanvasRenderer.prototype.applyCrop = function(){
  img = this.tempImage;
  
  line_top = img.height * this.cropRatio.top;
  line_right = img.width * this.cropRatio.right;
  line_bottom = img.height * this.cropRatio.bottom;
  line_left = img.width * this.cropRatio.left;

  var canvas = document.createElement('canvas');
  canvas.width = line_right - line_left;
  canvas.height = line_bottom - line_top;

  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, line_left, line_top, line_right - line_left, line_bottom - line_top, 0, 0, canvas.width, canvas.height);

  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);  
  this._setTempImage(imageData);
  this._saveTempChanges();

  this.cropperHandleTopLeft.reset();
  this.cropperHandleTopRight.reset();
  this.cropperHandleBottomLeft.reset();
  this.cropperHandleBottomRight.reset();

  this._redraw();
}

CanvasRenderer.prototype.applyFilter = function(func){
  this.showProgress();

  setTimeout(function(){
    var imageData = this.canvasImageData[this.canvasImageData.length - 1];
    imageDataCopy = func(imageData, this.copyImageData(imageData));
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
  this.showProgress();

  setTimeout(function(){
    var imageData = this.canvasImageData[this.canvasImageData.length - 1];
    imageDataCopy = Filters.Oil(imageData, this.copyImageData(imageData), range, levels);
    this._setTempImage(imageDataCopy);
    this._redraw(); 
   
    this.hideProgress(); 
  }.bind(this), 100);
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

var CropperHandle = function(x, y){
  this.x = x;
  this.y = y;
}

CropperHandle.prototype.reset = function(){
  this.x = -1;
  this.y = -1;
}

var RatioCrop = function(left, top, right, bottom){
  this.left = left;
  this.top = top;
  this.right = right;
  this.bottom = bottom;
}