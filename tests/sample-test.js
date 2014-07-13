/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


//Components.utils.import("resource://jsunit/jsunit-main.jsm");

// Main function call for Unit test

function setTimeout( callbackFunction, sleepTimeMs ) {
  var timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  timer.initWithCallback(callbackFunction, sleepTimeMs, Ci.nsITimer.TYPE_ONE_SHOT);
  return timer;
}

function asyncTests() {

  do_print_msg("Performing async tests");
  do_check_true(11, true);
  do_check_true(12, false);
  do_check_false(13, false);
  do_check_false(14, true);
  do_check_eq(15, "x", "x");
  do_check_eq(16, "x", "y");
  do_check_neq(17, "x", "y");
  do_check_neq(18, "x", "x");
  do_get_file(19, "tests/sample-test.js");
  do_test_finished();
}

do_test_init("SampleTest");
do_print_msg("Performing Synchronous tests")

do_check_true(1, true);
do_check_true(2, false);
do_check_false(3, false);
do_check_false(4, true);
do_check_eq(5, "x", "x");
do_check_eq(6, "x", "y");
do_check_neq(7, "x", "y");
do_check_neq(8, "x", "x");
do_get_file(9, "tests/sample-test.js");

do_test_pending();
setTimeout(asyncTests, 100);


