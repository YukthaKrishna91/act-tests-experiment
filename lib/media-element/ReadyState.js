export const HAVE_NOTHING = 0;
// init segments
export const HAVE_METADATA = 1;
// current (at least one) audio sample, current video frame
export const HAVE_CURRENT_DATA = 2;
export const HAVE_FUTURE_DATA = 3;
// enough to play through to the end
export const HAVE_ENOUGH_DATA = 4;
