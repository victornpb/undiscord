const MOVE = 0;
const RESIZE_T = 1;
const RESIZE_B = 2;
const RESIZE_L = 4;
const RESIZE_R = 8;
const RESIZE_TL = RESIZE_T + RESIZE_L;
const RESIZE_TR = RESIZE_T + RESIZE_R;
const RESIZE_BL = RESIZE_B + RESIZE_L;
const RESIZE_BR = RESIZE_B + RESIZE_R;

/**
 * Make an element draggable/resizable
 * @author Victor N. wwww.vitim.us
 */
export default class DragResize {
  constructor({ elm, moveHandle, options }) {
    this.options = defaultArgs({
      enabledDrag: true,
      enabledResize: true,
      minWidth: 200,
      maxWidth: Infinity,
      minHeight: 100,
      maxHeight: Infinity,
      dragAllowX: true,
      dragAllowY: true,
      resizeAllowX: true,
      resizeAllowY: true,
      draggingClass: 'drag',
      useMouseEvents: true,
      useTouchEvents: true,
      createHandlers: true,
    }, options);
    Object.assign(this, options);
    options = undefined;

    elm.style.position = 'fixed';

    this.drag_m = new Draggable(elm, moveHandle, MOVE, this.options);

    if (this.options.createHandlers) {
      this.el_t = createElement('div', { name: 'grab-t' }, elm);
      this.drag_t = new Draggable(elm, this.el_t, RESIZE_T, this.options);
      this.el_r = createElement('div', { name: 'grab-r' }, elm);
      this.drag_r = new Draggable(elm, this.el_r, RESIZE_R, this.options);
      this.el_b = createElement('div', { name: 'grab-b' }, elm);
      this.drag_b = new Draggable(elm, this.el_b, RESIZE_B, this.options);
      this.el_l = createElement('div', { name: 'grab-l' }, elm);
      this.drag_l = new Draggable(elm, this.el_l, RESIZE_L, this.options);
      this.el_tl = createElement('div', { name: 'grab-tl' }, elm);
      this.drag_tl = new Draggable(elm, this.el_tl, RESIZE_TL, this.options);
      this.el_tr = createElement('div', { name: 'grab-tr' }, elm);
      this.drag_tr = new Draggable(elm, this.el_tr, RESIZE_TR, this.options);
      this.el_br = createElement('div', { name: 'grab-br' }, elm);
      this.drag_br = new Draggable(elm, this.el_br, RESIZE_BR, this.options);
      this.el_bl = createElement('div', { name: 'grab-bl' }, elm);
      this.drag_bl = new Draggable(elm, this.el_bl, RESIZE_BL, this.options);
    }
  }
}

class Draggable {
  constructor(targetElm, handleElm, op, options) {
    Object.assign(this, options);
    options = undefined;

    this._targetElm = targetElm;
    this._handleElm = handleElm;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let initialX, initialY, initialT, initialL, initialW, initialH;

    const clamp = (value, min, max) => value < min ? min : value > max ? max : value;

    const moveOp = (x, y) => {
      const deltaX = (x - initialX);
      const deltaY = (y - initialY);
      const t = clamp(initialT + deltaY, 0, vh - initialH);
      const l = clamp(initialL + deltaX, 0, vw - initialW);
      this._targetElm.style.top = t + 'px';
      this._targetElm.style.left = l + 'px';
    };

    const resizeOp = (x, y) => {
      x = clamp(x, 0, vw);
      y = clamp(y, 0, vh);
      const deltaX = (x - initialX);
      const deltaY = (y - initialY);
      const resizeDirX = (op & RESIZE_L) ? -1 : 1;
      const resizeDirY = (op & RESIZE_T) ? -1 : 1;
      const deltaXMax = (this.maxWidth - initialW);
      const deltaXMin = (this.minWidth - initialW);
      const deltaYMax = (this.maxHeight - initialH);
      const deltaYMin = (this.minHeight - initialH);
      const t = initialT + clamp(deltaY * resizeDirY, deltaYMin, deltaYMax) * resizeDirY;
      const l = initialL + clamp(deltaX * resizeDirX, deltaXMin, deltaXMax) * resizeDirX;
      const w = initialW + clamp(deltaX * resizeDirX, deltaXMin, deltaXMax);
      const h = initialH + clamp(deltaY * resizeDirY, deltaYMin, deltaYMax);
      if (op & RESIZE_T) { // resize ↑
        this._targetElm.style.top = t + 'px';
        this._targetElm.style.height = h + 'px';
      }
      if (op & RESIZE_B) { // resize ↓
        this._targetElm.style.height = h + 'px';
      }
      if (op & RESIZE_L) { // resize ←
        this._targetElm.style.left = l + 'px';
        this._targetElm.style.width = w + 'px';
      }
      if (op & RESIZE_R) { // resize →
        this._targetElm.style.width = w + 'px';
      }
    };

    let operation = op === MOVE ? moveOp : resizeOp;

    function dragStartHandler(e) {
      const touch = e.type === 'touchstart';
      if ((e.buttons === 1 || e.which === 1) || touch) {
        e.preventDefault();
        const x = touch ? e.touches[0].clientX : e.clientX;
        const y = touch ? e.touches[0].clientY : e.clientY;
        initialX = x;
        initialY = y;
        vw = window.innerWidth;
        vh = window.innerHeight;
        initialT = this._targetElm.offsetTop;
        initialL = this._targetElm.offsetLeft;
        initialW = this._targetElm.clientWidth;
        initialH = this._targetElm.clientHeight;
        if (this.useMouseEvents) {
          document.addEventListener('mousemove', this._dragMoveHandler);
          document.addEventListener('mouseup', this._dragEndHandler);
        }
        if (this.useTouchEvents) {
          document.addEventListener('touchmove', this._dragMoveHandler, { passive: false });
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
      // perform drag / resize operation
      operation(x, y);
    }

    function dragEndHandler(e) {
      if (this.useMouseEvents) {
        document.removeEventListener('mousemove', this._dragMoveHandler);
        document.removeEventListener('mouseup', this._dragEndHandler);
      }
      if (this.useTouchEvents) {
        document.removeEventListener('touchmove', this._dragMoveHandler);
        document.removeEventListener('touchend', this._dragEndHandler);
      }
      this._targetElm.classList.remove(this.draggingClass);
    }

    // We need to bind the handlers to this instance
    this._dragStartHandler = dragStartHandler.bind(this);
    this._dragMoveHandler = dragMoveHandler.bind(this);
    this._dragEndHandler = dragEndHandler.bind(this);

    this.enable();
  }

  /** Turn on the drag and drop of the instance */
  enable() {
    this.destroy(); // prevent events from getting binded twice
    if (this.useMouseEvents) this._handleElm.addEventListener('mousedown', this._dragStartHandler);
    if (this.useTouchEvents) this._handleElm.addEventListener('touchstart', this._dragStartHandler, { passive: false });
  }

  /** Teardown all events bound to the document and elements. You can resurrect this instance by calling enable() */
  destroy() {
    this._targetElm.classList.remove(this.draggingClass);
    if (this.useMouseEvents) {
      this._handleElm.removeEventListener('mousedown', this._dragStartHandler);
      document.removeEventListener('mousemove', this._dragMoveHandler);
      document.removeEventListener('mouseup', this._dragEndHandler);
    }
    if (this.useTouchEvents) {
      this._handleElm.removeEventListener('touchstart', this._dragStartHandler);
      document.removeEventListener('touchmove', this._dragMoveHandler);
      document.removeEventListener('touchend', this._dragEndHandler);
    }
  }
}

function createElement(tag='div', attrs, parent) {
  const elm = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => elm.setAttribute(k, v));
  if (parent) parent.appendChild(elm);
  return elm;
}

function defaultArgs(defaults, options) {
  function isObj(x) { return x !== null && typeof x === 'object'; }
  function hasOwn(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
  if (isObj(options)) for (let prop in defaults) {
    if (hasOwn(defaults, prop) && hasOwn(options, prop) && options[prop] !== undefined) {
      if (isObj(defaults[prop])) defaultArgs(defaults[prop], options[prop]);
      else defaults[prop] = options[prop];
    }
  }
  return defaults;
}