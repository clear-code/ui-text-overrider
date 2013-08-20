/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

load('lib/WindowManager');
load('lib/prefs');

var domain = 'extensions.uitextoverrider@clear-code.com.';

function overrideUIText(aWindow, aBaseKey, aDelayed) {
  var selector = prefs.getPref(aBaseKey);
  if (!selector)
    return;

  if (prefs.getPref(aBaseKey + '.delayed') && !aDelayed) {
    aWindow.setTimeout(function() {
      overrideUIText(aWindow, aBaseKey, true);
    }, 100);
    return;
  }

  try {
    var targets = aWindow.document.querySelectorAll(selector);
    if (!targets.length)
      return;

    var keys = prefs.getChildren(aBaseKey + '.');
    keys.forEach(function(aKey) {
      var attribute = aKey.replace(aBaseKey + '.', '');
      if (attribute == 'delayed')
        return;

      var value = prefs.getPref(aKey);
      Array.forEach(targets, function(aTarget) {
        aTarget.setAttribute(attribute, value);
      });
    });
  } catch(error) {
    Cu.reportError(error);
  }
}

function handleWindow(aWindow)
{
  prefs.getChildren(domain).forEach(function(aBaseKey) {
    overrideUIText(aWindow, aBaseKey);
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
