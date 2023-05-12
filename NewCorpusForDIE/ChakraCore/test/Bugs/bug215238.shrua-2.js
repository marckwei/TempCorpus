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

function getRoundValue(n) {
 if(typeof n === 'number') {
    if(n % 1 == 0) // int number
        return n % 2147483647;
    else // float number
        return n.toFixed(8);
 }
 return n;
};
function test0(){
  var GiantPrintArray = [];
  function makeArrayLength(x) { if(x < 1 || x > 4294967295 || x != x || isNaN(x) || !isFinite(x)) return 100; else return Math.floor(x) & 0xffff; };
  var obj0 = {};
  var arrObj0 = {};
  var func0 = function(argMath0,argMath1,argMath2,argArrObj3){
    arrObj0.length = makeArrayLength((~ ((1 - obj0.prop0) >>> ((1 - obj0.prop0) - {prop0: 1, prop1: 1, prop2: 1, prop3: 1}))));
  };
  var func1 = function(argObj4,argArrObj5,argFunc6){
    o = 1;
  };
  var func4 = function(argMath7,argArrObj8,argObj9,argFunc10){
    func0.call(protoObj0 , 1, 1, func1.call(obj0 , 1, 1, 1), 1);
  };
  arrObj0.method0 = func4;
  protoObj0 = Object.create(obj0);
  obj0.prop0 = 1073741823;
  m = func0.call(arrObj0 , 1, arrObj0.method0.call(arrObj0 , 1, 1, 1, 1), 1, 1);

  function v18()
  {
    this.v19 = 1;
    this.v20 = (++ o);
    this.v21 = (-- arrObj0.length);
    this.v22 = arrObj0.length;
    this.v21= 1;
    return this.v21;
  }
  function v23()
  {
    var v24 = new v18();

    GiantPrintArray.push(v24.v21);
    GiantPrintArray.push(v24.v19);
    GiantPrintArray.push(v24.v20);
    GiantPrintArray.push(v24.v22);

  }
  v25 = {};
  v25.x = 23456;
  v26 = {};
  v26.x = 65432;
  v18.prototype = v25;
  v23();
  v23();
  v18.prototype = v26;

  v23();

  for(var i =0;i<GiantPrintArray.length;i++){
  GiantPrintArray[i] = getRoundValue(GiantPrintArray[i]);
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
