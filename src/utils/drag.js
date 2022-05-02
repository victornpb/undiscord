export default class Drag {
  /**
     * Make an element draggable/resizable
     * @param {Element} targetElm The element that will be dragged/resized
     * @param {Element} handleElm The element that will listen to events (handdle/grabber)
     * @param {object} [options] Options
     * @param {string} [options.mode="move"] Define the type of operation (move/resize)
     * @param {number} [options.minWidth=200] Minimum width allowed to resize
     * @param {number} [options.maxWidth=Infinity] Maximum width allowed to resize
     * @param {number} [options.minHeight=100] Maximum height allowed to resize
     * @param {number} [options.maxHeight=Infinity] Maximum height allowed to resize
     * @param {string} [options.draggingClass="drag"] Class added to targetElm while being dragged
     * @param {boolean} [options.useMouseEvents=true] Use mouse events
     * @param {boolean} [options.useTouchEvents=true] Use touch events
     *
     * @author Victor N. wwww.vitim.us
     */
  constructor(targetElm, handleElm, options) {
    this.options = Object.assign({
      mode: 'move',

      minWidth: 200,
      maxWidth: Infinity,
      minHeight: 100,
      maxHeight: Infinity,
      xAxis: true,
      yAxis: true,

      draggingClass: 'drag',

      useMouseEvents: true,
      useTouchEvents: true,
    }, options);

    // Public properties
    this.minWidth = this.options.minWidth;
    this.maxWidth = this.options.maxWidth;
    this.minHeight = this.options.minHeight;
    this.maxHeight = this.options.maxHeight;
    this.xAxis = this.options.xAxis;
    this.yAxis = this.options.yAxis;
    this.draggingClass = this.options.draggingClass;

    /** @private */
    this._targetElm = targetElm;
    /** @private */
    this._handleElm = handleElm;

    const moveOp = (x, y) => {
      let l = x - offLeft;
      if (x - offLeft < 0) l = 0; //offscreen <-
      else if (x - offRight > vw) l = vw - this._targetElm.clientWidth; //offscreen ->
      let t = y - offTop;
      if (y - offTop < 0) t = 0; //offscreen /\
      else if (y - offBottom > vh) t = vh - this._targetElm.clientHeight; //offscreen \/

      if(this.xAxis) this._targetElm.style.left = `${l}px`;
      if(this.yAxis) this._targetElm.style.top = `${t}px`;
      // NOTE: profilling on chrome translate wasn't faster than top/left as expected. And it also permanently creates a new layer, increasing vram usage.
      // this._targetElm.style.transform = `translate(${l}px, ${t}px)`;
    };

    const resizeOp = (x, y) => {
      let w = x - this._targetElm.offsetLeft - offRight;
      if (x - offRight > vw) w = Math.min(vw - this._targetElm.offsetLeft, this.maxWidth); //offscreen ->
      else if (x - offRight - this._targetElm.offsetLeft > this.maxWidth) w = this.maxWidth; //max width
      else if (x - offRight - this._targetElm.offsetLeft < this.minWidth) w = this.minWidth; //min width
      let h = y - this._targetElm.offsetTop - offBottom;
      if (y - offBottom > vh) h = Math.min(vh - this._targetElm.offsetTop, this.maxHeight); //offscreen \/
      else if (y - offBottom - this._targetElm.offsetTop > this.maxHeight) h = this.maxHeight; //max height
      else if (y - offBottom - this._targetElm.offsetTop < this.minHeight) h = this.minHeight; //min height

      if(this.xAxis) this._targetElm.style.width = `${w}px`;
      if(this.yAxis) this._targetElm.style.height = `${h}px`;
    };

    // define which operation is performed on drag
    const operation = this.options.mode === 'move' ? moveOp : resizeOp;

    // offset from the initial click to the target boundaries
    let offTop, offLeft, offBottom, offRight;

    let vw = window.innerWidth;
    let vh = window.innerHeight;


    function dragStartHandler(e) {
      const touch = e.type === 'touchstart';

      if ((e.buttons === 1 || e.which === 1) || touch) {
        e.preventDefault();

        const x = touch ? e.touches[0].clientX : e.clientX;
        const y = touch ? e.touches[0].clientY : e.clientY;

        const targetOffset = this._targetElm.getBoundingClientRect();

        //offset from the click to the top-left corner of the target (drag)
        offTop = y - targetOffset.y;
        offLeft = x - targetOffset.x;
        //offset from the click to the bottom-right corner of the target (resize)
        offBottom = y - (targetOffset.y + targetOffset.height);
        offRight = x - (targetOffset.x + targetOffset.width);

        vw = window.innerWidth;
        vh = window.innerHeight;

        if (this.options.useMouseEvents) {
          document.addEventListener('mousemove', this._dragMoveHandler);
          document.addEventListener('mouseup', this._dragEndHandler);
        }
        if (this.options.useTouchEvents) {
          document.addEventListener('touchmove', this._dragMoveHandler, {
            passive: false,
          });
          document.addEventListener('touchend', this._dragEndHandler);
        }

        this._targetElm.classList.add(this.draggingClass);
      }
    }

    function dragMoveHandler(e) {
      e.preventDefault();
      let x, y;

      const touch = e.type === 'touchmove';
      if (touch) {
        const t = e.touches[0];
        x = t.clientX;
        y = t.clientY;
      } else { //mouse

        // If the button is not down, dispatch a "fake" mouse up event, to stop listening to mousemove
        // This happens when the mouseup is not captured (outside the browser)
        if ((e.buttons || e.which) !== 1) {
          this._dragEndHandler();
          return;
        }

        x = e.clientX;
        y = e.clientY;
      }

      operation(x, y);
    }

    function dragEndHandler(e) {
      if (this.options.useMouseEvents) {
        document.removeEventListener('mousemove', this._dragMoveHandler);
        document.removeEventListener('mouseup', this._dragEndHandler);
      }
      if (this.options.useTouchEvents) {
        document.removeEventListener('touchmove', this._dragMoveHandler);
        document.removeEventListener('touchend', this._dragEndHandler);
      }
      this._targetElm.classList.remove(this.draggingClass);
    }

    // We need to bind the handlers to this instance and expose them to methods enable and destroy
    /** @private */
    this._dragStartHandler = dragStartHandler.bind(this);
    /** @private */
    this._dragMoveHandler = dragMoveHandler.bind(this);
    /** @private */
    this._dragEndHandler = dragEndHandler.bind(this);

    this.enable();
  }

  /**
   * Turn on the drag and drop of the instancea
   * @memberOf Drag
   */
  enable() {
    // this.destroy(); // prevent events from getting binded twice
    if (this.options.useMouseEvents) this._handleElm.addEventListener('mousedown', this._dragStartHandler);
    if (this.options.useTouchEvents) this._handleElm.addEventListener('touchstart', this._dragStartHandler, { passive: false });
  }
  /**
   * Teardown all events bound to the document and elements
   * You can resurrect this instance by calling enable()
   * @memberOf Drag
   */
  destroy() {
    this._targetElm.classList.remove(this.draggingClass);

    if (this.options.useMouseEvents) {
      this._handleElm.removeEventListener('mousedown', this._dragStartHandler);
      document.removeEventListener('mousemove', this._dragMoveHandler);
      document.removeEventListener('mouseup', this._dragEndHandler);
    }
    if (this.options.useTouchEvents) {
      this._handleElm.removeEventListener('touchstart', this._dragStartHandler);
      document.removeEventListener('touchmove', this._dragMoveHandler);
      document.removeEventListener('touchend', this._dragEndHandler);
    }
  }
}