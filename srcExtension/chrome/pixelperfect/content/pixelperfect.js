var pixelPerfect = pixelPerfect || {};

pixelPerfect.getPrefValue = function(name) {

    const PrefService = Components.classes["@mozilla.org/preferences-service;1"];
    const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
    const nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
	const prefs = PrefService.getService(nsIPrefBranch2);
	const prefDomain = "extensions.firebug";

	//Check if this is global firefox preference.
	var prefName;
	if ( name.indexOf("browser.") != -1)
		prefName = name;
	else
		prefName = prefDomain + "." + name;

	var type = prefs.getPrefType(prefName);
	if (type == nsIPrefBranch.PREF_STRING) {
		return prefs.getCharPref(prefName);
	} else if (type == nsIPrefBranch.PREF_INT) {
		return prefs.getIntPref(prefName);
	} else if (type == nsIPrefBranch.PREF_BOOL) {
		return prefs.getBoolPref(prefName);
	}
}

// Wrapper for getting preferences with a default.
// Returns undefined if the preference doesn't exist and no default is specified.
pixelPerfect.getPref = function(name, defaultval) {
        var val = pixelPerfect.getPrefValue(name);
        return ( "undefined" == typeof(val) ? defaultval : val );
}

pixelPerfect.setPrefValue = function(name, value) {
	
	const PrefService = Components.classes["@mozilla.org/preferences-service;1"];
    const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
    const nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
	const prefs = PrefService.getService(nsIPrefBranch2);
	const prefDomain = "extensions.firebug";
	
	//Check if this is global firefox preference.
	var prefName;
	if ( name.indexOf("browser.") != -1)
		prefName = name;
	else
		prefName = prefDomain + "." + name;

	var type = prefs.getPrefType(prefName);
	if (type == nsIPrefBranch.PREF_STRING) {
		prefs.setCharPref(prefName, value);
	}
	else if (type == nsIPrefBranch.PREF_INT) {
		prefs.setIntPref(prefName, value);
	}
	else if (type == nsIPrefBranch.PREF_BOOL) {
		prefs.setBoolPref(prefName, value);
	}
	else if(type == nsIPrefBranch.PREF_INVALID) {
		throw "Invalid preference: " + prefName;
	}
}
