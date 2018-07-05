const path = require("path")
const fs = require("fs")

const { LessParser } = require("./less2")

const parser = new LessParser([])

const serializedGrammarText = JSON.stringify(
    parser.getSerializedGastProductions(),
    null,
    "\t"
)

fs.writeFileSync(
    path.join(__dirname, "generated_serialized_grammar.js"),
    `
const serializedGrammar = ${serializedGrammarText}`
)
