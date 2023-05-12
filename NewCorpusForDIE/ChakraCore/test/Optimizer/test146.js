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
    var obj1 = {};
    var func0 = function (argMath0 = {
      prop7: {
        prop0: ary.pop() >> (typeof protoObj1.prop1 == 'undefined'),
        prop1: typeof protoObj1.prop1 == 'undefined',
        prop2: 314342286 >= 314342286 || obj0.prop0 == obj1.prop0,
        prop3: obj0.length,
        prop4: 138434197,
        prop5: leaf.call(protoObj0),
        prop6: (obj0.prop0 %= typeof ((2147483647 ^= leaf.call(obj0) ? protoObj0.length >> h : uic8[186 & 255]) ? typeof g == 'boolean' : (i32[132 & 255] * (typeof g == 'boolean') + {
          prop2: 32061261727923600 instanceof (typeof Error == 'function' ? Error : Object),
          prop1: ary[(-47093207 >= 0 ? -47093207 : 0) & 15],
          prop0: new Object() instanceof (typeof EvalError == 'function' ? EvalError : Object)
        } ? -1200911084.9 : leaf.call(obj1)) * (new leaf().prop1 - (ui32[-887632913.9 * (-152266440 + arrObj0.prop0) * (obj0.length - 314342286) + func0.caller & 255] - -710991759))) == 'undefined') ? ary.pop() : typeof protoObj0.prop1 != 'number' | 4294967297,
        prop7: leaf.call(litObj1)
      },
      prop6: (obj0.prop0 %= typeof ((2147483647 ^= leaf.call(obj0) ? protoObj0.length >> h : uic8[186 & 255]) ? typeof g == 'boolean' : (i32[132 & 255] * (typeof g == 'boolean') + {
        prop2: 32061261727923600 instanceof (typeof Error == 'function' ? Error : Object),
        prop1: ary[(-47093207 >= 0 ? -47093207 : 0) & 15],
        prop0: new Object() instanceof (typeof EvalError == 'function' ? EvalError : Object)
      } ? -1200911084.9 : leaf.call(obj1)) * (new leaf().prop1 - (ui32[-887632913.9 * (-152266440 + arrObj0.prop0) * (obj0.length - 314342286) + func0.caller & 255] - -710991759))) == 'undefined') ? ary.pop() : typeof protoObj0.prop1 != 'number' | 4294967297,
      prop5: g !== protoObj0.length || this.prop1 === arrObj0.prop1,
      prop4: (2147483647 ^= leaf.call(obj0) ? protoObj0.length >> h : uic8[186 & 255]) ? typeof g == 'boolean' : (i32[132 & 255] * (typeof g == 'boolean') + {
        prop2: 32061261727923600 instanceof (typeof Error == 'function' ? Error : Object),
        prop1: ary[(-47093207 >= 0 ? -47093207 : 0) & 15],
        prop0: new Object() instanceof (typeof EvalError == 'function' ? EvalError : Object)
      } ? -1200911084.9 : leaf.call(obj1)) * (new leaf().prop1 - (ui32[-887632913.9 * (-152266440 + arrObj0.prop0) * (obj0.length - 314342286) + func0.caller & 255] - -710991759)),
      prop3: obj1.prop1 = ary.push(i8[func0.caller & 255], func0.caller, -(typeof obj0.prop1 == 'object'), Math.acos(func0.caller), leaf.call(arrObj0) === leaf.call(obj0), 2147483647, ary.reverse() * (leaf.call(obj0) ? protoObj0.length >> h : uic8[186 & 255]) + -2147483648 || new Object() instanceof (typeof EvalError == 'function' ? EvalError : Object)),
      prop2: new RangeError() instanceof (typeof RegExp == 'function' ? RegExp : Object),
      prop1: new RangeError() instanceof (typeof RegExp == 'function' ? RegExp : Object),
      prop0: arrObj0.prop1 > protoObj0.prop0 && obj0.length < obj1.prop1}) 
    {
    };
    var id27 = 2147483647;
    for (var i =0;i<1000;i++) {
      if (obj1 >= 238436589.1) {
        makeArrayLength(ary(id27));
        while (+uic8[b != h & 255] - (id27 = obj1)) {
        }
      }
      obj1.prop0;
    }
}

test0();
print("passed")