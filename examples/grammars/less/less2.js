const { Parser, Lexer, createToken } = require("chevrotain")

const VariableCall = createToken({
    name: "VariableCall",
    pattern: /@[\w-]+\(\s*\)/
})

const AtExtend = createToken({ name: "AtExtend", pattern: "&:extend(" })
const All = createToken({ name: "All", pattern: "all" })
const RParen = createToken({ name: "RParen", pattern: ")" })
const SemiColon = createToken({ name: "SemiColon", pattern: ";" })

// TODO: fill this automatically
const allTokens = [VariableCall]

const LessLexer = new Lexer(allTokens)

// ----------------- parser -----------------

class LessParser extends Parser {
    constructor(input, config) {
        super(input, allTokens, config)

        const $ = this

        $.RULE("json", () => {
            $.OR([
                { ALT: () => $.SUBRULE($.extendRule) },
                { ALT: () => $.SUBRULE($.mixinDefinition) },
                { ALT: () => $.SUBRULE($.declaration) },
                { ALT: () => $.SUBRULE($.ruleset) },
                { ALT: () => $.SUBRULE($.mixinCall) },
                { ALT: () => $.SUBRULE($.variableCall) },
                { ALT: () => $.SUBRULE($.entitiesCall) },
                { ALT: () => $.SUBRULE($.atrule) }
            ])
        })

        $.RULE("extendRule", () => {
            $.CONSUME(AtExtend)
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => {
                    // TODO: a GATE is needed here because the following All
                    // is also a valid element
                    $.MANY(() => {
                        $.SUBRULE($.element)
                    })
                    $.OPTION(() => {
                        $.CONSUME(All)
                    })
                }
            })
            $.CONSUME(RParen)
            $.CONSUME(SemiColon)
        })

        $.RULE("mixinDefinition", () => {})

        $.RULE("declaration", () => {})

        $.RULE("ruleset", () => {})

        $.RULE("mixinCall", () => {})

        $.RULE("variableCall", () => {
            $.CONSUME(VariableCall)
        })

        $.RULE("entitiesCall", () => {})

        $.RULE("atrule", () => {})

        $.RULE("element", () => {})


        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        this.performSelfAnalysis()
    }
}

// ----------------- wrapping it all together -----------------

// reuse the same parser instance.
const parser = new LessParser([])

module.exports = {
    LessParser: LessParser,

    parse: function parse(text) {
        const lexResult = LessLexer.tokenize(text)
        // setting a new input will RESET the parser instance's state.
        parser.input = lexResult.tokens
        // any top level rule may be used as an entry point
        const value = parser.json()

        return {
            // This is a pure grammar, the value will be undefined until we add embedded actions
            // or enable automatic CST creation.
            value: value,
            lexErrors: lexResult.errors,
            parseErrors: parser.errors
        }
    }
}
