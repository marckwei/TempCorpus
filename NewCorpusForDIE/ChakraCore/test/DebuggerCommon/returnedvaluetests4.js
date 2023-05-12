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

// Validating return values with built-ins and host objects.
function Run() {
    function test1() {
        var a = Date(); /**bp:locals();resume('step_over');locals();resume('step_over');locals()**/
        WScript.Echo("Pass") + WScript.SetTimeout("1", 10);
    }
    test1();

    Array.prototype.ucase = function () {
        for(var i =0; i < this.length;i++) {
            this[i] = this[i].toUpperCase();
        }
    }
    function test2() {
        var arr = new Array("a","b"); /**bp:locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals();resume('step_over');locals()**/
        arr.push("c");
        var str = arr.join();
        arr.ucase();
        var str1 = "All caps " + arr.join();
    }
    test2();
}
WScript.Attach(Run);