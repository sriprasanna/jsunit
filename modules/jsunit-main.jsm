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

  // printMsg: log stuff

  dumpMsg: function(str) {
    dump(str+"\n");
  },

  logMsgToJsd: function(str) {
    TinyjsdCommon.logString(str);
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

  printStats: function() {
    JSUnit.printMsg("\nFINAL STATS\n");
    JSUnit.printMsg("TestResult: executed : "+ (JSUnit.countFailed() + JSUnit.countSucceeded()));
    JSUnit.printMsg("TestResult: succeeded: "+ JSUnit.countSucceeded());
    JSUnit.printMsg("TestResult: failed   : "+ JSUnit.countFailed());

    gTestSucceed = 0;
    gTestError = 0;
  },


  init: function (useTinyJsd) {
    // initialize library
    gCurrDir = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIDirectoryServiceProvider)
                .getFile("CurWorkD",{});
    this.assert = new Assert(this.logTestResult);

    if (useTinyJsd) {
      try {
        Components.utils.import("resource://tinyjsd/tinyjsdCommon.jsm");
        this.printMsg = this.logMsgToJsd;
        return;
      }
      catch(ex) {}
    }

    // fallback: command line interface
    this.printMsg = this.dumpMsg;
  },

  setMainFile: function(fileName) {
    TinyjsdCommon.enableJsUnit(this.makeUrl(fileName));
  },

  getCwd: function () {
    return gCurrDir;
  },

  getFile: function (stack, testdirRelativePath, allowNonexistent)
  {

    //DEBUG_LOG("getFile: "+gCurrDir);

    var fn = gCurrDir.path+"/"+testdirRelativePath;

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


  makeUrl: function(scriptFile, isAbsolutePath) {
    var isUrl = false;
    if (scriptFile.search(/^(chrome|file|resource):\/\//) == 0) {
      isAbsolutePath = true;
      isUrl = true;
    }

    if (! isAbsolutePath) {
      scriptFile = "file://" + gCurrDir.path + "/" + scriptFile
    }
    if (! isUrl) {
      scriptFile = "file://" + scriptFile;
    }

    return scriptFile;
  },

  executeScript: function(scriptFile, isAbsolutePath, dontRun) {
    scriptFile = JSUnit.makeUrl(scriptFile, isAbsolutePath);

    let context = {};
    Services.scriptloader.loadSubScript("resource://jsunit/jsunit-wrapper.js", context, "UTF-8");
    Services.scriptloader.loadSubScript(scriptFile, context, "UTF-8");
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
  },

  // create empty DOM document
  createDOMDocument: function() {
    var dp = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
    return dp.parseFromString("</>", "text/xml");
  },

  // create a non-function nsIDOMWindow object that can be used as stub
  createStubWindow: function() {
    var w = {
      QueryInterface: XPCOMUtils.generateQI(["nsIDOMWindow"]),
      window: null,
      self: null,
      document: null,
      name: "JSUtil Stub Window",
      location: null,
      history: null,
      locationbar: null,
      menubar: null,
      personalbar: null,
      scrollbars: null,
      statusbar: null,
      toolbar: null,
      status: "",
      close: function() {},
      stop: function() {},
      focus: function() {},
      blur: function() {},
      length: 0,
      top: null,
      parent: null,
      opener: null,
      frameElement: null,
      navigator: {
        QueryInterface: XPCOMUtils.generateQI(["nsIDOMNavigator"]),
        appCodeName: "JSUnit",
        appName: "JSUnit",
        appVersion: "1",
        language: "en",
        platform: "",
        oscpu: "",
        vendor: "",
        vendorSub: "",
        product: "",
        productSub: "",
        userAgent: "",
        buildID: "",
        doNotTrack: ""
      },

      applicationCache: null,
      alert: function() {},
      confirm: function() {},
      prompt: function() {},
      print: function() {},
      showModalDialog: function() {},
      postMessage: function() {},
      atob: function(s) { return atob(s) },
      btoa: function(s) { return btoa(s) },
      sessionStorage: null,
      localStorage: null,
      indexedDB: null,
      mozIndexedDB: null,
      getSelection: function() {},
      matchMedia: function() {},
      screen: null,
      innerWidth: 0,
      innerHeight: 0,
      scrollX: 0,
      pageXOffset: 0,
      scrollY: 0,
      pageYOffset: 0,
      scroll: function() {},
      scrollTo: function() {},
      scrollBy: function() {},
      screenX : 0,
      screenY: 0,
      outerWidth: 0,
      outerHeight: 0,
      getComputedStyle: function() {},
      getDefaultComputedStyle:  function() {},
      scrollByLines: function() {},
      scrollByPages:  function() {},
      sizeToContent: function() {},
      closed: false,
      crypto: null,
      mozInnerScreenX: 0.0,
      mozInnerScreenY: 0.0,
      devicePixelRatio: 1.0,
      scrollMaxX: 0,
      scrollMaxY: 0,
      fullScreen: false,
      back: function() {},
      forward: function() {},
      home: function() {},
      moveTo: function() {},
      moveBy: function() {},
      resizeTo: function() {},
      resizeBy: function() {},
      open: function() {},
      openDialog: function() {},
      updateCommands: function() {},
      find: function() {},
      mozPaintCount: 0,
      mozRequestAnimationFrame: function() {},
      requestAnimationFrame: function() {},
      mozCancelAnimationFrame: function() {},
      mozCancelRequestAnimationFrame: function() {},
      cancelAnimationFrame: function() {},
      mozAnimationStartTime: 0,
      onafterprint: null,
      onbeforeprint: null,
      onbeforeunload: null,
      onhashchange: null,
      onlanguagechange: null,
      onmessage: null,
      onoffline: null,
      ononline: null,
      onpopstate: null,
      onpagehide: null,
      onpageshow: null,
      // Not supported yet (Gecko 32)
      onredo: null,
      onresize: null,
      // Not supported yet (Gecko 32)
      onstorage: null,
      // Not supported yet (Gecko 32)
      onundo: null,
      onunload: null,
      ondevicemotion: null,
      ondeviceorientation: null,
      ondeviceproximity: null,
      onuserproximity: null,
      ondevicelight: null,
      onmouseenter: null,
      onmouseleave: null,
      console: null,
      addEventListener: function() {}
    };

    w.self = w;
    w.top = w;
    w.parent = w;
    return w;
  }
}
