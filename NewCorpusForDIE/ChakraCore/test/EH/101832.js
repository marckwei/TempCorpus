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
function test0(){
  var obj0 = {};
  var a = 1;
  var d = 1;
  function func7 (argMath21){
    (function(){
    'use strict';;
      var v3291 = "I am global";
      var res;
      try {
          throw "I am not global"
      }catch(v3291){
             function foo(){return v3291;}
             res = foo();
           (function(argMath25){
            argMath21 =(-- argMath25);
          })(obj0.length);
           res = foo();
      }
      GiantPrintArray.push(res);
      
      
    })();
    function __objtypespecfoobar()
    {  
      obj0.v3293 = argMath21;
      for(var i in obj0)
      {
        GiantPrintArray.push(i + ":" + obj0[i]);
      }
      
    }
    __objtypespecfoobar();
    __objtypespecfoobar();
  }
  obj0[_strvar0] = 1; 
  var __loopvar4 = 0;
  for(var _strvar0 in obj0 ) {
    if(_strvar0.indexOf('method') != -1) continue;
    if(__loopvar4++ > 3) break;
    obj0[_strvar0] = func7(-- a); 
  }
  for(var i =0;i<GiantPrintArray.length;i++){ 
    WScript.Echo(GiantPrintArray[i]); 
  };
};

test0(); 
test0(); 
test0(); 
test0(); 
test0(); 
