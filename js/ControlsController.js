var ControlsController = function(){
    // ------------- CROP CONTROLS ------------

    cropButton = document.querySelector("#crop-button");
    cropButton.addEventListener("click", this._toggleCropControls.bind(this));

    this._cropControls = document.querySelector("#crop-controls");
    this.dd = document.querySelector('#dragdrop');
    this.cropControlsVisible = 0;

    // ------------- BRIGHTNESS CONTROLS ------------

    brightnessButton = document.querySelector("#brightness-button");
    brightnessButton.addEventListener("click", this._toggleBrightnessControls.bind(this));

    this._brightnessControls = document.querySelector("#brightness-controls");
    this.brightnessControlsVisible = 0;

    this._brightnessSlider = document.querySelector('#brightness-slider');
    this._brightnessSlider.addEventListener('change', this._updateBrightnessImage.bind(this));

    this._contrastSlider = document.querySelector('#contrast-slider');
    this._contrastSlider.addEventListener('change', this._updateBrightnessImage.bind(this));

    this.dd.addEventListener("drop", this._onDrop.bind(this));
    this.dd.addEventListener("dragover", this._onDragover.bind(this));
}

ControlsController.prototype._onDragover = function(e){
    e.preventDefault();
}

ControlsController.prototype._onDrop = function (e) {
    e.preventDefault();
    console.log('_onDrop');
    
    var files = e.dataTransfer.files;
    if (files.length > 0) {
      // this._showInfo(files);
      console.log(files);
    }
}

ControlsController.prototype._toggleCropControls = function () {
    if(this.cropControlsVisible == 0){
      this.cropControlsVisible = 1;
      this._show(this._cropControls);
    } else {
      this.cropControlsVisible = 0;
      this._hide(this._cropControls);
    }
};

ControlsController.prototype._toggleBrightnessControls = function () {
    if(this.brightnessControlsVisible == 0){
      this.brightnessControlsVisible = 1;
      this._brightnessSlider.value = "0";
      this._contrastSlider.value = "0";
      this._show(this._brightnessControls);
    } else {
      this.brightnessControlsVisible = 0;
      this._hide(this._brightnessControls);
    }
};

ControlsController.prototype._updateBrightnessImage = function(){
  this.currentBrightness = this._brightnessSlider.value;  
  this.currentContrast = this._contrastSlider.value;
  console.log("Setting brightness and contrast: [" + this.currentBrightness + ", " + this.currentContrast + "]");

  this.canvasRenderer.applyBrightnessContrast(parseInt(this.currentBrightness), parseInt(this.currentContrast));
}

ControlsController.prototype._setOnCanvasRenderer = function (listener) {
  this.canvasRenderer = listener;
};

ControlsController.prototype._show = function(element){
  element.style.display = 'block';
  this.canvasRenderer._onResize();
}

ControlsController.prototype._hide = function(element){
  element.style.display = 'none';
  this.canvasRenderer._onResize();
}
