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

var lol = function() {
    var n = function() {}
    n(formatOutput());
};
function formatOutput() {
    var n = function() {}
    return n(/[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/g, function() {
    });
}
var __counter = 0;
__counter++;
var protoObj0 = {};
protoObj0.method1 = {
    init: function() {
        return function bar() {
        };
    }
}.init();
protoObj0.method1.prototype = {
    method1: function() {
        try {
            function v0() {
                var v1 = 1;
                Object.prototype.indexOf = String.prototype.indexOf;
                prop1 = {
                    toString: function() {
                        v1;
                    }
                }.indexOf();
                [].push(v1);
            }
            v0();
            [
              {},
              new protoObj0.method1()
            ][__counter].method1();
        } catch(ex) {
            lol();
        } finally {
        }
    }
};
for(var _strvar22 in (new Int8Array(1))) {
    var n = function() {}
    var m = function() {}
    n(m(new protoObj0.method1().method1()));
}
WScript.Echo("PASS");
