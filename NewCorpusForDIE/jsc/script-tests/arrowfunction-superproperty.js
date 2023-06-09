function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
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

description('Tests for ES6 arrow function, access to the super property in arrow function');

var expectedValue = 'test-value';

class A {
    getValue () {
        return expectedValue;
    }
};

class B extends A {
    getValueParentFunction() {
        var arrow  = () => super.getValue();
        return arrow();
    }
};

class C extends B {
    constructor(beforeSuper) {
        let _value;
        let arrow = () => super.getValue();
        if (beforeSuper) {
            _value = arrow();
            super();
        } else {
            super();
            _value = arrow();
        }
        this.value = _value;
    }
};

class D {
    constructor() {
        this.value = expectedValue;
    }
    static getStaticValue() {
        return expectedValue;
    }
};

class E extends D {
    static getParentStaticValue() {
        var arrow  = () => super.getStaticValue();
        return arrow();
    }
};

class F extends A {
    constructor() {
        super();
        this.value = expectedValue;
    }
    get prop() {
        var arrow = () => super.getValue()+ '-' + this.value;
        return arrow();
    }
    set prop(value) {
        var arrow = (newVal) => this.value = newVal;
        arrow(value);
    }
    getParentValue() {
        let arrow = () => () => super.getValue();
        return arrow()();
    }
    *genGetParentValue() {
        let arr = () => super.getValue();
        yield arr();
    }
    *genGetParentValueDeepArrow() {
        let arr = () => () => () => super.getValue();
        yield arr()()();
    }
 };

shouldBe('(new B()).getValueParentFunction()', 'expectedValue');

shouldBe('(new C(false)).value', 'expectedValue');

shouldThrow('(new C(true))', `"ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object."`);

shouldBe('E.getParentStaticValue()', 'expectedValue');

var f = new F();

shouldBe('f.prop', 'expectedValue + "-" + expectedValue');

f.prop = 'new-value';
shouldBe('f.prop', 'expectedValue + "-" + "new-value"');

shouldBe('(new F()).getParentValue()', 'expectedValue');

shouldBe('(new F()).genGetParentValue().next().value', 'expectedValue');
shouldBe('(new F()).genGetParentValueDeepArrow().next().value', 'expectedValue');
shouldBe('(new class extends A { constructor() { ((a = super(), b = super.getValue())=>{ this.id = b; })() } }).id', 'expectedValue');
var expectedNewTarget;
shouldBe('(new class extends A { constructor() { ((a = super(), b = new.target)=>{ this.newTarget = b; })(); expectedNewTarget = new.target;} }).newTarget', 'expectedNewTarget');
shouldThrow('(new class extends A { constructor() { ((a = super.getValue())=>{ this.id = a; })() } })', `"ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object."`);
shouldThrow('(new class extends A { constructor() { ((a = super.getValue(), b=super())=>{ this.id = a; })() } })', `"ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object."`);
shouldThrow('(new class extends F { constructor() { ((a = super.prop)=>{ return a; })() } })', `"ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object."`);
shouldThrow('(new class extends F { constructor() { ((a = super.prop, b=super())=>{ return a; })() } })', `"ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object."`);
shouldThrow('(new class extends F { constructor() { ((a = (super.prop = "value"))=>{ this.id = a; })() } })', `"ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object."`);
shouldThrow('(new class extends F { constructor() { ((a = (super.prop = "value"), b=super())=>{ this.id = a; })() } })', `"ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object."`);
shouldThrow('(new class extends F { constructor() { ((a = super.genGetParentValue().next().value)=>{ this.id = a; })() } })', `"ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object."`);
shouldThrow('(new class extends F { constructor() { ((a = super.genGetParentValue().next().value, b=super())=>{ this.id = a; })() } })', `"ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object."`);

var successfullyParsed = true;
