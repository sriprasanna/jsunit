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
  }],
  QueryInterface: XPCOMUtils.generateQI(["nsICommandLineHandler", "nsIFactory"]),

  // nsICommandLineHandler
  handle: function(cmdLine) {
    var fileName = cmdLine.handleFlagWithParam("jsunit", false);
    if (fileName && fileName.length > 0) {
      cmdLine.preventDefault = true; // disallow to open main app window

      JSUnit.init();
      dump("Starting JS unit tests " + fileName +"\n");
      try {
        JSUnit.executeScript(fileName);
      }
      catch(ex) {
        JSUnit.dumpErr("Exception occurred:\n"+ex.toString());
        dump("** Tests aborted **\n");
      }
      dump("\nFINAL STATS\n");
      dump("Tests executed : "+ (JSUnit.countFailed() + JSUnit.countSucceeded())+"\n");
      dump("Tests succeeded: "+ JSUnit.countSucceeded()+"\n");
      dump("Tests failed   : "+ JSUnit.countFailed()+"\n");
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
