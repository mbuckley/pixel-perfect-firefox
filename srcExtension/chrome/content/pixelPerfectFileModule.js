define([
    "firebug/lib/object",
    "firebug/lib/trace",
],
function(Obj, FBTrace) {

// ********************************************************************************************* //
// Custom Module Implementation

Firebug.PixelPerfectFileModule = Obj.extend(Firebug.Module,
{
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Initialization

    initialize: function(owner)
    {
        Firebug.Module.initialize.apply(this, arguments);

        if (FBTrace.DBG_PIXELPERFECT)
            FBTrace.sysout("pixelPerfect; PixelPerfectFileModule.initialize");
    },

    shutdown: function()
    {
        Firebug.Module.shutdown.apply(this, arguments);

        if (FBTrace.DBG_PIXELPERFECT)
            FBTrace.sysout("pixelPerfect; PixelPerfectFileModule.shutdown");
    },

    getFirefoxProfileRootFolder: function() {
        // get the nsIFile obj => user's home (profile) directory
        const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1", "nsIProperties");
        var nsIFileObj;
        try {
            nsIFileObj = (new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile);
        }
        catch (e) {
            alert("error");
        }
        return nsIFileObj;
    },

    chooseFile: function() {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"]
                .createInstance(nsIFilePicker);
        fp.appendFilters(nsIFilePicker.filterImages);
        fp.init(window, "Select a File", nsIFilePicker.modeOpen);
        
        var res = fp.show();
        var filePath = '';

        if (res == nsIFilePicker.returnOK){
          var sourceFile = fp.file;
        }
        return sourceFile;
    },
    
    copyFile: function(sourcefile) {
        // get a component for the file to copy
        var aFile = Components.classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsILocalFile);
        if (!aFile) return false;

        // get a component for the directory to copy to
        var aDir = Components.classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsILocalFile);
        if (!aDir) return false;

        // next, assign URLs to the file components
        var userOverlayPathStr = this.getUserOverlayPath().path;
        aFile.initWithPath(sourcefile.path);
        aDir.initWithPath(userOverlayPathStr);

        // finally, copy the file, without renaming it
        try {
          aFile.copyTo(aDir,null);
        } catch(ex) {
          // file already exists.
          // add error logging lib here
        }
        return aFile.leafName;
    },
    
    getCurrentOverlayFiles: function() {
        // get a component for the file to copy
        var file = Components.classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsILocalFile);
        if (!file) return false;
        
        var userOverlayPathStr = this.getUserOverlayPath().path;
        file.initWithPath(userOverlayPathStr);
        
        // file is the given directory (nsIFile)
        var entries = file.directoryEntries;
        var overlayArr = [];
        while(entries.hasMoreElements())
        {
          var entry = entries.getNext();
          entry.QueryInterface(Components.interfaces.nsIFile);
          if(entry.isFile()) {
            var filePath = entry.path;
            var fileName = filePath.replace(userOverlayPathStr, '').substring(1);
            if(fileName !== ".leave") {
              overlayArr.push(fileName);
            }
          }
        }
        return overlayArr;
    },
    
    //TODO: update extension folder name from config settings
    getUserOverlayPath: function() {
        var userOverlayPath = this.getFirefoxProfileRootFolder().clone();
        userOverlayPath.append('extensions');
        userOverlayPath.append('pixelperfectplugin@openhouseconcepts.com');
        userOverlayPath.append('chrome');
        userOverlayPath.append('content');
        userOverlayPath.append('user_overlays');
        return userOverlayPath;
    }
});

// ********************************************************************************************* //
// Registration

Firebug.registerModule(Firebug.PixelPerfectFileModule);

return Firebug.PixelPerfectFileModule;

// ********************************************************************************************* //
});