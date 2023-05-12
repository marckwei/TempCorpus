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


function TestCacheAtWrite(expvalue)
{
    var temp = expvalue;
    var startvalue = expvalue;
    for(var k=0;k<3;k++)
    {
        if(k>=2)
        {
            //donot update the cache the next two times 
            startvalue = temp;
            WScript.Echo("startvalue: "+startvalue);
        }
        else
        {
        //Keep updating the cache for the first two times 
            expvalue = startvalue;
        }
        startvalue++;
    }
}

TestCacheAtWrite(0); 

// Test a loop nest with a cycle of assignments.
function testcycle(){
  var obj0 = {};
  var obj1 = {};
  var ary = new Array(10);
  var ui16 = new Uint16Array(256);
  var c = 1;
  obj1.length >>>=1;
  var __loopvar4 = 0;
  while(((obj1.prop0 &= (c %= 1))) && __loopvar4 < 3) {
    __loopvar4++;
  }
  for(var __loopvar1 = 0; __loopvar1 < 3; __loopvar1++) {
    b =c;
    var __loopvar2 = 0;
    for(var strvar0 in ui16 ) {
      if(__loopvar2++ > 3) break;
      d =b;
      ary[(15)] = (b-- );
      obj0.prop0 =(obj1.length++ );
      c =d;
    }
  }
  WScript.Echo("d = " + (d|0));
};

testcycle();

function testcycle2(){
  var obj0 = {};
  var obj1 = {};
  var func0 = function(p0){
    obj0.prop0;
  }
  obj1.method0 = func0;
  var obj3 = obj0;
  var i = 0;
  while(i < 3) {
    i++;
    obj0 = obj3;
    obj3 = obj1;
  }
  obj0.method0()
};

// generate profile
testcycle2();

// run JITted code
testcycle2();

var func3 = function () {
  return func3.caller;
}

function v9() {
  return func3();
}
function v14() {
  func3(1);
  var v15 = v9();
  WScript.Echo(v15);
}
v14();
v14();

