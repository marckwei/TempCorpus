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

function test0(){
  var d = 1;
  var __loopvar0 = 0;
  do {
    __loopvar0++;
    if((this.prop0 <= d)) {
      var __loopvar3 = 0;
      do {
        __loopvar3++;
1        // Snippet switch1
        switch(Object.keys(arrObj0).length){
          case 1:
            GiantPrintArray.push(1);
            break;
          case 2:
            GiantPrintArray.push(2);
            break;
          case 3:
            GiantPrintArray.push(3);
            break;
          case 4:
            
            GiantPrintArray.push(4);
          case arrObj0:
            GiantPrintArray.push(arrObj0);
          case 5:
            d *=1;
            GiantPrintArray.push(5);
            break;
          case 6:
            GiantPrintArray.push(6);
            break;
          case 7:
            GiantPrintArray.push(7);
          case 8:
            
            GiantPrintArray.push(8);
            break;
          default:
            GiantPrintArray.push("Default");
            break;
        }    
      } while(((d = 1)) && __loopvar3 < 3)
      d ^=IntArr1[(1)];

      for (var _i in arguments[1]) { 
        d =2.62877767046713E+18;
      };
    }
  } while((1) && __loopvar0 < 3)
};

// generate profile
test0(); 
test0(); 
// Run Simple JIT
test0(); 
test0(); 
test0(); 
test0(); 
test0(); 

// run JITted code
runningJITtedCode = true;
test0(); 
test0(); 

// run code with bailouts enabled
shouldBailout = true;
test0(); 
WScript.Echo("PASSED");
