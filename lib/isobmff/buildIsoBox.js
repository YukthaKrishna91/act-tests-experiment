import { createBinaryPointer } from '../binary/createBinaryPointer.js';

function encodeText(encoder, text) {
  const bytes = encoder.encode(text);

  return new DataView(bytes.buffer);
}

/**
 * @see {@link https://mp4ra.org/registered-types/boxes|ISOBMFF Boxes}
 *
 * @param {string} type
 * @param {number} byteLength
 * @returns {DataView<ArrayBuffer>}
 */
function createIsoBox(type, byteLength) {
  const sizeByteLength = 4;
  const typeByteLength = 4;

  const buffer = new ArrayBuffer(sizeByteLength + typeByteLength + byteLength);

  const headerView = new DataView(buffer, 0, sizeByteLength + typeByteLength);

  const textEncoder = new TextEncoder();

  headerView.setUint32(0, buffer.byteLength);
  headerView.setUint32(4, encodeText(textEncoder, type).getUint32(0));

  return new DataView(buffer, sizeByteLength + typeByteLength);
}

export function buildFileType({ majorBrand, minorVersion, compatibleBrands = [] }) {
  if (!compatibleBrands.includes(majorBrand)) {
    throw new TypeError(
      `[ftyp] compatible brands must include the major brand of the box. (got [${compatibleBrands.map((brand) => `'${brand}'`).join(',')}])`
    );
  }

  const view = createIsoBox('ftyp', 8 + 4 * compatibleBrands.length);

  const textEncoder = new TextEncoder();

  const pointer = createBinaryPointer();

  // set body
  view.setUint32(pointer.useBytes(4), encodeText(textEncoder, majorBrand).getUint32(0));

  view.setUint32(pointer.useBytes(4), minorVersion);

  for (const brand of compatibleBrands) {
    view.setUint32(pointer.useBytes(4), encodeText(textEncoder, brand).getUint32(0));
  }

  return view.buffer;
}

export function buildMovie({ header }) {
  const view = createIsoBox('moov', header.byteLength);

  const uint8View = new Uint8Array(view.buffer);

  uint8View.set(new Uint8Array(header), view.byteOffset);

  return view.buffer;
}

export function buildMovieHeader({
  duration,
  timescale,
  nextTrackId,
  flags = [],
  rate = 1.0 << 16,
  volume = 1.0 << 8,
  creationTime = 0,
  modificationTime = 0,
  matrix = [1 << 16, 0, 0, 0, 1 << 16, 0, 0, 0, 1 << 30] // identity matrix – idk why the last element is 16384.16b
}) {
  const version =
    typeof duration === 'bigint' ||
    typeof creationTime === 'bigint' ||
    typeof modificationTime === 'bigint'
      ? 1 // 64 bit  creationTime, modificationTime, and timeScale
      : 0; // 32 bit creationTime, modificationTime, and timeScale

  const versioned = {
    setCreationTime(offset, time) {
      const setBytes = (version === 1 ? view.setBigUint64 : view.setUint32).bind(view);

      setBytes(offset, version === 1 ? BigInt(time) : time);
    },
    setModificationTime(offset, time) {
      const setBytes = (version === 1 ? view.setBigUint64 : view.setUint32).bind(view);

      setBytes(offset, version === 1 ? BigInt(time) : time);
    },
    setDuration(offset, duration) {
      const setBytes = (version === 1 ? view.setBigUint64 : view.setUint32).bind(view);

      setBytes(offset, version === 1 ? BigInt(duration) : duration);
    }
  };

  const byteLength = version === 1 ? 112 : 100;

  const view = createIsoBox('mvhd', byteLength);

  const pointer = createBinaryPointer();

  view.setUint8(pointer.useBytes(1), version);

  for (let flagsSoFar = 0; flagsSoFar < 3; flagsSoFar += 1) {
    view.setUint8(pointer.useBytes(1), flags[flagsSoFar] ?? 0);
  }

  versioned.setCreationTime(pointer.useBytes(version === 1 ? 8 : 4), creationTime);
  versioned.setModificationTime(pointer.useBytes(version === 1 ? 8 : 4), modificationTime);

  view.setUint32(pointer.useBytes(4), timescale);

  versioned.setDuration(pointer.useBytes(version === 1 ? 8 : 4), duration);

  view.setUint32(pointer.useBytes(4), rate);
  view.setUint16(pointer.useBytes(2), volume);

  // reserved area
  pointer.useBytes(10);

  for (let elementsSoFar = 0; elementsSoFar < 9; elementsSoFar += 1) {
    view.setUint32(pointer.useBytes(4), matrix[elementsSoFar]);
  }

  // predefined area
  pointer.useBytes(24);

  view.setUint32(pointer.useBytes(4), nextTrackId);

  return view.buffer;
}

export function buildMovieFragment({ header }) {
  const view = createIsoBox('moof', header.byteLength);

  const uint8View = new Uint8Array(view.buffer);

  uint8View.set(new Uint8Array(header), view.byteOffset);

  return view.buffer;
}

export function buildMovieFragmentHeader({ sequenceNumber, flags = [] }) {
  const version = 0;

  const view = createIsoBox('mfhd', 8);

  const pointer = createBinaryPointer();

  view.setUint8(pointer.useBytes(1), version);

  for (let flagsSoFar = 0; flagsSoFar < 3; flagsSoFar += 1) {
    view.setUint8(pointer.useBytes(1), flags[flagsSoFar] ?? 0);
  }

  view.setUint32(pointer.useBytes(4), sequenceNumber);

  return view.buffer;
}

export function buildMovieData(bytes) {
  const view = createIsoBox('mdat', bytes.byteLength);

  const uint8View = new Uint8Array(view.buffer);

  uint8View.set(new Uint8Array(bytes), view.byteOffset);

  return view.buffer;
}

export function buildEventMessage() {
  // these are the raw bytes of an 'emsg' box taken from 'rd-test-card-ll'
  const rawEmsgBox = [
    0, 0, 0, 170, 101, 109, 115, 103, 0, 0, 0, 0, 116, 97, 103, 58, 114, 100, 109, 101, 100, 105,
    97, 46, 98, 98, 99, 46, 99, 111, 46, 117, 107, 44, 50, 48, 49, 52, 58, 101, 118, 101, 110, 116,
    115, 47, 98, 97, 108, 108, 112, 111, 115, 105, 116, 105, 111, 110, 0, 49, 0, 0, 0, 0, 200, 0, 0,
    2, 171, 0, 0, 0, 0, 0, 0, 14, 18, 123, 32, 34, 120, 49, 34, 32, 58, 32, 49, 51, 48, 49, 44, 32,
    34, 121, 49, 34, 32, 58, 32, 54, 52, 48, 44, 32, 34, 120, 50, 34, 32, 58, 32, 49, 51, 56, 57,
    44, 32, 34, 121, 50, 34, 32, 58, 32, 55, 50, 56, 44, 32, 34, 99, 111, 108, 111, 117, 114, 34,
    32, 58, 32, 34, 35, 48, 48, 70, 70, 48, 48, 34, 44, 32, 34, 115, 104, 97, 112, 101, 34, 32, 58,
    32, 34, 99, 114, 111, 115, 115, 34, 32, 125
  ];
  const unit8View = new Uint8Array(rawEmsgBox);
  return unit8View.buffer;
}
