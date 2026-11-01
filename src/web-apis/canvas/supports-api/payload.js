function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function createTitle(text) {
  var $title = document.createElement('h2');
  $title.textContent = text;
  return $title;
}

var imgResultData = {
  675: 255,
  678: 252,
  679: 255,
  682: 245,
  683: 255,
  686: 231,
  687: 255,
  690: 218,
  691: 255,
  694: 212,
  695: 255,
  698: 211,
  767: 255,
  770: 250,
  771: 255,
  774: 225,
  775: 255,
  778: 156,
  779: 255,
  782: 132,
  783: 255,
  786: 134,
  787: 255,
  790: 128,
  791: 255,
  794: 124,
  795: 255,
  798: 123,
  863: 255,
  866: 244,
  867: 255,
  870: 186,
  871: 255,
  874: 153,
  875: 255,
  878: 135,
  879: 255,
  882: 99,
  883: 255,
  886: 91,
  887: 255,
  890: 91,
  891: 255,
  894: 90,
  895: 255,
  898: 115,
  963: 255,
  966: 169,
  967: 255,
  970: 143,
  971: 255,
  974: 151,
  975: 255,
  978: 145,
  979: 255,
  982: 108,
  983: 255,
  986: 71,
  987: 255,
  990: 76,
  991: 255,
  994: 78,
  995: 255,
  998: 91,
  1055: 255,
  1058: 254,
  1059: 255,
  1062: 217,
  1063: 255,
  1066: 152,
  1067: 255,
  1070: 144,
  1071: 255,
  1074: 145,
  1075: 255,
  1078: 141,
  1079: 255,
  1082: 97,
  1083: 255,
  1086: 51,
  1087: 255,
  1090: 59,
  1091: 255,
  1094: 59,
  1095: 255,
  1098: 59,
  1155: 255,
  1158: 234,
  1159: 255,
  1162: 127,
  1163: 255,
  1166: 138,
  1167: 255,
  1170: 145,
  1171: 255,
  1174: 140,
  1175: 255,
  1178: 133,
  1179: 255,
  1182: 75,
  1183: 255,
  1186: 47,
  1187: 255,
  1190: 45,
  1191: 255,
  1194: 47,
  1195: 255,
  1198: 58,
  1255: 255,
  1258: 204,
  1259: 255,
  1262: 89,
  1263: 255,
  1266: 98,
  1267: 255,
  1270: 126,
  1271: 255,
  1274: 137,
  1275: 255,
  1278: 110,
  1279: 255,
  1282: 109,
  1283: 255,
  1286: 117,
  1287: 255,
  1290: 64,
  1291: 255,
  1294: 49,
  1295: 255,
  1298: 55,
  1355: 255,
  1358: 209,
  1359: 255,
  1362: 90,
  1363: 255,
  1366: 68,
  1367: 255,
  1370: 84,
  1371: 255,
  1374: 95,
  1375: 255,
  1378: 88,
  1379: 255,
  1382: 104,
  1383: 255,
  1386: 163,
  1387: 255,
  1390: 153,
  1391: 255,
  1394: 52,
  1395: 255,
  1398: 68,
  1451: 255,
  1454: 253,
  1455: 255,
  1458: 189,
  1459: 255,
  1462: 69,
  1463: 255,
  1466: 50,
  1467: 255,
  1470: 74,
  1471: 255,
  1474: 79,
  1475: 255,
  1478: 82,
  1479: 255,
  1482: 78,
  1483: 255,
  1486: 182,
  1487: 255,
  1490: 218,
  1491: 255,
  1494: 65,
  1495: 255,
  1498: 85,
  1551: 255,
  1554: 222,
  1555: 255,
  1558: 120,
  1559: 255,
  1562: 67,
  1563: 255,
  1566: 44,
  1567: 255,
  1570: 68,
  1571: 255,
  1574: 80,
  1575: 255,
  1578: 78,
  1579: 255,
  1582: 74,
  1583: 255,
  1586: 197,
  1587: 255,
  1590: 245,
  1591: 255,
  1594: 111,
  1595: 255,
  1598: 84,
  1651: 255,
  1654: 191,
  1655: 255,
  1658: 107,
  1659: 255,
  1662: 92,
  1663: 255,
  1666: 65,
  1667: 255,
  1670: 67,
  1671: 255,
  1674: 75,
  1675: 255,
  1678: 77,
  1679: 255,
  1682: 70,
  1683: 255,
  1686: 102,
  1687: 255,
  1690: 157,
  1691: 255,
  1694: 104,
  1695: 255,
  1698: 74,
  1751: 255,
  1754: 169,
  1755: 255,
  1758: 108,
  1759: 255,
  1762: 107,
  1763: 255,
  1766: 74,
  1767: 255,
  1770: 66,
  1771: 255,
  1774: 69,
  1775: 255,
  1778: 70,
  1779: 255,
  1782: 66,
  1783: 255,
  1786: 57,
  1787: 255,
  1790: 86,
  1791: 255,
  1794: 88,
  1795: 255,
  1798: 85,
  1851: 255,
  1854: 156,
  1855: 255,
  1858: 115,
  1859: 255,
  1862: 112,
  1863: 255,
  1866: 69,
  1867: 255,
  1870: 60,
  1871: 255,
  1874: 60,
  1875: 255,
  1878: 59,
  1879: 255,
  1882: 58,
  1883: 255,
  1886: 69,
  1887: 255,
  1890: 79,
  1891: 255,
  1894: 69,
  1895: 255,
  1898: 105,
  1947: 255,
  1950: 250,
  1951: 255,
  1954: 146,
  1955: 255,
  1958: 111,
  1959: 255,
  1962: 102,
  1963: 255,
  1966: 58,
  1967: 255,
  1970: 52,
  1971: 255,
  1974: 52,
  1975: 255,
  1978: 50,
  1979: 255,
  1982: 56,
  1983: 255,
  1986: 97,
  1987: 255,
  1990: 85,
  1991: 255,
  1994: 53,
  1995: 255,
  1998: 73,
  2047: 255,
  2050: 243,
  2051: 255,
  2054: 128,
  2055: 255,
  2058: 96,
  2059: 255,
  2062: 88,
  2063: 255,
  2066: 50,
  2067: 255,
  2070: 45,
  2071: 255,
  2074: 47,
  2075: 255,
  2078: 45,
  2079: 255,
  2082: 62,
  2083: 255,
  2086: 108,
  2087: 255,
  2090: 107,
  2091: 255,
  2094: 80,
  2095: 255,
  2098: 82,
  2147: 255,
  2150: 225,
  2151: 255,
  2154: 105,
  2155: 255,
  2158: 78,
  2159: 255,
  2162: 74,
  2163: 255,
  2166: 54,
  2167: 255,
  2170: 47,
  2171: 255,
  2174: 43,
  2175: 255,
  2178: 40,
  2179: 255,
  2182: 50,
  2183: 255,
  2186: 77,
  2187: 255,
  2190: 92,
  2191: 255,
  2194: 121,
  2195: 255,
  2198: 215,
  2247: 255,
  2250: 241,
  2251: 255,
  2254: 118,
  2255: 255,
  2258: 46,
  2259: 255,
  2262: 47,
  2263: 255,
  2266: 49,
  2267: 255,
  2270: 48,
  2271: 255,
  2274: 41,
  2275: 255,
  2278: 31,
  2279: 255,
  2282: 31,
  2283: 255,
  2286: 127,
  2287: 255,
  2290: 186,
  2291: 255,
  2294: 232,
  2295: 255,
  2298: 254,
  2347: 255,
  2350: 253,
  2351: 255,
  2354: 177,
  2355: 255,
  2358: 85,
  2359: 255,
  2362: 57,
  2363: 255,
  2366: 50,
  2367: 255,
  2370: 43,
  2371: 255,
  2374: 34,
  2375: 255,
  2378: 37,
  2379: 255,
  2382: 91,
  2383: 255,
  2386: 247,
  2447: 255,
  2450: 224,
  2451: 255,
  2454: 197,
  2455: 255,
  2458: 210,
  2459: 255,
  2462: 193,
  2463: 255,
  2466: 173,
  2467: 255,
  2470: 150,
  2471: 255,
  2474: 119,
  2475: 255,
  2478: 133,
  2479: 255,
  2482: 240
};

var contextExists = function (canvas) {
  return typeof canvas.getContext === 'function';
};

var toDataURLExists = function (canvas) {
  return typeof canvas.toDataURL === 'function';
};

var toBlobExists = function (canvas) {
  return typeof canvas.toBlob === 'function';
};

var getImageData = function (canvas) {
  return typeof canvas.getImageData === 'function';
};

function toArray(buffer) {
  return Array.prototype.slice.call(buffer, 0);
}

function arrayCompare(array1, array2) {
  return (
    array1.length === array2.length &&
    array1.every(function (value, index) {
      return value === array2[index];
    })
  );
}

function compressArray(array) {
  var compressedObject = {};
  var currentValue = array[0];
  array.forEach(function (element, index) {
    if (element !== currentValue) {
      compressedObject[index - 1] = currentValue;
      currentValue = element;
    }
  });
  return compressedObject;
}

function canvasSupportFill(context) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.fillStyle = 'pink';
  context.fillRect(10, 10, 100, 100);
  var expectedResult = [
    255, 192, 203, 255, 255, 192, 203, 255, 255, 192, 203, 255, 255, 192, 203, 255
  ];
  var actualResult = toArray(context.getImageData(60, 60, 2, 2).data);
  return arrayCompare(expectedResult, actualResult);
}

function canvasSupportStroke(context) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(2, 0);
  context.lineTo(2, 100);
  context.stroke();
  var expectedResult = [
    0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 255, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0,
    255, 0, 0, 0, 0
  ];
  var actualResult = toArray(context.getImageData(0, 0, 4, 4).data);
  return arrayCompare(expectedResult, actualResult);
}

function loadImage(context) {
  try {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    var base64Image =
      'data:image/png;base64,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';
    var image = new Image();
    var imageLoaded = new Promise(function (resolve) {
      image.onload = function () {
        context.drawImage(image, 0, 0);
        resolve();
      };
    });
    var imageLoadTimeout = new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, 2000);
    });
    image.src = base64Image;
    return Promise.race([imageLoaded, imageLoadTimeout])
      .then(function () {
        var returnedImageData = toArray(context.getImageData(0, 0, 25, 25).data);
        var compressedResult = compressArray(returnedImageData);
        return JSON.stringify(imgResultData) === JSON.stringify(compressedResult);
      })
      .catch(function () {
        return false;
      });
  } catch {
    return Promise.resolve(false);
  }
}

function checkCanvasDimensions(context) {
  var canvas = context.canvas;
  return canvas.width === 100 && canvas.height === 100;
}

function runTest() {
  act.start();

  var $container = document.createElement('div');
  var $title1 = createTitle('Canvas');
  $container.appendChild($title1);

  var canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  $container.appendChild(canvas);

  act.render($container, function () {
    var ctx = canvas.getContext('2d');
    if (!contextExists(canvas)) {
      act.fail('The canvas context was not created');
    } else if (!toDataURLExists(canvas)) {
      act.fail('The canvas toDataURL method does not exist');
    } else if (!toBlobExists(canvas)) {
      act.fail('The canvas toBlob method does not exist');
    } else if (!checkCanvasDimensions(ctx)) {
      act.fail('The canvas does not have the correct dimensions');
    } else if (!canvasSupportFill(ctx)) {
      act.fail('The canvas has not been filled correctly');
    } else if (!canvasSupportStroke(ctx)) {
      act.fail('The canvas has not had a stroke applied correctly');
    } else if (!getImageData(ctx)) {
      act.fail('The canvas does not have the createImage method');
    } else {
      loadImage(ctx).then(function (success) {
        if (success) {
          act.success('Looks like this device supports the canvas API');
        } else {
          act.fail('The canvas could not load an image correctly');
        }
      });
    }
  });
}

loadSDK(runTest);
