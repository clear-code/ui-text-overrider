// Following variables must be predefined.
//
// var killedItems = [];
// var killedItemsWithDelay = [];
// var hiddenItemsWithDelay = [];

{// UI Text Overrider, for Firefox 52/Thunderbird 52 and later
  let domain = 'extensions.uitextoverrider@clear-code.com.';

  function setKillItemRule(aIdentifier, aSelector, aDelayed, aDisableCommand) {
    lockPref(domain + aIdentifier, aSelector);
    lockPref(domain + aIdentifier + ".disabled", "true");
    lockPref(domain + aIdentifier + ".hidden", "true");
    lockPref(domain + aIdentifier + ".readonly", "true");
    if (aDisableCommand) {
      lockPref(domain + aIdentifier + ".command", "");
      lockPref(domain + aIdentifier + ".oncommand", "");
    }
    lockPref(domain + aIdentifier + ".always-hidden", "true");
    lockPref(domain + aIdentifier + ".delayed", aDelayed == true);
  }
  setKillItemRule("killedItems",          killedItems.join(","),          false, true);
  setKillItemRule("killedItemsWithDelay", killedItemsWithDelay.join(","), true,  true);
  setKillItemRule("hiddenItemsWithDelay", hiddenItemsWithDelay.join(","), true,  false);

  let { classes: Cc, interfaces: Ci, utils: Cu } = Components;
  let { Services } = Cu.import('resource://gre/modules/Services.jsm', {});

  let getDescendantPrefs = (aRoot) => {
    return Services.prefs.getChildList(aRoot, {}).sort();
  };
  let getChildPrefs = (aRoot) => {
    aRoot = aRoot.replace(/\.$/, '');
    var foundChildren = {};
    var possibleChildren = [];
    getDescendantPrefs(aRoot)
      .forEach(aPrefstring => {
        let name = aPrefstring.replace(aRoot + '.', '');
        let possibleChildKey = aRoot + '.' + name.split('.')[0];
        if (possibleChildKey && !(possibleChildKey in foundChildren)) {
          possibleChildren.push(possibleChildKey);
          foundChildren[possibleChildKey] = true;
        }
      });
    return possibleChildren.sort();
  };

  const STATE_HANDLED      = 0;
  const STATE_ONLOAD_FIRED = 1;
  const STATE_DELAYED      = 2;

  let overrideUIText = (aWindow, aBaseKey, aState) => {
    var selector = getPref(aBaseKey);
    if (!selector)
      return;

    if (aWindow.document.documentElement.localName == 'prefwindow') {
      aWindow.addEventListener('paneload', aEvent => {
        overrideUIText(aWindow, aBaseKey, STATE_DELAYED);
      }, false);
    }

    if (aWindow.location.href == 'about:blank' && aState == STATE_HANDLED) {
      // When the chrome window is not loaded yet, we have to do following processes after loaded. 
      aWindow.addEventListener('load', aEvent => {
        aWindow.addEventListener('MozAfterPaint', aEvent => {
          overrideUIText(aWindow, aBaseKey, STATE_ONLOAD_FIRED);
        }, { once: true });
      }, { once: true });
      return;
    }

    if (getPref(aBaseKey + '.delayed') && aState != STATE_DELAYED) {
      if (aState == STATE_HANDLED) {
        aWindow.addEventListener('load', function onLoad(aEvent) {
          aWindow.removeEventListener('load', onLoad, false);
          aWindow.addEventListener('MozAfterPaint', function onMozAfterPaint(aEvent) {
            aWindow.removeEventListener('MozAfterPaint', onMozAfterPaint, false);
            aWindow.setTimeout(() => {
              overrideUIText(aWindow, aBaseKey, STATE_DELAYED);
            }, 100);
          }, false);
        }, false);
      } else {
        aWindow.setTimeout(() => {
          overrideUIText(aWindow, aBaseKey, STATE_DELAYED);
        }, 100);
      }
      return;
    }

    try {
      var targets = aWindow.document.querySelectorAll(selector);
      // Services.console.logStringMessage(`${aState*} / ${selector} => ${targets.length}`);
      if (!targets.length) {
        Cu.reportError(new Error(`[uitextoverrider] no target found: ${selector} (${aWindow.location.href})`));
        return;
      }

      var keys = getChildPrefs(`${aBaseKey}.`);
      var attributes = [];
      keys.forEach(aKey => {
        var attribute = aKey.replace(`${aBaseKey}.`, '');
        if (attribute == 'delayed')
          return;

        var value = getPref(aKey);
        for (const target of targets) {
          target.setAttribute(attribute, value);
          attributes.push(attribute + '=' + value);
        }
      });
      if (getPref(domain + 'debug')) {
        Services.console.logStringMessage(`[uitextoverrider] ${targets.length} targets found: ${selector} => ${attributes.join(', ')} (${aWindow.location.href})`);
      }
    } catch(error) {
      Cu.reportError(error);
    }
  };

  let handleWindow = (aWindow) => {
    getChildPrefs(domain).forEach(aBaseKey => {
      overrideUIText(aWindow, aBaseKey, STATE_HANDLED);
    });
  };

  let windows = Services.wm.getEnumerator(null);
  while (windows.hasMoreElements()) {
    handleWindow(windows.getNext().QueryInterface(Ci.nsIDOMWindow));
  }

  Services.ww.registerNotification({
    observe(aSubject, aTopic, aData) {
      if (aTopic == 'domwindowopened' &&
          !aSubject
            .getInterface(Ci.nsIWebNavigation)
            .QueryInterface(Ci.nsIDocShell)
            .QueryInterface(Ci.nsIDocShellTreeNode || Ci.nsIDocShellTreeItem) // nsIDocShellTreeNode is merged to nsIDocShellTreeItem by https://bugzilla.mozilla.org/show_bug.cgi?id=331376
            .QueryInterface(Ci.nsIDocShellTreeItem)
            .parent)
        aSubject.getInterface(Ci.nsIDOMWindow).addEventListener('DOMContentLoaded', aEvent => {
          handleWindow(aEvent.target.defaultView);
        }, { once: true });
    }
  });
}
