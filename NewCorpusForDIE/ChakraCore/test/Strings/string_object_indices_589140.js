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

if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
    {
        name: "Setting property with name == new string.length creates a property",
        body: function () {
            var s = new String(0);
            s[0] = 0;
            s[1] = 1;
            s[2] = 2;
            
            assert.areEqual(1, s.length, "new String(0) has length == 1");
            assert.areEqual('0', s[0], "new String(0) has character '0' at property named 0");
            assert.isFalse(0 === s[0], "Setting property with name < string.length doesn't work");
            assert.areEqual(1, s[1], "Setting property with name == string.length works");
            assert.areEqual(2, s[2], "Setting property with name > string.length works");
            
            var s = new String(123);
            s[0] = 0;
            s[1] = 1;
            s[2] = 2;
            s[3] = 3;
            s[4] = 4;
            
            assert.areEqual(3, s.length, "new String(123) has length == 3");
            assert.areEqual('1', s[0], "new String(123) has character '1' at property named 0");
            assert.isFalse(0 === s[0], "Setting property with name < string.length doesn't work");
            assert.areEqual('2', s[1], "new String(123) has character '2' at property named 1");
            assert.isFalse(1 === s[1], "Setting property with name < string.length doesn't work");
            assert.areEqual('3', s[2], "new String(123) has character '3' at property named 2");
            assert.isFalse(2 === s[2], "Setting property with name < string.length doesn't work");
            assert.areEqual(3, s[3], "Setting property with name == string.length works");
            assert.areEqual(4, s[4], "Setting property with name > string.length works");
        }
    },
];

testRunner.runTests(tests);
