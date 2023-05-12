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

WScript.Echo("foo".anchor());
WScript.Echo("foo".big());
WScript.Echo("foo".blink());
WScript.Echo("foo".bold());
WScript.Echo("foo".fixed());
WScript.Echo("foo".fontcolor("#FF00FF"));
WScript.Echo("foo".fontsize(12));
WScript.Echo("foo".italics());
WScript.Echo("foo".small());
WScript.Echo("foo".strike());
WScript.Echo("foo".sub());
WScript.Echo("foo".sup());

WScript.Echo("foo".anchor('"')); // Should be escaped to &quot;
WScript.Echo("foo".anchor('<')); // Should not be escaped.

WScript.Echo("foo".anchor('aaa"bbbccc')); // Test memcpy shortcut.

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js", "self");
var wrappers = ["anchor", "big", "blink", "bold", "fixed", "fontcolor",  
                "fontsize", "italics", "small", "strike", "sub", "sup"];
var tests = {
  test01: {
    name: "Check that String.prototype.x.call throws a TypeError on null or undefined ",
    body: function () {
      for (var i in wrappers) {
        helpers.writeln("trying: ", wrappers[i], ": String.prototype." + wrappers[i] + ".call");
        assert.throws(function () { eval("String.prototype." + wrappers[i] + ".call(null);") }, TypeError);
        assert.throws(function () { eval("String.prototype." + wrappers[i] + ".call(undefined);") }, TypeError);
      }
    }
  }
}

testRunner.runTests(tests);
