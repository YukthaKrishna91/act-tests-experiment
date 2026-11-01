import { parseBuffer } from 'codem-isoboxer';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildFileType,
  buildMovie,
  buildMovieData,
  buildMovieFragment,
  buildMovieFragmentHeader,
  buildMovieHeader
} from './buildIsoBox.js';

describe('ftyp', () => {
  it('builds a FileType [ftyp] box', () => {
    const isoFile = parseBuffer(
      buildFileType({ majorBrand: 'isom', minorVersion: 1, compatibleBrands: ['isom'] })
    );

    const [ftypBox] = isoFile.boxes;

    assert.equal(ftypBox.type, 'ftyp');
    assert.equal(ftypBox.size, 20);
    assert.equal(isoFile.boxes.length, 1);
  });
});

describe('mdat', () => {
  it('builds a Movie Data [mdat] box', () => {
    const isoFile = parseBuffer(
      buildMovieData(new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer)
    );

    const [mdatBox] = isoFile.boxes;

    assert.equal(mdatBox.type, 'mdat');
    assert.equal(mdatBox.size, 14);
  });
});

describe('moof', () => {
  it('builds a Movie Fragment [moof] box', () => {
    const isoFile = parseBuffer(
      buildMovieFragment({ header: buildMovieFragmentHeader({ sequenceNumber: 1 }) })
    );

    const [moofBox] = isoFile.boxes;

    assert.equal(moofBox.type, 'moof');
    assert.equal(moofBox.size, 24);

    const [mfhdBox] = moofBox.boxes;

    assert.equal(mfhdBox.type, 'mfhd');
    assert.equal(mfhdBox.size, 16);
    assert.equal(mfhdBox.sequence_number, 1);
  });
});

describe('moov', () => {
  it('builds a Movie [moov] box', () => {
    const isoFile = parseBuffer(
      buildMovie({ header: buildMovieHeader({ duration: 0, timescale: 600, nextTrackId: 2 }) })
    );

    const [moovBox] = isoFile.boxes;

    assert.equal(moovBox.type, 'moov');
    assert.equal(moovBox.size, 116);

    const [mvhdBox] = moovBox.boxes;

    assert.equal(mvhdBox.type, 'mvhd');
    assert.equal(mvhdBox.size, 108);
    assert.equal(mvhdBox.duration, 0);
    assert.equal(mvhdBox.timescale, 600);
    assert.equal(mvhdBox.next_track_ID, 2);

    // defaults
    assert.equal(mvhdBox.version, 0);
    assert.equal(mvhdBox.flags, 0);
    assert.equal(mvhdBox.rate, 1);
    assert.equal(mvhdBox.volume, 1);
    assert.deepEqual(mvhdBox.matrix, [1, 0, 0, 0, 1, 0, 0, 0, 16384]);

    assert.equal(isoFile.boxes.length, 1);
    assert.equal(moovBox.boxes.length, 1);
  });
});
