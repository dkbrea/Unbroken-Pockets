'use client';
'use strict';

var utils = require('@chakra-ui/utils');
var sync = require('framesync');

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class PanEvent {
  constructor(event, handlers, threshold) {
    /**
     * We use this to keep track of the `x` and `y` pan session history
     * as the pan event happens. It helps to calculate the `offset` and `delta`
     */
    __publicField(this, "history", []);
    // The pointer event that started the pan session
    __publicField(this, "startEvent", null);
    // The current pointer event for the pan session
    __publicField(this, "lastEvent", null);
    // The current pointer event info for the pan session
    __publicField(this, "lastEventInfo", null);
    __publicField(this, "handlers", {});
    __publicField(this, "removeListeners", () => {
    });
    /**
     * Minimal pan distance required before recognizing the pan.
     * @default "3px"
     */
    __publicField(this, "threshold", 3);
    __publicField(this, "win");
    __publicField(this, "updatePoint", () => {
      if (!(this.lastEvent && this.lastEventInfo))
        return;
      const info = getPanInfo(this.lastEventInfo, this.history);
      const isPanStarted = this.startEvent !== null;
      const isDistancePastThreshold = distance(info.offset, { x: 0, y: 0 }) >= this.threshold;
      if (!isPanStarted && !isDistancePastThreshold)
        return;
      const { timestamp } = sync.getFrameData();
      this.history.push({ ...info.point, timestamp });
      const { onStart, onMove } = this.handlers;
      if (!isPanStarted) {
        onStart?.(this.lastEvent, info);
        this.startEvent = this.lastEvent;
      }
      onMove?.(this.lastEvent, info);
    });
    __publicField(this, "onPointerMove", (event, info) => {
      this.lastEvent = event;
      this.lastEventInfo = info;
      sync.update(this.updatePoint, true);
    });
    __publicField(this, "onPointerUp", (event, info) => {
      const panInfo = getPanInfo(info, this.history);
      const { onEnd, onSessionEnd } = this.handlers;
      onSessionEnd?.(event, panInfo);
      this.end();
      if (!onEnd || !this.startEvent)
        return;
      onEnd?.(event, panInfo);
    });
    this.win = event.view ?? window;
    if (utils.isMultiTouchEvent(event))
      return;
    this.handlers = handlers;
    if (threshold) {
      this.threshold = threshold;
    }
    event.stopPropagation();
    event.preventDefault();
    const info = { point: utils.getEventPoint(event) };
    const { timestamp } = sync.getFrameData();
    this.history = [{ ...info.point, timestamp }];
    const { onSessionStart } = handlers;
    onSessionStart?.(event, getPanInfo(info, this.history));
    this.removeListeners = pipe(
      utils.addPointerEvent(this.win, "pointermove", this.onPointerMove),
      utils.addPointerEvent(this.win, "pointerup", this.onPointerUp),
      utils.addPointerEvent(this.win, "pointercancel", this.onPointerUp)
    );
  }
  updateHandlers(handlers) {
    this.handlers = handlers;
  }
  end() {
    this.removeListeners?.();
    sync.cancelSync.update(this.updatePoint);
  }
}
function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}
function getPanInfo(info, history) {
  return {
    point: info.point,
    delta: subtract(info.point, history[history.length - 1]),
    offset: subtract(info.point, history[0]),
    velocity: getVelocity(history, 0.1)
  };
}
const toMilliseconds = (v) => v * 1e3;
function getVelocity(history, timeDelta) {
  if (history.length < 2) {
    return { x: 0, y: 0 };
  }
  let i = history.length - 1;
  let timestampedPoint = null;
  const lastPoint = history[history.length - 1];
  while (i >= 0) {
    timestampedPoint = history[i];
    if (lastPoint.timestamp - timestampedPoint.timestamp > toMilliseconds(timeDelta)) {
      break;
    }
    i--;
  }
  if (!timestampedPoint) {
    return { x: 0, y: 0 };
  }
  const time = (lastPoint.timestamp - timestampedPoint.timestamp) / 1e3;
  if (time === 0) {
    return { x: 0, y: 0 };
  }
  const currentVelocity = {
    x: (lastPoint.x - timestampedPoint.x) / time,
    y: (lastPoint.y - timestampedPoint.y) / time
  };
  if (currentVelocity.x === Infinity) {
    currentVelocity.x = 0;
  }
  if (currentVelocity.y === Infinity) {
    currentVelocity.y = 0;
  }
  return currentVelocity;
}
function pipe(...fns) {
  return (v) => fns.reduce((a, b) => b(a), v);
}
function distance1D(a, b) {
  return Math.abs(a - b);
}
function isPoint(point) {
  return "x" in point && "y" in point;
}
function distance(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return distance1D(a, b);
  }
  if (isPoint(a) && isPoint(b)) {
    const xDelta = distance1D(a.x, b.x);
    const yDelta = distance1D(a.y, b.y);
    return Math.sqrt(xDelta ** 2 + yDelta ** 2);
  }
  return 0;
}

exports.PanEvent = PanEvent;
exports.distance = distance;
