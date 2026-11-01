/* eslint-disable no-unused-vars */

/* Event Polyfill */
(function () {
  try {
    var event = new window.Event('event', { bubbles: true, cancelable: true });
  } catch (error) {
    var EventOriginal = window.CustomEvent || window.Event;
    var Event = function (eventName, params) {
      params = params || {};
      var event = document.createEvent('Event');
      event.initEvent(
        eventName,
        params.bubbles === void 0 ? false : params.bubbles,
        params.cancelable === void 0 ? false : params.cancelable,
        params.detail === void 0 ? {} : params.detail
      );
      return event;
    };
    Event.prototype = EventOriginal.prototype;
    window.Event = Event;
  }
})();

/* CustomEvent Polyfill */
(function () {
  try {
    var event = new window.CustomEvent('event', { bubbles: true, cancelable: true });
  } catch (error) {
    var CustomEventOriginal = window.CustomEvent || window.Event;
    var CustomEvent = function (eventName, params) {
      params = params || {};
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent(
        eventName,
        params.bubbles === void 0 ? false : params.bubbles,
        params.cancelable === void 0 ? false : params.cancelable,
        params.detail === void 0 ? {} : params.detail
      );
      return event;
    };
    CustomEvent.prototype = CustomEventOriginal.prototype;
    window.CustomEvent = CustomEvent;
  }
})();
