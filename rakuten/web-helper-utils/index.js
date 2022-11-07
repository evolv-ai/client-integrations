module.exports = function(config) {
  function docReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(fn, 1);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function docComplete(fn) {
    if (document.readyState === "complete") {
      setTimeout(fn, 1);
    } else {
      document.addEventListener('readystatechange', function(event) {
        if (event.target.readyState === 'complete') {
          fn();
        }
      });
    }
  }

  function emitSelectorTimeout(messageObj) {
    if (messageObj && messageObj.message) {
      console.warn(messageObj.message);
    }
    window.evolv.client.emit('selector-timeout');
  }

  function waitForExist(selectors, callback, timeout, clearIntervalOnTimeout, resolveCb, rejectCb) {
    // EXAMPLE USAGE from within an Evolv variant:
    //
    // waitForExist(['#header11'],
    //              function() { console.log('render'); },
    //              6000,
    //              false,
    //              resolve,
    //              reject);
    //
    // return true;

    let existInterval = setInterval(function() {
      if (selectors.every(function(ss) {
        return document.querySelector(ss);
      })) {
        clearInterval(existInterval);

        try {
          callback();
        } catch (err) {
          window.evolv.client.contaminate({details:err.message, reason:'error-thrown'});
          throw err;
        }

        existInterval = null;
        resolveCb();
      }
    }, 100);

    function checkExist() {
      setTimeout(function() {
        if (existInterval) {
          if (clearIntervalOnTimeout) {
            clearInterval(existInterval);
          }
          console.info(selectors);
          rejectCb({ message : "Selectors not found or other error thrown: " + selectors.toString() });
        }
      }, timeout);
    };

    docComplete(checkExist);
  };

  if (!window.evolv.webUtils) {
    const webUtils = {};
    webUtils.waitForExist = waitForExist;
    webUtils.docReady = docReady;
    webUtils.docComplete = docComplete;
    webUtils.emitSelectorTimeout = emitSelectorTimeout;
    window.evolv.webUtils = webUtils;
  }
};
