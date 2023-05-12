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
    var obj2 = {};
    var arrObj0 = {};
    var func2 = function (argStr2, argStr3, argStr4, argStr5) {
        // CSE when expressions present on LHS.

        function _csetest(_x, _y) {
            _x.prop1 = _y;
            return _x;
        }

        _csetest({ "prop1": 1 }, true).prop2 = true;

        ary[true] = 1 + this.prop5;
        var v42500 = ary[true] + ary[true];
    }
    var ary = new Array(10);
    // CSE when expressions contain element access of an array using "." and [] modifier.
    var v42501 = ary[(func2.call(arrObj0, 1, 1, 1, 1) * 1)] + obj2.prop1;
    ary.len = obj0.prop6
    obj2.length = ary[(func2.call(arrObj0, 1, 1, 1, 1) * 1)] + obj2.prop1;

};

// generate profile
test0();
test0();
test0();
test0();

// run JITted code
runningJITtedCode = true;
test0();
test0();
test0();
test0();

var shouldBailout = false;
function test0(){
  var obj0 = {};
  var obj1 = {};
  var arrObj0 = {};
  var func0 = function(argMath0,argMath1,argArr2){
    var __loopvar16 = 0;
    do {
      __loopvar16++;
      arrObj0[(((ary[((shouldBailout ? (ary[5] = "x") : undefined ), 5)] >= 0 ? ary[((shouldBailout ? (ary[5] = "x") : undefined ), 5)] : 0)) & 0XF)] = 1;
      argArr2[(((arrObj0[(15)] >= 0 ? arrObj0[(15)] : 0)) & 0XF)] = 1;
    } while((ary[(((1 >= 0 ? 1 : 0)) & 0XF)]) && __loopvar16 < 3)
    return 1;
  }
  var func1 = function(){
    func0(1, func0(1, 1, ary), 1);
  }
  var func2 = function(argStr3,argMath4,argFunc5,argFunc6){
    (func0(1, 1, ary) ? func0.call(obj0 , 1, func1.call(obj0 ), 1) : 1);
  }
  obj1.method0 = func2;
  var ary = new Array(10);
  ary[5] = 1;
  obj1.method0.call(obj1 , 1, 1, 1, 1);
};

// generate profile
test0();
test0();
test0();
test0();
test0();

// run JITted code
runningJITtedCode = true;
test0();
test0();
test0();
test0();
test0();

WScript.Echo('PASS');