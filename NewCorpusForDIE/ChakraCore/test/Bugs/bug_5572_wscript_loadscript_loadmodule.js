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
function func_0(){ return "" };

var tests = [
  {
    name: "Expect exception with invalid file name to WScript.LoadScript",
    body: function () {  
        assert.throws(function () { 
            WScript.LoadScript(``, ``, {
                toString: function () {
                    func_0();
                }}
            );        
        }, Error, 
        "Should throw for invalid input to WScript.LoadScript", 
        "Unsupported argument type inject type.");
    }
  },
  {
    name: "Expect exception with invalid type to WScript.LoadScript",
    body: function () {  
        assert.throws(function () { 
            WScript.LoadScript(``, {
                toString: function () {
                    func_0();
                }}, ``
            );        
        }, Error, 
        "Should throw for invalid input to WScript.LoadScript", 
        "Unsupported argument type inject type.");
    }
  },
  {
    name: "Expect exception with invalid content to WScript.LoadScript",
    body: function () {  
        assert.throws(function () { 
            WScript.LoadScript({
                toString: function () {
                    func_0();
                }}, ``, ``
            );        
        }, Error, 
        "Should throw for invalid input to WScript.LoadScript", 
        "Unsupported argument type inject type.");
    }
  },
  {
    name: "Expect exception with invalid file name to WScript.LoadModule",
    body: function () {  
        assert.throws(function () { 
            WScript.LoadModule(``, ``, {
                toString: function () {
                    func_1();
                }}
            );        
        }, ReferenceError, 
        "'func_1' is not defined");
    }
  },
  {
    name: "Expect exception with invalid type to WScript.LoadModule",
    body: function () {  
        assert.throws(function () { 
            WScript.LoadModule(``, {
                toString: function () {
                    func_1();
                }}, ``
            );        
        }, ReferenceError, 
        "Should throw for invalid input to WScript.LoadModule", 
        "'func_1' is not defined");
    }
  },
  {
    name: "Expect exception with invalid content to WScript.LoadModule",
    body: function () {  
        assert.throws(function () { 
            WScript.LoadModule({
                toString: function () {
                    func_1();
                }}, ``, ``
            );        
        }, ReferenceError, 
        "Should throw for invalid input to WScript.LoadModule", 
        "'func_1' is not defined");
    }
  },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
