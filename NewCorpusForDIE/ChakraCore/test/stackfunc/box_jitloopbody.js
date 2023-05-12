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

function test0() {
    var obj1 = {};
    var func2 = function () {
        for (var __loopvar1 = 0; __loopvar1 < 3; __loopvar1++) {
            obj1.prop0 = (function (x, y, z) {
                function v3310() {
                    throw "loopbreakblock6.ecs";
                }
                function v3312() {
                    var v3313 = 0;
                    for (var i = 0; obj1.length < ary.unshift(__loopvar1), 'prop0' in litObj0; i++) {
                        if (i > 3) break;
                        if (v3313++ > 2) {

                            v3310();
                        }
                    }
                }
                try {
                    v3312();
                } catch (e) {
                    WScript.Echo(e.message);
                }

            })(ary[1 >= 0 ? (obj1.prop0 > obj1.length) : 0]);

        }
    }
    var ary = new Array(10);
    var b = 1;
    func2(obj1);
    WScript.Echo('ary[0] = ' + (ary[0]));
};

// generate profile
test0();

