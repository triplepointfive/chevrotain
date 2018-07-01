"use strict"

const Benchmark = require("benchmark")
const fs = require("fs")
const path = require("path")
const chevLessParse = require("../less").parseLess

const sample = fs
    .readFileSync(path.join(__dirname, "./samples/10k.css"), "utf8")
    .toString()

function newSuite(name) {
    return new Benchmark.Suite(name, {
        onStart: () => console.log(`\n\n${name}`),
        onCycle: event => console.log(String(event.target)),
        onComplete: function() {
            console.log("Fastest is " + this.filter("fastest").map("name"))
        }
    })
}

function parseLessChevrotain(text) {
    const parseResult = chevLessParse(sample)
    if (
        parseResult.lexErrors.length > 0 ||
        parseResult.parseErrors.length > 0
    ) {
        throw "Oops I did it again"
    }
}

// no comparisons here yet, this is meant to detect regressions.
newSuite("10k pure CSS input")
    .add("Chevrotain LESS", () => parseLessChevrotain(sample))
    .run({
        async: false
    })
