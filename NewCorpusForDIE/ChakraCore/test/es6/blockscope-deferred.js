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

function print(x) { WScript.Echo(x+'') }

var dojo = {};
{
    function dj_undef() { }

    dojo.evalProps = function () {
        dj_undef();
    };
}

dojo.evalProps();

///////////

function foo0(level_1_identifier_0) {
    var level_1_identifier_1 = "level1";
    level_1_identifier_1 += "level1";
    with ({ level_1_identifier_0: "level2", level_1_identifier_1: "level2" }) {
        level_1_identifier_1 += "level2";

        function foo1(level_3_identifier_0) {
            print('foo1');
            level_1_identifier_0 += "level3";
            level_1_identifier_1 += "level3";
        }
        foo1("level3");

        print(level_1_identifier_0);
        print(level_1_identifier_1);
    }

    print(level_1_identifier_0);
    print(level_1_identifier_1);
}
foo0("level1");

///////////////

function level1Func(level_1_identifier_0) {
    with ({ level_1_identifier_0: "level2" }) {
        function level3Func(level_3_identifier_0) {
            level_1_identifier_0 += "level3";
        }
        level3Func("level3");
        print(level_1_identifier_0);
    }
    print(level_1_identifier_0);
}
level1Func("level1");

