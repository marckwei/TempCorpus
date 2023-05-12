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

 (function() {
              spc    = /^\s$/,
              range  = 0xFFFF;

          var fillZero = (function() {
              var tmp = [];
              return function(num, n) {
                  var nnum;
                  num += "";
                  if (num.length < n) {
                      if (!tmp[n]) {
                          z = tmp[n] = new Array(n).join('0');
                      } else {
                          z = tmp[n];
                      }
                      num  = z + num;
                      nnum = num.length
                      num  = num.substring(nnum-n, nnum);
                  }
                  return num;
              };
          })();

      WScript.Echo("start");

          for (r = 0x00; r < range; r++) {
              if (spc.test(String.fromCharCode(r))) {
                  WScript.Echo('\\u'+fillZero(r.toString(16), 4));
              }
          }
      })();
