export function addEventListeners(eventTarget, eventTypes, eventListener) {
  for (const eventType of eventTypes) {
    eventTarget.addEventListener(eventType, eventListener);
  }

  return function removeEventListeners() {
    for (const eventType of eventTypes) {
      eventTarget.removeEventListener(eventType, eventListener);
    }
  };
}
