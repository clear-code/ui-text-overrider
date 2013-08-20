/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

load('lib/WindowManager');
load('lib/prefs');

var domain = 'extensions.uitextoverrider@clear-code.com.';
var selectorPattern = /\.selector$/;

function handleWindow(aWindow)
{
  prefs.getChildren(domain).forEach(function(aBaseKey) {
    var selector = prefs.getPref(aBaseKey);
    if (!selector)
      return;

    aBaseKey += '.';
    try {
      var targets = aWindow.document.querySelectorAll(selector);
      if (!targets.length)
        return;

      var keys = prefs.getChildren(aBaseKey);
      keys.forEach(function(aKey) {
        if (selectorPattern.test(aKey))
          return;

        var attribute = aKey.replace(aBaseKey, '');
        var value = prefs.getPref(aKey);
        Array.forEach(targets, function(aTarget) {
          aTarget.setAttribute(attribute, value);
        });
      });
    } catch(error) {
      Cu.reportError(error);
    }
  });
}

WindowManager.getWindows().forEach(handleWindow);
WindowManager.addHandler(handleWindow);

function shutdown()
{
  WindowManager.removeHandler(handleWindow);

  domain = undefined;
  selectorPattern = undefined;

  WindowManager = undefined;
  prefs = undefined;
}
