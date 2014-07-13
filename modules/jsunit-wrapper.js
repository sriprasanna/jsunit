/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
  Wrapper file that is inclued for every Test executed
*/

Components.utils.import("resource://jsunit/jsunit-main.jsm");

var _gMyTestName = "";

function do_check_true(step, boolVal) {
  return JSUnit.checkTrue(_gMyTestName, step, boolVal);
}

function do_check_false (step, boolVal) {
  return JSUnit.checkFalse(_gMyTestName, step, boolVal);
}

function do_check_eq (step, a, b) {
  return JSUnit.checkEq(_gMyTestName, step, a, b);
}

function do_check_neq (step, a, b) {
  return JSUnit.checkNeq(_gMyTestName, step, a, b);
}

function do_get_file (step, filename, allowNonexistent) {
  return JSUnit.getFile(_gMyTestName, step, filename, allowNonexistent);
}

var do_get_cwd = JSUnit.getCwd;

var do_test_pending = JSUnit.testPending;

var do_waitfor_async_test = JSUnit.waitForAsyncTest;

var do_test_finished = JSUnit.testFinished;

var do_print_msg = JSUnit.printMsg;


function do_test_init(testName) {
  _gMyTestName = testName;
}

//var do_throw;



