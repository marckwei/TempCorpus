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

function test0(addOrSub) {
  function makeArrayLength() {
  }
  var obj0 = {};
  var obj1 = {};
  var protoObj1 = {};
  var arrObj0 = {};

  var func4 = function () {
    return arrObj0 * (f > obj1.prop1 ? h++ : Function());
  };
  
  var f = 1;
  var h = 0;
  obj1.prop1 = -1;
  switch(addOrSub)
  {
    case 1:
      f /= ((1 - 1) * -1) - -(func4.call(arrObj0) << (typeof arrObj0.length == null));
      break;

    case 2:
      f /= ((1 - 1) * -1) + -(func4.call(arrObj0) << (typeof arrObj0.length == null));
      break;
  }
  
  func4();
  
  print(h);
}
test0(1);
test0(2);

test0(1);
test0(2);