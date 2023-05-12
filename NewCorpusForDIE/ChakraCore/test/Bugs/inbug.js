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
  // -ve index true case
  var arr0 = Array(1, 2);
  arr0[-7] = 3;
  return (-7 in arr0);
}


var res = test0();
res &= test0();
res &= test0();

function test1() {
  // multiple segments
  var arr0 = Array();
  arr0[11] = -2;
  return (11 in arr0);
}

res &= test1();
res &= test1();
res &= test1();

function test2() {
  // -ve index false case
  var arr0 = Array(1, 2);
  return (-7 in arr0);
}
res &= !test2();
res &= !test2();
res &= !test2();

function test3() {
  // +ve index on prototype
  var arr0 = Array(1, 2);
  Array.prototype[7] = 0;
  var ret = (7 in arr0);
  delete Array.prototype[7];
  return ret;
}
res &= test3();
res &= test3();
res &= test3();

function test4() {
  // -ve index on prototype
  var arr0 = Array(1, 2);
  Array.prototype[-2] = 0;
  var ret = (-2 in arr0);
  delete Array.prototype[-2];
  return ret;
}
res &= test4();
res &= test4();
res &= test4();

function test5() {
  // length edge cases and NativeIntArray case
  var ret1 = 0 in [];
  var ret2 = 2 in [1, 2];
  var ret3 = 0 in [1, 2];
  var ret4 = 1 in [1, 2];
  return (!ret1 & !ret2 & ret3 & ret4);
}
res &= test5();
res &= test5();
res &= test5();

function test6() {
  // not an int index
  return !(1.1 in [1,2]);
}
res &= test6();
res &= test6();
res &= test6();

function test7() {
  var ret1 = 0 in [1.1, 2.1];
  var ret2 = 2 in [1, 2.0];
  return (ret1 & !ret2);
}
res &= test7();
res &= test7();
res &= test7();

function test8() {
  var arr = [1, 2];
  delete arr[0];
  return !(0 in arr);
}
res &= test8();
res &= test8();
res &= test8();

var arr = [1, 2];
function test9() {
  return (0 in arr);
}
res &= test9();
res &= test9();
delete arr[0];
res &= !test9();

if (res) {
  print("Passed");
}
