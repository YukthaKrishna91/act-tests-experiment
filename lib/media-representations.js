/**
 * @file Defines expected properties of each stream type we use.
 */

export const TransferEncoding = {
  Chunked: 'chunked'
};

export const HEVC_UHD_50FPS_LIVE = {
  VIDEO: {
    // pv54
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.2.4.L153.00.00.B0',
      bandwidth: 24000000,
      sampleRate: 50,
      width: 3840,
      height: 2160
    },
    // pv51
    LOWEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.2.4.L93.00.00.B0',
      bandwidth: 1600000,
      sampleRate: 50,
      width: 960,
      height: 540
    }
  },
  AUDIO: {
    // pa9
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 192000,
      sampleRate: 48000
    }
  }
};

export const HEVC_UHD_50FPS_ONDEMAND = {
  VIDEO: {
    // pv74
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.2.4.H153.00.00.90',
      bandwidth: 27843128,
      sampleRate: 50,
      width: 3840,
      height: 2160
    },
    // pv67
    LOWEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.2.4.L90.00.00.90',
      bandwidth: 2077872,
      sampleRate: 50,
      width: 768,
      height: 432
    }
  },
  AUDIO: {
    // pa9
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 190424,
      sampleRate: 48000
    }
  }
};

export const HEVC_UHD_25FPS_ONDEMAND = {
  VIDEO: {
    // pv62
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.2.4.L153.00.00.90',
      bandwidth: 30777568,
      sampleRate: 25,
      width: 3840,
      height: 2160
    },
    // pv55
    LOWEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.2.4.L90.00.00.90',
      bandwidth: 1946576,
      sampleRate: 25,
      width: 768,
      height: 432
    }
  },
  AUDIO: {
    // pa9
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 190816,
      sampleRate: 48000
    }
  }
};

export const HEVC_FHD_50FPS_LIVE = {
  VIDEO: {
    // pv66
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.1.6.L123.B0',
      bandwidth: 6500000,
      sampleRate: 50,
      width: 1920,
      height: 1080
    },
    // pv64
    LOWEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.1.6.L93.B0',
      bandwidth: 1800000,
      sampleRate: 50,
      width: 960,
      height: 540
    }
  },
  AUDIO: {
    // pa6
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 320000,
      sampleRate: 48000
    }
  }
};

export const HEVC_FHD_50FPS_ONDEMAND = {
  VIDEO: {
    // pv71
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.2.4.L150.00.00.90',
      bandwidth: 10296576,
      sampleRate: 50,
      width: 1920,
      height: 1080
    },
    // pv67
    LOWEST: {
      bitrateControl: 'cbr',
      codecFamily: 'hevc',
      codecs: 'hev1.2.4.L90.00.00.90',
      bandwidth: 2077872,
      sampleRate: 50,
      width: 768,
      height: 432
    }
  },
  AUDIO: {
    // pa9
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 190424,
      sampleRate: 48000
    }
  }
};

export const AVC_FHD_50FPS_ONDEMAND = {
  VIDEO: {
    // pv44
    HIGHEST: {
      bitrateControl: 'vbr',
      codecFamily: 'avc',
      codecs: 'avc3.64002A',
      bandwidth: 12000000,
      sampleRate: 50,
      width: 1920,
      height: 1080
    }
  },
  AUDIO: {
    // pa4
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 128000,
      sampleRate: 48000
    }
  }
};

export const AVC_HD_50FPS_LIVE = {
  VIDEO: {
    // pv14
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'avc',
      codecs: 'avc3.640020',
      bandwidth: 5070016,
      sampleRate: 50,
      width: 1280,
      height: 720
    }
  },
  AUDIO: {
    // pa4
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 128000,
      sampleRate: 48000
    }
  }
};

export const AVC_HD_50FPS_LIVE_CHUNKED = {
  VIDEO: {
    // pv14
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'avc',
      codecs: 'avc3.640020',
      bandwidth: 5458896,
      sampleRate: 50,
      width: 1280,
      height: 720,
      transferEncoding: TransferEncoding.Chunked
    }
  },
  AUDIO: {
    // pa4
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 126536,
      sampleRate: 48000
    }
  }
};

export const AVC_HD_50FPS_ONDEMAND = {
  VIDEO: {
    // pv14
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'avc',
      codecs: 'avc3.640020',
      bandwidth: 5070000,
      sampleRate: 50,
      width: 1280,
      height: 720
    }
  },
  AUDIO: {
    // pa4
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 128000,
      sampleRate: 48000
    }
  }
};

export const AAC_48KHZ = {
  AUDIO: {
    // pa6
    HIGHEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.2',
      bandwidth: 320000,
      sampleRate: 48000
    },
    // pa2
    LOWEST: {
      bitrateControl: 'cbr',
      codecFamily: 'aac',
      codecs: 'mp4a.40.5',
      bandwidth: 48000,
      sampleRate: 48000
    }
  }
};
