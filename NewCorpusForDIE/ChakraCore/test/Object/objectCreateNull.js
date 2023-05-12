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

if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
  this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
  {
    name : "NullTypeHandler basic functionality and sanity checks",
    body : function() {
      var objects = [
                     Object.create({}),
                     new Boolean(),
                     Object.create(Promise.prototype),
                     Function(""),
                     new Number(),
                     new String()
                     ];
      
      for (var i = 1; i < objects.length; ++i) {
        var o = objects[i];

        assert.areEqual(undefined, o[0], "NullTypeHandler object with no properties returns undefined");
        assert.isFalse(o.hasOwnProperty('0'), "NullTypeHandler object with no properties returns false for hasOwnProperty");
        assert.isFalse(o.propertyIsEnumerable('0'), "NullTypeHandler object with no properties returns false for propertyIsEnumerable");
        
        for (var a in o) {
          assert.fail("Enumerating an empty object"); // Unreachable
        }

        o[0] = "str";

        assert.areEqual("str", o[0], "NullTypeHandler object with index property returns property correctly");
        assert.areEqual("str", o['0'], "NullTypeHandler object with index property returns property correctly");
        assert.isTrue(o.hasOwnProperty('0'), "NullTypeHandler object with index property returns true for hasOwnProperty");
        assert.isTrue(o.propertyIsEnumerable('0'), "NullTypeHandler object with index property returns true for propertyIsEnumerable");
  
        delete o[0];

        assert.areEqual(undefined, o[0], "NullTypeHandler objectwith deleted property returns undefined");
        assert.areEqual(undefined, o['0'], "NullTypeHandler objectwith deleted property returns undefined");
        assert.isFalse(o.hasOwnProperty('0'), "NullTypeHandler object with deleted property returns false for hasOwnProperty");
        assert.isFalse(o.propertyIsEnumerable('0'), "NullTypeHandler object with deleted property returns false for propertyIsEnumerable");
        
        for (var a in o) {
          assert.fail("Enumerating an empty object"); // Unreachable
        }

        o[0] = "str2";

        assert.areEqual("str2", o[0], "NullTypeHandler object with readded index property returns property correctly");
        assert.areEqual("str2", o['0'], "NullTypeHandler object with readded index property returns property correctly");
        assert.isTrue(o.hasOwnProperty('0'), "NullTypeHandler object with readded index property returns true for hasOwnProperty");
        assert.isTrue(o.propertyIsEnumerable('0'), "NullTypeHandler object readded with index property returns true for propertyIsEnumerable");
    }
    }
  },
  {
    name: "NullTypeHandler enumeration",
    body: function () {
      var obj1 = Object.create({});
      var obj2 = Object.create(null);
      var numProperties = 3;

      
      for (var i = 0; i < numProperties; ++i)
      {
        obj1[i] = i;
        assert.areEqual(obj1[i], i, "NullTypeHandler first enumeration object with index " + i + " equal to " + i);
        assert.isTrue(obj1.hasOwnProperty(i), "NullTypeHandler first enumeration object with index " + i + " returns true for hasOwnProperty");
        assert.isTrue(obj1.propertyIsEnumerable(i), "NullTypeHandler object first enumeration with index " + i + " returns true for propertyIsEnumerable");

        obj2[i] = i;
        assert.areEqual(obj2[i], i, "NullTypeHandler second enumeration object with index " + i + " equal to " + i);
        assert.isTrue(Object.prototype.hasOwnProperty.call(obj2, i), "NullTypeHandler first enumeration object with index " + i + " returns true for hasOwnProperty");
        assert.isTrue(Object.prototype.propertyIsEnumerable.call(obj2, i), "NullTypeHandler object first enumeration with index " + i + " returns true for propertyIsEnumerable");
      }

      var j = 0;
      for (var k in obj1)
      {
        ++j;
      }
      assert.areEqual(j, numProperties, "NullTypeHandler first enumeration object gives same number of properties");

      j = 0;
      for (var k in obj2)
      {
        ++j;
      }
      assert.areEqual(j, numProperties, "NullTypeHandler second enumeration object gives same number of properties");
    }
  }
];

testRunner.runTests(tests, { verbose : WScript.Arguments[0] != "summary" });