/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

load('lib/WindowManager');
load('lib/prefs');

var domain = 'extensions.uitextoverrider@clear-code.com.';

var STATE_HANDLED      = 0;
var STATE_ONLOAD_FIRED = 1;
var STATE_DELAYED      = 2;

prefs.setPref(domain + 'debug', false);

function overrideUIText(aWindow, aBaseKey, aState) {
  var selector = prefs.getPref(aBaseKey);
  if (!selector)
    return;

  if (aWindow.document.documentElement.localName == 'prefwindow') {
    aWindow.addEventListener('paneload', function onLoad(aEvent) {
      overrideUIText(aWindow, aBaseKey, STATE_DELAYED);
    }, false);
  }

  if (aWindow.location.href == 'about:blank' && aState == STATE_HANDLED) {
    // When the chrome window is not loaded yet, we have to do following processes after loaded. 
    aWindow.addEventListener('load', function onLoad(aEvent) {
      aWindow.removeEventListener('load', onLoad, false);
      aWindow.addEventListener('MozAfterPaint', function onMozAfterPaint(aEvent) {
        aWindow.removeEventListener('MozAfterPaint', onMozAfterPaint, false);
        overrideUIText(aWindow, aBaseKey, STATE_ONLOAD_FIRED);
      }, false);
    }, false);
    return;
  }

  if (prefs.getPref(aBaseKey + '.delayed') && aState != STATE_DELAYED) {
    if (aState == STATE_HANDLED) {
      aWindow.addEventListener('load', function onLoad(aEvent) {
        aWindow.removeEventListener('load', onLoad, false);
        aWindow.addEventListener('MozAfterPaint', function onMozAfterPaint(aEvent) {
          aWindow.removeEventListener('MozAfterPaint', onMozAfterPaint, false);
          aWindow.setTimeout(function() {
            overrideUIText(aWindow, aBaseKey, STATE_DELAYED);
          }, 100);
        }, false);
      }, false);
    } else {
      aWindow.setTimeout(function() {
        overrideUIText(aWindow, aBaseKey, STATE_DELAYED);
      }, 100);
    }
    return;
  }

  try {
    var targets = aWindow.document.querySelectorAll(selector);
    // console.log(aState+' / '+selector+' => '+targets.length);
    if (!targets.length) {
      if (prefs.getPref(domain + 'debug'))
        Cu.reportError(new Error('[uitextoverrider] no target found: ' + selector +
                                   ' (' + aWindow.location.href +  ')'));
      return;
    }

    var keys = prefs.getChildren(aBaseKey + '.');
    var attributes = [];
    keys.forEach(function(aKey) {
      var attribute = aKey.replace(aBaseKey + '.', '');
      if (attribute == 'delayed')
        return;

      var value = prefs.getPref(aKey);
      Array.forEach(targets, function(aTarget) {
        aTarget.setAttribute(attribute, value);
        attributes.push(attribute + '=' + value);
      });
    });
    if (prefs.getPref(domain + 'debug')) {
      console.log('[uitextoverrider] ' + targets.length + ' targets found: ' + selector +
                  ' => ' + attributes.join(', ') +
                  ' (' + aWindow.location.href +  ')');
    }
  } catch(error) {
    Cu.reportError(error);
  }
}

function handleWindow(aWindow)
{
  prefs.getChildren(domain).forEach(function(aBaseKey) {
    overrideUIText(aWindow, aBaseKey, STATE_HANDLED);
  });
}

WindowManager.getWindows().forEach(handleWindow);
WindowManager.addHandler(handleWindow);

function shutdown()
{
  WindowManager.removeHandler(handleWindow);

  domain = undefined;
  handleWindow = undefined;
  overrideUIText = undefined;

  WindowManager = undefined;
  prefs = undefined;
}
