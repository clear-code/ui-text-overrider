ui-text-overrider
=================

Download Link: https://addons.mozilla.org/firefox/addon/ui-text-overrider/

Provides ability to override UI elements' label, tooltip text, etc.

If you define some preferences like following, this addon automatically apply new labels, tooltip texts, and so on.

    user_pref("extensions.uitextoverrider@clear-code.com.sample",             "CSS selector for the element");
    user_pref("extensions.uitextoverrider@clear-code.com.sample.label",       "new label");
    user_pref("extensions.uitextoverrider@clear-code.com.sample.tooltiptext", "new tooltiptext");
    user_pref("extensions.uitextoverrider@clear-code.com.sample.accesskey",   "accesskey");
    
    user_pref("extensions.uitextoverrider@clear-code.com.another",             "CSS selector for the element 2");
    user_pref("extensions.uitextoverrider@clear-code.com.another.label",       "new label2");
    user_pref("extensions.uitextoverrider@clear-code.com.another.tooltiptext", "new tooltiptext2");
    user_pref("extensions.uitextoverrider@clear-code.com.another.accesskey",   "accesskey2");
    // If the item is automatically inserted by another addon,
    // then you should set this "delayed" flag to override labels certainly.
    user_pref("extensions.uitextoverrider@clear-code.com.another.delayed",     true);
    
    ...

For example, following preferences will change the label of "Firefox" button to "Iceweasel".

    user_pref("extensions.uitextoverrider@clear-code.com.appbutton",       "#appmenu-button");
    user_pref("extensions.uitextoverrider@clear-code.com.appbutton.label", "Iceweasel");

The value of the base key is always a CSS selector string to find the target element. You can specify any attribute name and value as child keys.

Note: original attribute and values won't be restored even if the addon is disabled or uninstalled, until you restart Firefox.
