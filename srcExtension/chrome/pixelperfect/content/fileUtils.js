if ( typeof pixelPerfect.fileUtils == "undefined") {
	pixelPerfect.fileUtils = {};
}

pixelPerfect.fileUtils = function () {
        // public
        return  {
            getFirefoxProfileRootFolder: function() {
                try {
                  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                } 
                catch (e) {
                    alert("Permission to save file was denied.");
                }
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
            
            getUserOverlayPath: function() {
                var userOverlayPath = this.getFirefoxProfileRootFolder().clone();
                userOverlayPath.append('extensions');
                userOverlayPath.append('pixelperfectplugin@openhouseconcepts.com');
                userOverlayPath.append('chrome');
                userOverlayPath.append('pixelperfect');
                userOverlayPath.append('content');
                userOverlayPath.append('user_overlays');
                return userOverlayPath;
            },
            
            getPanelHTMLFilePath: function() {
                var panelHTMLPath = this.getFirefoxProfileRootFolder().clone();
                panelHTMLPath.append('extensions');
                panelHTMLPath.append('pixelperfectplugin@openhouseconcepts.com');
                panelHTMLPath.append('chrome');
                panelHTMLPath.append('pixelperfect');
                panelHTMLPath.append('content');
                panelHTMLPath.append('panel.html');
                return panelHTMLPath;
            },
            
            readPanelHTML: function() {
                var file = Components.classes["@mozilla.org/file/local;1"]
                  .createInstance(Components.interfaces.nsILocalFile);
                if (!file) return false;
                file.initWithPath(this.getPanelHTMLFilePath().path);
                
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