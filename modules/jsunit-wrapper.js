/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
  Wrapper file that is inclued for every Test executed
*/

Components.utils.import("resource://jsunit/jsunit-main.jsm");

var assert = JSUnit.assert;


function do_get_file (filename, allowNonexistent) {
  var c = Components.stack.caller;
  return JSUnit.getFile(c, filename, allowNonexistent);
}

function do_throw(exception) {
  var c = Components.stack.caller;
  return JSUnit.throwException(c.filename, c.lineNumber, exception);
}

var do_get_cwd = JSUnit.getCwd;

var do_test_pending = JSUnit.testPending;

var do_test_finished = JSUnit.testFinished;

var do_print = JSUnit.printMsg;

var do_subtest = JSUnit.executeScript;


function do_load_script(urlString) {
  JSUnit.loadScript(urlString, this);
}

