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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
  {
    name: "Verify last match invalidated as expected",
    body: function () {
        const r1 = /(abc)/;
        const r2 = /(def)/;
        const s1 = "abc";
        const s2 = " def";
         
        r1.test(s1);
        
        assert.areEqual("abc", RegExp.input, "RegExp.input property calculated correctly");
        assert.areEqual("abc", RegExp['$_'], "RegExp.$_ property calculated correctly");
        assert.areEqual("abc", RegExp.lastMatch, "RegExp.lastMatch property calculated correctly");
        assert.areEqual("abc", RegExp['$&'], "RegExp.$& property calculated correctly");
        assert.areEqual("abc", RegExp.$1, "RegExp.$1 property calculated correctly");
        assert.areEqual(0, RegExp.index, "RegExp.index property calculated correctly");
        
        r2.test(s2);
        
        assert.areEqual(" def", RegExp.input, "RegExp.input property calculated correctly");
        assert.areEqual(" def", RegExp['$_'], "RegExp.$_ property calculated correctly");
        assert.areEqual("def", RegExp.lastMatch, "RegExp.lastMatch property calculated correctly");
        assert.areEqual("def", RegExp['$&'], "RegExp.$& property calculated correctly");
        assert.areEqual("def", RegExp.$1, "RegExp.$1 property calculated correctly");
        assert.areEqual(1, RegExp.index, "RegExp.index property calculated correctly");
        
        r1.test(s1);

        assert.areEqual("abc", RegExp.input, "Stale RegExp.input property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp['$_'], "Stale RegExp.$_ property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp.lastMatch, "Stale RegExp.lastMatch should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp['$&'], "Stale RegExp.$& property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp.$1, "Stale RegExp.$1 should be invalidated by second r1.test(s1)");
        assert.areEqual(0, RegExp.index, "Stale RegExp.index property should be invalidated by second r1.test(s1)");
    }
  },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });

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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
  {
    name: "Verify last match invalidated as expected",
    body: function () {
        const r1 = /(abc)/;
        const r2 = /(def)/;
        const s1 = "abc";
        const s2 = " def";
         
        r1.test(s1);
        
        assert.areEqual("abc", RegExp.input, "RegExp.input property calculated correctly");
        assert.areEqual("abc", RegExp['$_'], "RegExp.$_ property calculated correctly");
        assert.areEqual("abc", RegExp.lastMatch, "RegExp.lastMatch property calculated correctly");
        assert.areEqual("abc", RegExp['$&'], "RegExp.$& property calculated correctly");
        assert.areEqual("abc", RegExp.$1, "RegExp.$1 property calculated correctly");
        assert.areEqual(0, RegExp.index, "RegExp.index property calculated correctly");
        
        r2.test(s2);
        
        assert.areEqual(" def", RegExp.input, "RegExp.input property calculated correctly");
        assert.areEqual(" def", RegExp['$_'], "RegExp.$_ property calculated correctly");
        assert.areEqual("def", RegExp.lastMatch, "RegExp.lastMatch property calculated correctly");
        assert.areEqual("def", RegExp['$&'], "RegExp.$& property calculated correctly");
        assert.areEqual("def", RegExp.$1, "RegExp.$1 property calculated correctly");
        assert.areEqual(1, RegExp.index, "RegExp.index property calculated correctly");
        
        r1.test(s1);

        assert.areEqual("abc", RegExp.input, "Stale RegExp.input property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp['$_'], "Stale RegExp.$_ property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp.lastMatch, "Stale RegExp.lastMatch should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp['$&'], "Stale RegExp.$& property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp.$1, "Stale RegExp.$1 should be invalidated by second r1.test(s1)");
        assert.areEqual(0, RegExp.index, "Stale RegExp.index property should be invalidated by second r1.test(s1)");
    }
  },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });

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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
  {
    name: "Verify last match invalidated as expected",
    body: function () {
        const r1 = /(abc)/;
        const r2 = /(def)/;
        const s1 = "abc";
        const s2 = " def";
         
        r1.test(s1);
        
        assert.areEqual("abc", RegExp.input, "RegExp.input property calculated correctly");
        assert.areEqual("abc", RegExp['$_'], "RegExp.$_ property calculated correctly");
        assert.areEqual("abc", RegExp.lastMatch, "RegExp.lastMatch property calculated correctly");
        assert.areEqual("abc", RegExp['$&'], "RegExp.$& property calculated correctly");
        assert.areEqual("abc", RegExp.$1, "RegExp.$1 property calculated correctly");
        assert.areEqual(0, RegExp.index, "RegExp.index property calculated correctly");
        
        r2.test(s2);
        
        assert.areEqual(" def", RegExp.input, "RegExp.input property calculated correctly");
        assert.areEqual(" def", RegExp['$_'], "RegExp.$_ property calculated correctly");
        assert.areEqual("def", RegExp.lastMatch, "RegExp.lastMatch property calculated correctly");
        assert.areEqual("def", RegExp['$&'], "RegExp.$& property calculated correctly");
        assert.areEqual("def", RegExp.$1, "RegExp.$1 property calculated correctly");
        assert.areEqual(1, RegExp.index, "RegExp.index property calculated correctly");
        
        r1.test(s1);

        assert.areEqual("abc", RegExp.input, "Stale RegExp.input property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp['$_'], "Stale RegExp.$_ property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp.lastMatch, "Stale RegExp.lastMatch should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp['$&'], "Stale RegExp.$& property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp.$1, "Stale RegExp.$1 should be invalidated by second r1.test(s1)");
        assert.areEqual(0, RegExp.index, "Stale RegExp.index property should be invalidated by second r1.test(s1)");
    }
  },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });

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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
  {
    name: "Verify last match invalidated as expected",
    body: function () {
        const r1 = /(abc)/;
        const r2 = /(def)/;
        const s1 = "abc";
        const s2 = " def";
         
        r1.test(s1);
        
        assert.areEqual("abc", RegExp.input, "RegExp.input property calculated correctly");
        assert.areEqual("abc", RegExp['$_'], "RegExp.$_ property calculated correctly");
        assert.areEqual("abc", RegExp.lastMatch, "RegExp.lastMatch property calculated correctly");
        assert.areEqual("abc", RegExp['$&'], "RegExp.$& property calculated correctly");
        assert.areEqual("abc", RegExp.$1, "RegExp.$1 property calculated correctly");
        assert.areEqual(0, RegExp.index, "RegExp.index property calculated correctly");
        
        r2.test(s2);
        
        assert.areEqual(" def", RegExp.input, "RegExp.input property calculated correctly");
        assert.areEqual(" def", RegExp['$_'], "RegExp.$_ property calculated correctly");
        assert.areEqual("def", RegExp.lastMatch, "RegExp.lastMatch property calculated correctly");
        assert.areEqual("def", RegExp['$&'], "RegExp.$& property calculated correctly");
        assert.areEqual("def", RegExp.$1, "RegExp.$1 property calculated correctly");
        assert.areEqual(1, RegExp.index, "RegExp.index property calculated correctly");
        
        r1.test(s1);

        assert.areEqual("abc", RegExp.input, "Stale RegExp.input property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp['$_'], "Stale RegExp.$_ property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp.lastMatch, "Stale RegExp.lastMatch should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp['$&'], "Stale RegExp.$& property should be invalidated by second r1.test(s1)");
        assert.areEqual("abc", RegExp.$1, "Stale RegExp.$1 should be invalidated by second r1.test(s1)");
        assert.areEqual(0, RegExp.index, "Stale RegExp.index property should be invalidated by second r1.test(s1)");
    }
  },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
