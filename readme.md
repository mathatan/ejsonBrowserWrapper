#Deep clone & merge

JSDeepClone is a simple library for deep cloning and merging JS variables. 

It has two main methods `clone` and `merge` which will respectively either clone or merge the variables.
With merge there are some special cases, e.g. Arrays in which case the original array will be looped through index by index
and existing values will be overwritten by new ones. It should be trivial to extend this functionality to support
either full replacement or alterantively concatenation. If you need such functionality let me know and I'll implement it.

It should be noted that JSDeepClone will try to maintain instance types, e.g. ArrayBuffers, but ofc there might not be
support for everything nor has it been really tested that much.

Hope you have some use for this little lib. Cheers!



##Example for merge

Usage is fairly simple. Either use AMD or CommonJS to include the library and use the provided methods.

```
// MergeExample.js

const deep = require('JSDeepClone');

const foo = {
    bar : {
        foobar : 1
    }
};

const bar = {
    bar : {
        barfoo : 2
    }
};

const foobar = deep.merge(foo, bar);

```

###Expected results:

```
foobar === {
    bar : {
        foobar : 1,
        barfoo : 2
    }
};

```


##Example for clone 

Usage is fairly simple. Either use AMD or CommonJS to include the library and use the provided methods.

```
// MergeExample.js

const deep = require('JSDeepClone');

const foo = {
    bar : {
        foobar : 1
    }
};

const bar = deep.clone(foo);

bar.bar.foobar = 2;

```



###Expected results:

```
foo === {
    bar : {
        foobar : 1
    }
}

bar === {
    bar : {
        foobar : 2
    }
}
```


##API Details

Both clone and deep have some extended functionality for more specific usecases.

###merge(target, source, [staticMerge = false, objectMap, proto = false, shadow = false])

Parameters:

* target - Target object for merge. (new object will initialized for mergin, but when conflicted keys are available source will be used)
* source - Source object from which to merge
* staticMerge - Merge setters/getters as static variables
* objectMap - Convert `custom type`->`primary type`. There is no custom object support as of now, but you can specify conversion from instances to objecs or arrays.
* proto - Enumerate prototype keys. Useful for custom instances and getters when converting to an object
* shadow - Also enumerate keys which are marked `enumerate: false`

###clone(source, [staticClone = true, objectMap, proto = false, shadow = false])

Parameters

* source - Source object which to clone
* staticClone - Clone setters/getters as static variables
* objectMap - Convert `custom type`->`primary type`. E.g. `{ 'MyFancyType': 'Object' }` There is no custom object support as of now, but you can specify conversion from instances to objecs or arrays.
* proto - Enumerate prototype keys. Useful for custom instances and getters when converting to an object
* shadow - Also enumerate keys which are marked `enumerate: false`
