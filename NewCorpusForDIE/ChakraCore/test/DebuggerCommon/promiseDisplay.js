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

p1 = new Promise(
    function (resolve, reject) {
    WScript.SetTimeout(
      function () {
      p1.someOtherProp = "in fullfil";
      resolve("p1 resolved");
      /**bp:evaluate('p1', 2);**/
    }, 1000);
  });
  
p1.someOtherProp = "before";

p1;
/**bp:evaluate('p1', 2);**/

p1.then(
  function (val) {
  p1.someOtherProp = "in then";
  var x = val;
  /**bp:evaluate('p1', 2);**/
})
.catch (
  function (reason) {
  p1.someOtherProp = "in catch";
  var x = reason;
  /**bp:evaluate('p1', 2);**/
});

p2 = new Promise(function (resolve, reject) {
    WScript.SetTimeout(function () {
      resolve(null);
      /**bp:evaluate('p2', 2);**/
    }, 2000);
  });

p3 = new Promise(function (resolve, reject) {
    WScript.SetTimeout(function () {
      reject(["p3", "rejected"]);
      /**bp:evaluate('p3', 2);**/
    }, 3000);
  });

Promise.all([p2, p3]).then(function (value) {
  var x = 1;
  /**bp:evaluate('p1', 2);**/
  x;
  /**bp:evaluate('p2', 2);**/
  x;
  /**bp:evaluate('p3', 2);**/
}, function (reason) {
  var x = 1;
  /**bp:evaluate('p1', 2);**/
  x;
  /**bp:evaluate('p2', 2);**/
  x;
  /**bp:evaluate('p3', 2);**/
});

WScript.Echo("pass");