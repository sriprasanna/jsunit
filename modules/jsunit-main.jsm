/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

var EXPORTED_SYMBOLS = [ "JSUnit" ];

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://jsunit/Assert.jsm");

const Cc = Components.classes;
const Ci = Components.interfaces;

var gTestError =   0;
var gTestSucceed = 0;
var gTestPending = 0;

var gCurrDir = "";

function DEBUG_LOG(str) {
  dump("jsunit-main.jsm: "+str+"\n");
}

var JSUnit = {

  assert: null,

  printMsg: function(str) {
    dump(str+"\n");
  },

  testSucceeded: function() {
    gTestSucceed++;
  },

  testFailed: function() {
    gTestError++;
  },

  logTestResult: function(err, message, stack) {
    if (err) {
      JSUnit.testFailed();
      JSUnit.printMsg(err + " - " + stack);
    }
    else {
      JSUnit.testSucceeded();
      JSUnit.printMsg("Succeed: " + message + " - " + stack);
    }
  },

  init: function () {
    // initialize library
    gCurrDir = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIDirectoryServiceProvider)
                .getFile("CurWorkD",{}).path;
    this.assert = new Assert(this.logTestResult);
  },

  getCwd: function () {
    return gCurrDir;
  },

  getFile: function (stack, testdirRelativePath, allowNonexistent)
  {

    //DEBUG_LOG("getFile: "+gCurrDir);

    var fn = gCurrDir+"/"+testdirRelativePath;

    var lf = Components.classes["@mozilla.org/file/local;1"].createInstance(
          Components.interfaces.nsIFile);
    lf.initWithPath(fn);

    if (! (allowNonexistent || lf.exists())) {
      JSUnit.logTestResult("AssertionError: file '"+ fn + "' not found", null,
        stack.filename +
        " :: " + stack.name +
        " :: line " + stack.lineNumber);
      return null;
    }
    else {
      JSUnit.logTestResult(null, "file '"+ fn + "' OK",
        stack.filename +
        " :: " + stack.name +
        " :: line " + stack.lineNumber);
    }
    return lf;
  },

  executeScript: function(scriptFile, isAbsolutePath, dontRun) {
    if (! isAbsolutePath) {
      scriptFile = gCurrDir + "/" + scriptFile
    }

    let context = {};
    Services.scriptloader.loadSubScript("resource://jsunit/jsunit-wrapper.js", context, "UTF-8");
    Services.scriptloader.loadSubScript("file://"+scriptFile, context, "UTF-8");
    if (! dontRun) {
      Services.scriptloader.loadSubScript("resource://jsunit/jsunit-exec.js", context, "UTF-8");
    }

    if (gTestPending) {
      JSUnit.waitForAsyncTest();
    }
  },

  loadScript: function (urlString, context) {
    Services.scriptloader.loadSubScript(urlString, context, "UTF-8");
  },

  abortPendingTests: function() {
    gTestPending = 0;
  },

  testPending: function() {
    ++gTestPending;
  },

  waitForAsyncTest: function () {
    var thread = Cc['@mozilla.org/thread-manager;1'].getService(Ci.nsIThreadManager).currentThread;
    while (gTestPending > 0) {
      thread.processNextEvent(true);
    }
  },

  testFinished: function() {
    if (gTestPending > 0)  --gTestPending;
  },

  countSucceeded: function() {
    return gTestSucceed;
  },

  countFailed: function() {
    return gTestError;
  }
}
