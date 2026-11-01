'use strict';

function loadSDK(callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://certification.bbctvapps.co.uk/act/sdk/v1.4.0/actsdk.min.umd.js';
  script.onload = function () {
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(script);
}

function runTest() {
  act.start();
  try {
    if (!('Promise' in window)) {
      act.fail('`Promise` missing from `window`');
      return;
    }

    if (typeof Promise.prototype.then !== 'function') {
      act.fail('`Promise.prototype.then` missing');
      return;
    }

    if (typeof Promise.prototype.catch !== 'function') {
      act.fail('`Promise.prototype.catch` missing');
      return;
    }

    if (typeof Promise.all !== 'function') {
      act.fail('`Promise.all` missing');
      return;
    }

    if (typeof Promise.race !== 'function') {
      act.fail('`Promise.race` missing');
      return;
    }

    var promise = Promise.resolve();
    if (typeof promise.then !== 'function') {
      act.fail('`promise.then` missing');
      return;
    }

    if (typeof promise.catch !== 'function') {
      act.fail('`promise.catch` missing');
      return;
    }

    var asyncTests = [
      function (done) {
        Promise.resolve(123).then(
          function (res) {
            if (res !== 123) {
              act.fail('`Promise.resolve` resolved with wrong result');
              return;
            }
            done();
          },
          function () {
            act.fail('`Promise.resolve` rejected');
          }
        );
      },
      function (done) {
        Promise.reject(123).then(
          function () {
            act.fail('`Promise.reject` resolved');
          },
          function (res) {
            if (res !== 123) {
              act.fail('`Promise.reject` rejected with wrong result');
              return;
            }
            done();
          }
        );
      },
      function (done) {
        Promise.reject(123).catch(function (res) {
          if (res !== 123) {
            act.fail('`Promise.reject` rejected with wrong result');
            return;
          }
          done();
        });
      },
      function (done) {
        var failed = false;
        new Promise(function () {}).then(
          function () {
            failed = true;
            act.fail('Pending promise resolved');
          },
          function () {
            failed = true;
            act.fail('Pending promise rejected');
          }
        );
        setTimeout(function () {
          if (!failed) done();
        }, 300);
      },
      function (done) {
        new Promise(function (resolve) {
          setTimeout(function () {
            resolve(123);
          }, 100);
        }).then(function (res) {
          if (res !== 123) {
            act.fail('`new Promise` resolved with wrong result');
            return;
          }
          done();
        });
      },
      function (done) {
        new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(123);
          }, 100);
        }).then(
          function () {},
          function (res) {
            if (res !== 123) {
              act.fail('`new Promise` rejected with wrong result');
              return;
            }
            done();
          }
        );
      },
      function (done) {
        Promise.resolve()
          .then(function () {
            return 1234;
          })
          .then(function (res) {
            if (res !== 1234) {
              act.fail('`then` in chain got wrong result');
              return;
            }
            done();
          });
      },
      function (done) {
        var fakeError = new Error('test');
        Promise.resolve()
          .then(function () {
            throw fakeError;
          })
          .catch(function (err) {
            if (err !== fakeError) {
              act.fail('`catch` did not get correct error');
              return new Promise(function () {});
            }
          })
          .then(function () {
            done();
          });
      },
      function (done) {
        Promise.resolve()
          .then(function () {
            return 1234;
          })
          .then(function (res) {
            if (res !== 1234) {
              act.fail('`then` in chain got wrong result');
              return;
            }
            done();
          });
      },
      function (done) {
        var promise1 = Promise.resolve(1);
        var promise2 = Promise.resolve(2);
        Promise.all([promise1, promise2]).then(function (results) {
          if (results.length !== 2 || results[0] !== 1 || results[1] !== 2) {
            act.fail('`Promise.all` results were incorrect');
            return;
          }
          done();
        });
      },
      function (done) {
        var promise1 = Promise.resolve(1);

        var promise2 = Promise.reject();
        Promise.all([promise1, promise2]).then(
          function () {
            act.fail('`Promise.all` should have rejected given an input promise rejected');
          },
          function () {
            done();
          }
        );
      },
      function (done) {
        var promise1 = new Promise(function () {});
        var promise2 = Promise.resolve('res');
        Promise.race([promise1, promise2]).then(function (res) {
          if (res !== 'res') {
            act.fail('`Promise.race` result were incorrect');
            return;
          }
          done();
        });
      },
      function (done) {
        var promise1 = Promise.reject();
        var promise2 = new Promise(function () {});
        Promise.race([promise1, promise2]).then(
          function () {
            act.fail('`Promise.race` should have rejected given an input promise rejected');
          },
          function () {
            done();
          }
        );
      }
    ];

    var runTest = function (i, allDone) {
      var test = asyncTests[i];
      if (!test) {
        allDone();
        return;
      }

      try {
        var doneCalled = false;
        var done = function () {
          if (doneCalled) return;
          doneCalled = true;
          runTest(i + 1, allDone);
        };
        test(done);
      } catch (e) {
        act.error('Unexpected error: ' + (e && e.message) || 'unknown');
      }
    };

    runTest(0, function () {
      act.success();
    });
  } catch (e) {
    act.error('Unexpected error: ' + (e && e.message) || 'unknown');
  }
}

loadSDK(runTest);
