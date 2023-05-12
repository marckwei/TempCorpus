function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

var reWordChar = /\w/;
var reNonWordChar = /\W/;
var reWordCharI = /\w/i;
var reNonWordCharI = /\W/i;
var reWordCharU = /\w/u;
var reNonWordCharU = /\W/u;
var reWordCharIU = /\w/iu;
var reNonWordCharIU = /\W/iu;

var reWordCharName = "word-char";
var reNonWordCharName = "NON-word-char";

basic_tests = [
    's', 'S', 'k', 'K'
];

basic_tests_names = ['lowercase s', 'uppercase S', 'lowercase k', 'uppercase K'];

u_tests = [
    '\u017F', // Sharp S
    '\u212A', // Kelvin sign
];

u_tests_names = ['Sharp S', 'Kelvin sign'];

function assert(a, msg) {
    if (!a) {
        console.log("FAIL: " + msg);
    }
}

function assertMatch(regex, reName, string, name) {
    var b = regex.test(string);
    var msg = "" + regex + " " + reName + " should match '" + string + "' (" + name + ")";
    assert(b, msg);
}

function assertNonMatch(regex, reName, string, name) {
    var b = !regex.test(string);
    var msg = "" + regex + " " + reName + " should not match '" + string + "' (" + name + ")";
    assert(b, msg);
}

for (i in basic_tests) {
    assertMatch(reWordChar, reWordCharName, basic_tests[i], basic_tests_names[i]);
    assertMatch(reWordCharI, reWordCharName, basic_tests[i], basic_tests_names[i]);
    assertMatch(reWordCharU, reWordCharName, basic_tests[i], basic_tests_names[i]);
    assertMatch(reWordCharIU, reWordCharName, basic_tests[i], basic_tests_names[i]);

    assertNonMatch(reNonWordChar, reNonWordCharName, basic_tests[i], basic_tests_names[i]);
    assertNonMatch(reNonWordCharI, reNonWordCharName, basic_tests[i], basic_tests_names[i]);
    assertNonMatch(reNonWordCharU, reNonWordCharName, basic_tests[i], basic_tests_names[i]);
    assertNonMatch(reNonWordCharIU, reNonWordCharName, basic_tests[i], basic_tests_names[i]);
}

for (i in u_tests) {
    assertNonMatch(reWordChar, reWordCharName, u_tests[i], u_tests_names[i]);
    assertNonMatch(reWordCharI, reWordCharName, u_tests[i], u_tests_names[i]);
    assertNonMatch(reWordCharU, reWordCharName, u_tests[i], u_tests_names[i]);
    assertMatch(reWordCharIU, reWordCharName, u_tests[i], u_tests_names[i]);

    assertMatch(reNonWordChar, reWordCharName, u_tests[i], u_tests_names[i]);
    assertMatch(reNonWordCharI, reNonWordCharName, u_tests[i], u_tests_names[i]);
    assertMatch(reNonWordCharU, reWordCharName, u_tests[i], u_tests_names[i]);
    assertNonMatch(reNonWordCharIU, reNonWordCharName, u_tests[i], u_tests_names[i]);
}

console.log("PASS");
