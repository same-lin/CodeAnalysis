/*! For license information please see codeAnalysis.js.LICENSE.txt */
            const ${"_superIndex"} = name => super[name];`},kE={name:"typescript:advanced-async-super",scoped:!0,text:Ww`
            const ${"_superIndex"} = (function (geti, seti) {
                const cache = Object.create(null);
                return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });