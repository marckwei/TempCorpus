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
       name: "String.prototype is a String",
       body: function ()
       {
            try
            {
                String.prototype.valueOf();
            }
            catch(e)
            {
                if (e instanceof TypeError && e.message === "String.prototype.valueOf: 'this' is not a String object") {
                    assert.isFalse(true,"String.prototype is not a generic object, it should be a String object")
                }
                assert.isFalse(true, "Investigate " + e);
            }
       }
   },
   {
       name: "Boolean.prototype is a Boolean",
       body: function ()
       {
            try
            {
                Boolean.prototype.valueOf();
            }
            catch(e)
            {
                if (e instanceof TypeError && e.message === "Boolean.prototype.valueOf: 'this' is not a Boolean object") {
                    assert.isFalse(true,"Boolean.prototype is not a generic object, it should be a Boolean object")
                }
                assert.isFalse(true, "Investigate " + e);
            }
       }
   },
   {
       name: "Number.prototype is a Number",
       body: function ()
       {
            try
            {
                Number.prototype.valueOf();
            }
            catch(e)
            {
                if (e instanceof TypeError && e.message === "Number.prototype.valueOf: 'this' is not a Number object") {
                    assert.isFalse(true,"Number.prototype is not a generic object, it should be a Number object")
                }
                assert.isFalse(true, "Investigate " + e);
            }
       }
   }
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
