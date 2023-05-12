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

var GiantPrintArray = [];

function test0() {
    var obj1 = {};
    var IntArr0 = [787917310, 4294967296, 926685325, 104, -1308153184, -1073741824, 1868785301, 1064239984, 693100003, 2147483647, 2147483647, -575755389, -615389387];
    //Snippet:trycatchstackwind.ecs
    function v2201() {
        function v2202() {
            try {
                this.prop1();
            } catch (ex) {
            }
        }
        var v2205 = { prop1: 0.1 };
        v2205.prop1;
        for (var v2206 = 0; v2206 < 1; ++v2206) {
            v2202();
            var v2207 = v2205.prop1;
            v2207 += 1;
            // CSE when used within conditional operator
            var v2208;
            IntArr0 + v2208;
            GiantPrintArray.push(v2207);
        }
    };
    v2201();

    for (var i = 0; i < GiantPrintArray.length; i++) {
        WScript.Echo(GiantPrintArray[i]);
    };
};

// generate profile
test0();
// Run Simple JIT
test0();

// run JITted code
runningJITtedCode = true;
test0();
