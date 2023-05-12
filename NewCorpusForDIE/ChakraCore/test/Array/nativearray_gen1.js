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
    var obj0 = {};
    var arrObj0 = {};
    var func0 = function (argFunc0, argStr1, argFunc2, argArr3) {
        LABEL0:
        switch (1) {
            case 1:
                break LABEL0;
            default:
                break LABEL0;
            case 1:
                break LABEL0;
            case 1:
                (arrObj0);
                break LABEL0;
        }
    }
    var a = 1;
    var c = 1;
    var d = 1;

    arrObj0.xyz = [c, a, 1, 1]
    var v255197 = 0;
    for (var v255198 = 0; v255198 < 4; v255198++) {

        v255197 += arrObj0.xyz[v255198];
    }
    WScript.Echo("v255197 = " + v255197);

    arrObj0.xyz = [obj0.prop0, d, 1, 1]
    var v255199 = 0;
    for (var v255200 = 0; v255200 < 4; v255200++) {

        v255199 += arrObj0.xyz[v255200];
    }
    WScript.Echo("v255199 = " + v255199);

};

// generate profile
test0();
test0();
test0();

// run JITted code
runningJITtedCode = true;
test0();
test0();
test0();

function test5(){
  var ary = new Array(10);
  ary[(0)] = (~ undefined);
  WScript.Echo("ary[0] = " + (ary[0]));
};

// generate profile
test5();
Object.defineProperty(Array.prototype, "0", {configurable : true, get: function(){return 30;}});
test5();

var z;
function test6() {
        z = [];
        for (var a in[(z[/x/g]) = ("u636F")]) {}; ;
};
test6();
test6();
WScript.Echo(this.z.undefined);

function test7(){
  var func0 = function(){
    var id41 = ary;;
    id41 = ary[1];
  }
  var ary = new Array(10);
  ary[2] = "a";
  func0( );
};

// generate profile
test7();
test7();
