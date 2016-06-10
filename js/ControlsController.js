var ControlsController = function(){
    this.controlsVisible = 0;
    this.dd = document.querySelector('#dragdrop');
    this.loading = document.querySelector('#loading-wrapper');
    this.canvas = document.querySelector('#canvas-wrapper2');

    this.navigation = document.querySelector('#nav-mobile');
    this.navigationMobileCrop = document.querySelector('#mobile-crop-button');
    this.navigationMobileBrightness = document.querySelector('#mobile-brightness-button');
    this.navigationMobileFilters = document.querySelector('#mobile-filters-button');
    this.navigationMobileSave = document.querySelector('#mobile-save-button');
    this.navigationMobileDiscard = document.querySelector('#mobile-discard-button');

    this.cropControlsVisible = 0;

    // ------------- CROP CONTROLS ------------
    cropButton = document.querySelector("#crop-button");
    cropButton.addEventListener("click", this._toggleCropControls.bind(this));
    mobileCropButton = document.querySelector("#mobile-crop-button");
    mobileCropButton.addEventListener("click", this._toggleCropControls.bind(this));

    this._cropControls = document.querySelector("#crop-controls");
    cropSave = document.querySelector("#crop-save");
    cropSave.addEventListener('click', this.handleTempChanges.bind(this, true));
    cropDiscard = document.querySelector("#crop-discard");
    cropDiscard.addEventListener('click', this.handleTempChanges.bind(this, false));

    // ------------- BRIGHTNESS CONTROLS ------------
    brightnessButton = document.querySelector("#brightness-button");
    brightnessButton.addEventListener("click", this._toggleBrightnessControls.bind(this));
    mobileBrightnessButton = document.querySelector("#mobile-brightness-button");
    mobileBrightnessButton.addEventListener("click", this._toggleBrightnessControls.bind(this));

    this._brightnessControls = document.querySelector("#brightness-controls");

    this._brightnessSlider = document.querySelector('#brightness-slider');
    this._brightnessSlider.addEventListener('change', this._updateBrightnessImage.bind(this));

    this._contrastSlider = document.querySelector('#contrast-slider');
    this._contrastSlider.addEventListener('change', this._updateBrightnessImage.bind(this));

    this.dd.addEventListener("drop", this._onDrop.bind(this));
    this.dd.addEventListener("dragover", this._onDragover.bind(this));

    bcSave = document.querySelector('#bc-save');
    bcSave.addEventListener('click', this.handleTempChanges.bind(this, true));
    bcDiscard = document.querySelector('#bc-discard');
    bcDiscard.addEventListener('click', this.handleTempChanges.bind(this, false));

    // ------------ DIALOG ---------------------------
    this.confirmDialog = document.querySelector('#confirmDialog');
    this.confirmTitle = document.querySelector('#confirmTitle');
    this.confirmText = document.querySelector('#confirmText');
    this.confirmDiscard = document.querySelector('#confirmDiscard');
    this.confirmSave = document.querySelector('#confirmSave');
    this.overlay = document.querySelector('#dialogOverlay');

    this.aboutDialog = document.querySelector('#infoAbout');
    this.aboutSave = document.querySelector('#aboutSave');
    this.aboutDiscard = document.querySelector('#aboutDiscard');

    this.downloadDialog = document.querySelector('#downloadDialog');
    this.downloadFileName = document.querySelector('#file_name');
    this.downloadSave = document.querySelector('#downloadSave');
    this.downloadDiscard = document.querySelector('#downloadDiscard');
    this.downloadForm = document.querySelector('#download-form');
    this.downloadForm.addEventListener("submit", this.onDownload.bind(this));

    // --------- FILTERS CONTROLS -------------------
    filtersButton = document.querySelector("#filters-button");
    filtersButton.addEventListener("click", this._toggleFiltersControls.bind(this));
    mobileFiltersButton = document.querySelector("#mobile-filters-button");
    mobileFiltersButton.addEventListener("click", this._toggleFiltersControls.bind(this));

    this._filtersControls = document.querySelector("#filters-controls");

    filterGrayscale = document.querySelector("#filter-grayscale");
    filterGrayscale.addEventListener("click", this._applyFilter.bind(this, Filters.Grayscale));

    filterSepia = document.querySelector("#filter-sepia");
    filterSepia.addEventListener("click", this._applyFilter.bind(this, Filters.Sepia));

    filterSolarize = document.querySelector("#filter-solarize");
    filterSolarize.addEventListener("click", this._applyFilter.bind(this, Filters.Solarize));

    filtersSave = document.querySelector('#filters-save');
    filtersSave.addEventListener('click', this.handleTempChanges.bind(this, true));
    filtersDiscard = document.querySelector('#filters-discard');
    filtersDiscard.addEventListener('click', this.handleTempChanges.bind(this, false));

    // ---------- DISCARD IMAGE CONTROLS ---------------
    discardButton = document.querySelector("#discard-button");
    discardButton.addEventListener("click", this._discardImage.bind(this));
    mobileDiscardButton = document.querySelector("#mobile-discard-button");
    mobileDiscardButton.addEventListener("click", this._discardImage.bind(this));
    // ---------- DISCARD IMAGE CONTROLS ---------------
    saveButton = document.querySelector("#save-button");
    saveButton.addEventListener("click", this._saveImage.bind(this));
    mobileSaveButton = document.querySelector("#mobile-save-button");
    mobileSaveButton.addEventListener("click", this._saveImage.bind(this));

    this.initAudio();

    // ----------- OFFLINE MODE ------------------------
    this.offlineMode = document.querySelector('#offline-mode');
    window.addEventListener("offline", this.onOffline.bind(this));
    window.addEventListener("online", this.onOnline.bind(this));

    // if the page was loaded from cache offline, then offline
    // event won't be triggered, so check it up front
    if(!window.navigator.onLine){
      this.onOffline();
    }

    // ------------ ABOUT -----------------------------
    aboutButton = document.querySelector("#about-button");
    aboutButton.addEventListener("click", function(){
      this._showAbout();
    }.bind(this));

    aboutButtonMobile = document.querySelector("#mobile-about-button");
    aboutButtonMobile.addEventListener("click", function(){
      this._showAbout();
    }.bind(this));
}

ControlsController.prototype.onOffline = function(){
  this._show(this.offlineMode);
}

ControlsController.prototype.onOnline = function(){
  this._hide(this.offlineMode);
}

ControlsController.prototype.initAudio = function(){
  this.audio = new Audio();
  if (this.audio.canPlayType("audio/ogg")) {
      this.audio.src = 'audio/yeah.ogg';
  } else if (this.audio.canPlayType("audio/mpeg")) {
      this.audio.src = 'audio/yeah.mp3';
  }
}

ControlsController.prototype._onDragover = function(e){
    e.preventDefault();
}

ControlsController.prototype._onDrop = function (e) {
    e.preventDefault();
    console.log('_onDrop');
    this._show(this.loading);
    this._hide(this.dd);
    
    var files = e.dataTransfer.files;
    if (files.length > 0) {
      this._readImage(files[0]);   
    }
}

ControlsController.prototype._readImage = function(file) {
  if (file.type.match(/image\/.+/) != null) {  
    var fr = new FileReader();
    fr.addEventListener("load", this._setImage.bind(this));
    fr.readAsDataURL(file); 
  } else {
    this._hide(this.loading);
    this._show(this.dd);  
  }
}

ControlsController.prototype.showCanvas = function(){
    this._hide(this.dd);
    this._hide(this.loading);
    this._show(this.canvas);
    this._show(this.navigation);
    this._show(this.navigationMobileCrop);
    this._show(this.navigationMobileBrightness);
    this._show(this.navigationMobileFilters);
    this._show(this.navigationMobileSave);
    this._show(this.navigationMobileDiscard);
}

ControlsController.prototype.hideCanvas = function(){
    this._show(this.dd);
    this._hide(this.canvas);
    this.hideAllControls();
    this._hide(this.navigation);
    this._hide(this.navigationMobileCrop);
    this._hide(this.navigationMobileBrightness);
    this._hide(this.navigationMobileFilters);
    this._hide(this.navigationMobileSave);
    this._hide(this.navigationMobileDiscard);
}

ControlsController.prototype._setImage = function(e) {
  var img = new Image();
  img.onload = function () {
    this.showCanvas();
    this.canvasRenderer._setBaseImage(img);
  }.bind(this);
  
  img.src = e.target.result;
}

ControlsController.prototype._saveImage = function(){
  this._showDownload();
}

ControlsController.prototype.onDownload = function(e){
  e.preventDefault();

  this._hideDownload();
  this.canvasRenderer._saveImage(this.downloadFileName.value);
  this._playYeeeeeeeaaaah();
}

ControlsController.prototype._discardImage = function(){
  this._showConfirm('Discard Image?',
                    'Do you really want to discard your image without saving?',
                    'Discard',
                    function () {
                      this.canvasRenderer._discardImage();
                      this.hideCanvas();
                    }.bind(this),
                    'Cancel',
                    function() {}.bind(this));
}

ControlsController.prototype._toggleCropControls = function () {
  if(this.controlsVisible == 1){
    this.promptUnsavedChanges();
  } else {
    this.canvasRenderer.resetCropper();

    this.controlsVisible = 1;
    this.cropControlsVisible = 1;
    this._show(this._cropControls);

    this.canvasRenderer._setEditMode(this.cropControlsVisible);
    this.canvasRenderer._redraw();

    this.canvasRenderer.setRenderCropper(true);
    this.canvasRenderer._redraw();
  }    
};

ControlsController.prototype._toggleBrightnessControls = function () {
    if(this.controlsVisible == 1){
      this.promptUnsavedChanges();
      return;
    } else {
      this.controlsVisible = 1;
      this.canvasRenderer._setEditMode(1);
      this._brightnessSlider.value = "0";
      this._contrastSlider.value = "0";
      this._show(this._brightnessControls);
    }
};

ControlsController.prototype.promptUnsavedChanges = function(){
  this._showConfirm('Unsaved changes',
                    'Do you want to save changes?',
                    'Save',
                    this.handleTempChanges.bind(this, true),
                    'Discard',
                    this.handleTempChanges.bind(this, false));
}

ControlsController.prototype.handleTempChanges = function(saveTempChanges) {

  if(saveTempChanges){
    if(this.cropControlsVisible){
      this.canvasRenderer.applyCrop();
    } else {
      this.canvasRenderer._saveTempChanges();  
    }
  } else {
    this.canvasRenderer._resetTempChanges();  
  }
  
  this.hideAllControls(); 
  this.canvasRenderer._setEditMode(0);
  this.canvasRenderer._redraw();  
}

ControlsController.prototype.hideAllControls = function(){
  this._hide(this._cropControls);
  this._hide(this._brightnessControls);
  this._hide(this._filtersControls);
  this.canvasRenderer.setRenderCropper(false);

  this.controlsVisible = 0;
  this.cropControlsVisible = 0;
}

ControlsController.prototype._toggleFiltersControls = function () {
  if(this.controlsVisible == 1){
    this.promptUnsavedChanges();
    return;
  } else {
    this.controlsVisible = 1;
    this._show(this._filtersControls);
    this.canvasRenderer._setEditMode(1);
    this.canvasRenderer._redraw();
  }
};

ControlsController.prototype._updateBrightnessImage = function(){
  this.currentBrightness = this._brightnessSlider.value;  
  this.currentContrast = this._contrastSlider.value;
  console.log("Setting brightness and contrast: [" + this.currentBrightness + ", " + this.currentContrast + "]");

  this.canvasRenderer.applyBrightnessContrast(parseInt(this.currentBrightness), parseInt(this.currentContrast));
}

ControlsController.prototype._applyFilter = function(func){
  this.canvasRenderer.applyFilter(func);
}

ControlsController.prototype._applyOil = function(){
  this.canvasRenderer.applyOil(3, 128);
}

ControlsController.prototype._setOnCanvasRenderer = function (listener) {
  this.canvasRenderer = listener;

  this._hide(this.navigation);
  this._hide(this.navigationMobileCrop);
  this._hide(this.navigationMobileBrightness);
  this._hide(this.navigationMobileFilters);
  this._hide(this.navigationMobileSave);
  this._hide(this.navigationMobileDiscard);
};

ControlsController.prototype._show = function(element){
  if(isFlexable(element)){
    element.style.display = 'flex';
  } else {
    element.style.display = 'block';  
  }
  
  this.canvasRenderer._onResize();
}

ControlsController.prototype._hide = function(element){
  element.style.display = 'none';
  this.canvasRenderer._onResize();
}

function isFlexable(element){
  return hasClass(element, "flexable");
}

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

ControlsController.prototype._showConfirm = function(title, label, labelPositive, positive, labelNegative, negative) {
    this.confirmTitle.innerHTML = title;
    this.confirmText.innerHTML = label;
    this.confirmSave.innerHTML = labelPositive;
    this.confirmDiscard.innerHTML = labelNegative;

    this.confirmSave.onclick = function(){
      this._hideConfirm();
      positive();
    }.bind(this);

    this.confirmDiscard.onclick = function(){
      this._hideConfirm();
      negative();
    }.bind(this);

    this.confirmDialog.className += " md-show";
    this.overlay.className += " md-show";  
}

ControlsController.prototype._hideConfirm = function(){
    this.confirmDialog.className = this.confirmDialog.className.replace(/(?:^|\s)md-show(?!\S)/g , '');
    this.overlay.className = this.overlay.className.replace(/(?:^|\s)md-show(?!\S)/g , '');
}

ControlsController.prototype._showAbout = function() {
    this.aboutSave.onclick = function(){
      this._hideAbout();
    }.bind(this);

    this.aboutDiscard.onclick = function(){
      this._hideAbout();
    }.bind(this);

    this.aboutDialog.className += " md-show";
    this.overlay.className += " md-show";  
}

ControlsController.prototype._hideAbout = function(){
    this.aboutDialog.className = this.aboutDialog.className.replace(/(?:^|\s)md-show(?!\S)/g , '');
    this.overlay.className = this.overlay.className.replace(/(?:^|\s)md-show(?!\S)/g , '');
}

ControlsController.prototype._showDownload = function() {
    this.downloadSave.onclick = function(){
      // calling form.submit() doesn't trigger onSubmit event
      // so create a button in the form, click it and remove it
      var button = this.downloadForm.ownerDocument.createElement('input');
      button.style.display = 'none'; 
      button.type = 'submit';
      this.downloadForm.appendChild(button).click();
      this.downloadForm.removeChild(button);
    }.bind(this);

    this.downloadDiscard.onclick = function(){
      this._hideDownload();
    }.bind(this);

    this.downloadDialog.className += " md-show";
    this.overlay.className += " md-show";  
}

ControlsController.prototype._hideDownload = function(){
    this.downloadDialog.className = this.downloadDialog.className.replace(/(?:^|\s)md-show(?!\S)/g , '');
    this.overlay.className = this.overlay.className.replace(/(?:^|\s)md-show(?!\S)/g , '');
}

// ---------------

ControlsController.prototype._playYeeeeeeeaaaah = function () {
    if (this.audio.paused)
       this.audio.play(); 
    else {
        this.audio.pause(); 
    }
}
