if ( typeof pixelPerfect.fileUtils == "undefined") {
	pixelPerfect.fileUtils = {};
}

pixelPerfect.fileUtils = function () {
        // public
        return  { 
            directorySeperator: "",
        
            firefoxProfileRootFolder: function() {
                try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                } catch (e) {
                    alert("Permission to save file was denied.");
                }
                // get the path to the user's home (profile) directory
                const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
                try { 
                    path=(new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path; 
                } catch (e) {
                    alert("error");
                }
                // determine the file-separator
                if (path.search(/\\/) != -1) {
                    this.initializeDirectorySeperator("\\");
                    path = path + this.directorySeperator;
                } else {
                    this.initializeDirectorySeperator("/");
                    path = path + this.directorySeperator;
                }
                return path;
            },

            initializeDirectorySeperator: function(seperator) {
                if(this.directorySeperator == null || this.directorySeperator == ""){
                  this.directorySeperator = seperator;
                }
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
                  var thefile = fp.file;
                  filePath = fp.file.path;
                  var fileName = filePath.substring(filePath.lastIndexOf(this.directorySeperator) + 1, filePath.length);     
                }
                return [filePath, fileName];
            },
            
            copyFile: function(sourcefile,destdir) {
                // get a component for the file to copy
                var aFile = Components.classes["@mozilla.org/file/local;1"]
                  .createInstance(Components.interfaces.nsILocalFile);
                if (!aFile) return false;

                // get a component for the directory to copy to
                var aDir = Components.classes["@mozilla.org/file/local;1"]
                  .createInstance(Components.interfaces.nsILocalFile);
                if (!aDir) return false;

                // next, assign URLs to the file components
                aFile.initWithPath(sourcefile);
                aDir.initWithPath(destdir);

                // finally, copy the file, without renaming it
                try {
                  aFile.copyTo(aDir,null);
                } catch(ex) {
                  // file already exists.
                  // add error logging lib here
                }
            },
            
            getCurrentOverlayFiles: function() {
                // get a component for the file to copy
                var file = Components.classes["@mozilla.org/file/local;1"]
                  .createInstance(Components.interfaces.nsILocalFile);
                if (!file) return false;
                file.initWithPath(this.getUserOverlayPath());

                // file is the given directory (nsIFile)
                var entries = file.directoryEntries;
                var overlayArr = [];
                while(entries.hasMoreElements())
                {
                  var entry = entries.getNext();
                  entry.QueryInterface(Components.interfaces.nsIFile);
                  if(entry.isFile()) {
                    var filePath = entry.path;
                    var fileName = filePath.split(this.directorySeperator).pop();
                    if(fileName !== ".leave") {
                      overlayArr.push(fileName);
                    }
                  }
                }
                return overlayArr;
            },
            
            getUserOverlayPath: function() {
                // return '/home/mbuckley/firefox_addons/PixelPerfect/srcExtension/chrome/pixelperfect/content/user_overlays/';
                return this.firefoxProfileRootFolder() + 'extensions' + this.directorySeperator + 'pixelperfectplugin@openhouseconcepts.com' + this.directorySeperator + 'chrome' + this.directorySeperator + 'pixelperfect' + this.directorySeperator + 'content' + this.directorySeperator + 'user_overlays' + this.directorySeperator;
            },
            
            getContentRootFolder: function() {
                // this.firefoxProfileRootFolder();
                // return '/home/mbuckley/firefox_addons/PixelPerfect/srcExtension/chrome/pixelperfect/content/';
                return this.firefoxProfileRootFolder() + 'extensions' + this.directorySeperator + 'pixelperfectplugin@openhouseconcepts.com' + this.directorySeperator + 'chrome' + this.directorySeperator + 'pixelperfect' + this.directorySeperator + 'content';
            },
            
            readPanelHTML: function() {
                var file = Components.classes["@mozilla.org/file/local;1"]
                  .createInstance(Components.interfaces.nsILocalFile);
                if (!file) return false;
                
                file.initWithPath(this.getContentRootFolder() + this.directorySeperator + "panel.html");

                var data = "";
                var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                                        .createInstance(Components.interfaces.nsIFileInputStream);
                var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                        .createInstance(Components.interfaces.nsIScriptableInputStream);
                fstream.init(file, -1, 0, 0);
                sstream.init(fstream); 

                var str = sstream.read(4096);
                while (str.length > 0) {
                  data += str;
                  str = sstream.read(4096);
                }

                sstream.close();
                fstream.close();
                return data;
            }
        };	
}();