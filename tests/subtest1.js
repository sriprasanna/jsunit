/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


function runDelayed( callbackFunction, sleepTimeMs ) {
  var timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  timer.initWithCallback(callbackFunction, sleepTimeMs, Ci.nsITimer.TYPE_ONE_SHOT);
  return timer;
}

function asyncTests() {

  do_print("** Performing async tests **");
  Assert.ok(true, "true");
  Assert.ok(false, "false");
  Assert.equal("3", 3, "equal");
  Assert.deepEqual('3', 3, "deepEqual");
  Assert.strictEqual('3', 3, "strictEqual");

  // check if invalid/filename.txt exists
  do_get_file("invalid/filename.txt");
  do_test_finished();
}

function syncTests() {
  do_print("** Performing Synchronous tests **")
  Assert.ok(true, "true");
  Assert.ok(false);
  Assert.equal(timesThree(5), 15);

  // check if test/sample-test.js exists
  do_get_file("tests/sample-test.js");
}

do_load_module("chrome://jsunit/content/sample-include.js");

function run_test() {
  syncTests();

  do_test_pending(); // should be set before the async call
  runDelayed(asyncTests, 100);
}


