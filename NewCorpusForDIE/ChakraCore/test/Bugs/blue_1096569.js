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

var shouldBailout = false;
var print = function(){return this};
var x = function(){return this};
var obj = {};
/*@cc_on @*/

a=10;
function test3(){

(function(){/*sStart*/;try{try{with({}) { try{throw StopIteration;}catch(e){} } }catch(e){}try{delete w.z;}catch(e){}}catch(e){};;/*sEnd*/})();
(function(){/*sStart*/;if(shouldBailout){undefined--}/*sEnd*/})();
(function(){/*sStart*/;"use strict"; /*tLoop*/for (let amspyz in [null, null, new Number(1)]) { if(!shouldBailout){function shapeyConstructor(jcmmhu){this.y = "udb6fudff4";if ( "" ) for (var ytqsfigbn in this) { }return this; }; shapeyConstructor(a);}; };;/*sEnd*/})();

};

//Profile
test3();
test3();

//Bailout
shouldBailout = true;
test3();

WScript.Echo("Success");
