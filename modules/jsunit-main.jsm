/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

var EXPORTED_SYMBOLS = [ "JSUnit" ];

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

const Cc = Components.classes;
const Ci = Components.interfaces;

var gTestError =   0;
var gTestSucceed = 0;
var gTestPending = 0;

var gCurrDir = "";

function DEBUG_LOG(str) {
  dump("jsunit-main.jsm: "+str+"\n");
}

function setTimeout( callbackFunction, sleepTimeMs ) {
  var timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  timer.initWithCallback(callbackFunction, sleepTimeMs, Ci.nsITimer.TYPE_ONE_SHOT);
  return timer;
}

var JSUnit = {

  printMsg: function(str) {
    dump(str+"\n");
  },

  testSucceeded: function() {
    gTestSucceed++;
  },

  dumpErr: function(testName, testStep, str) {
    gTestError++;
    JSUnit.printMsg(testName +" - Step "+ testStep +": ERROR: "+str);
  },

  init: function () {
    // initialize library
    gCurrDir = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIDirectoryServiceProvider)
                .getFile("CurWorkD",{}).path;
  },

  getCwd: function () {
    return gCurrDir;
  },

  getFile: function (testName, testStep, testdirRelativePath, allowNonexistent)
  {

    //DEBUG_LOG("getFile: "+gCurrDir);

    var fn = gCurrDir+"/"+testdirRelativePath;

    var lf = Components.classes["@mozilla.org/file/local;1"].createInstance(
          Components.interfaces.nsILocalFile);
    lf.initWithPath(fn);

    if (! (allowNonexistent || lf.exists())) {
      JSUnit.dumpErr(testName, testStep, "file '"+fn+"' not found");
      return null;
    }

    JSUnit.testSucceeded();
    return lf;
  },

  executeScript: function(scriptFile, isAbsolutePath) {
    if (! isAbsolutePath) {
      scriptFile = gCurrDir + "/" + scriptFile
    }

    let context = {};
    Services.scriptloader.loadSubScript("resource://jsunit/jsunit-wrapper.js", context, "UTF-8");
    Services.scriptloader.loadSubScript("file://"+scriptFile, context, "UTF-8");
    if (gTestPending) {
      JSUnit.waitForAsyncTest();
    }
  },

  checkTrue: function(testName, testStep, boolValue) {
    if (! boolValue) {
      JSUnit.dumpErr(testName, testStep, "found not true value");
    }
    else
      JSUnit.testSucceeded();
  },

  checkFalse: function (testName, testStep, boolValue) {
    if (boolValue) {
      JSUnit.dumpErr(testName, testStep, "found true value");
    }
    else
      JSUnit.testSucceeded();
  },

  checkEq: function(testName, testStep, a, b) {
    if (! (a == b)) {
      JSUnit.dumpErr(testName, testStep, "found: '"+a+"' != '"+b+"'");
    }
    else
      JSUnit.testSucceeded();
  },

  checkNeq: function(testName, testStep, a, b) {
    if (a == b) {
      JSUnit.dumpErr(testName, testStep, "found: '"+a+"' == '"+b+"'");
    }
    else
      JSUnit.testSucceeded();
  },

  testPending: function() {
    gTestPending = 1;
  },

  waitForAsyncTest: function () {
    var thread = Cc['@mozilla.org/thread-manager;1'].getService(Ci.nsIThreadManager).currentThread;
    while (gTestPending) thread.processNextEvent(true);
  },

  testFinished: function() {
    gTestPending = 0;
  },

  countSucceeded: function() {
    return gTestSucceed;
  },

  countFailed: function() {
    return gTestError;
  }
}
