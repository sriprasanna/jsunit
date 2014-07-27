/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://jsunit/jsunit-main.jsm");


const Cc = Components.classes;
const Ci = Components.interfaces;

function DEBUG_LOG(str) {
  dump("jsunit-service.js: "+str+"\n");
}

function CmdLineHandler() {}

CmdLineHandler.prototype = {
  classDescription: "JSUnit CommandLine Service",
  classID:  Components.ID("{66e6cef0-0a99-11e4-bddc-2f712bb03de5}"),
  contractID: "@mozilla.org/commandlinehandler/general-startup;1?type=jsunit",
  flags: Components.interfaces.nsIClassInfo.SINGLETON,
  _xpcom_categories: [{
     category: "profile-after-change",
     entry: "aaa-jsunit"
    },
    {
      category: "command-line-handler",
      entry: "m-jsunit"
    },
    {
      category: "profile-after-change",
      entry: "aaa-jsdunit"
    },
    {
      category: "command-line-handler",
      entry: "m-jsdunit"
    }],
  QueryInterface: XPCOMUtils.generateQI(["nsICommandLineHandler", "nsIFactory"]),

  startCmdLineTests: function(fileName) {
    JSUnit.init(false);
    JSUnit.printMsg("Starting JS unit tests " + fileName +"\n");
    try {
      // ensure cache is deleted upon next application start
      Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).invalidateCachesOnRestart();
      JSUnit.executeScript(fileName, false, true);
    }
    catch(ex) {
      JSUnit.dumpFailed("Exception occurred:\n"+ex.toString());
      dump("** Tests aborted **\n");
    }
    JSUnit.printStats();
  },

  startTinyJSDTests: function(fileName) {

    JSUnit.init(true);
    JSUnit.setMainFile(fileName);

    // ensure cache is deleted upon next application start
    Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).invalidateCachesOnRestart();

    var wwatch = Cc["@mozilla.org/embedcomp/window-watcher;1"]
                           .getService(Ci.nsIWindowWatcher);
    wwatch.openWindow(null, "chrome://tinyjsd/content/tinyjsd-main.xul", "_blank",
                      "chrome,resizable,all", null);
  },

  // nsICommandLineHandler
  handle: function(cmdLine) {

    // handle -jsunit
    var fileName = cmdLine.handleFlagWithParam("jsunit", false);
    if (fileName && fileName.length > 0) {
      cmdLine.preventDefault = true; // disallow to open main app window
      this.startCmdLineTests(fileName);
      return;
    }

    // handle -jsdunit
    fileName = cmdLine.handleFlagWithParam("jsdunit", false);
    if (fileName && fileName.length > 0) {
      cmdLine.preventDefault = true; // disallow to open main app window
      this.startTinyJSDTests(fileName);
    }
  },

  helpInfo: "  -jsunit <filename>        Start JavaScript Unit Tests.\n",

  observe: function() {
    DEBUG_LOG("nothing to do\n");
  },

  lockFactory: function (lock) {}
};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([CmdLineHandler]);
dump("JSUnit: service registered\n");
