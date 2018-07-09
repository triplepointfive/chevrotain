/**
 * references:
 * https://github.com/antlr/grammars-v4/blob/master/css3/css3.g4
 * https://www.lifewire.com/css2-vs-css3-3466978
 */

const {
    Parser,
    Lexer,
    createToken: orgCreateToken,
    EMPTY_ALT
} = require("chevrotain")
const XRegExp = require("xregexp")

const fragments = {}
function FRAGMENT(name, def) {
    fragments[name] = XRegExp.build(def, fragments)
}

FRAGMENT("spaces", "[ \\t\\r\\n\\f]+")
FRAGMENT("h", "[0-9a-f]")
FRAGMENT("unicode", "{{h}}{1,6}")
FRAGMENT("escape", "{{unicode}}|\\\\[^\\r\\n\\f0-9a-f]")
FRAGMENT("nl", "\\n|\\r|\\f")
FRAGMENT("string1", '\\"([^\\n\\r\\f\\"]|{{nl}}|{{escape}})*\\"')
FRAGMENT("string2", "\\'([^\\n\\r\\f\\']|{{nl}}|{{escape}})*\\'")
FRAGMENT("nonascii", "[\\u0240-\\uffff]")
FRAGMENT("nmstart", "[_a-zA-Z]|{{nonascii}}|{{escape}}")
FRAGMENT("nmchar", "[_a-zA-Z0-9-]|{{nonascii}}|{{escape}}")
FRAGMENT("name", "({{nmchar}})+")
FRAGMENT("ident", "-?{{nmstart}}{{nmchar}}*")

function MAKE_PATTERN(def, flags) {
    return XRegExp.build(def, fragments, flags)
}

// A Little wrapper to save us the trouble of manually building the
// array of cssTokens
const lessTokens = []
const createToken = function() {
    const newToken = orgCreateToken.apply(null, arguments)
    lessTokens.push(newToken)
    return newToken
}

const Whitespace = createToken({
    name: "Whitespace",
    pattern: MAKE_PATTERN("{{spaces}}"),
    // The W3C specs are are defined in a whitespace sensitive manner.
    // But there is only **one** place where the grammar is truly whitespace sensitive.
    // So the whitespace sensitivity was implemented via a GATE in the selector rule.
    group: Lexer.SKIPPED
})

const Comment = createToken({
    name: "Comment",
    pattern: /\/\*[^*]*\*+([^/*][^*]*\*+})*\//,
    group: Lexer.SKIPPED
})

const VariableCall = createToken({
    name: "VariableCall",
    pattern: /@[\w-]+\(\s*\)/
})

const PropertyVariable = createToken({
    name: "PropertyVariable",
    pattern: /\$[\w-]+/
})

const NestedPropertyVariable = createToken({
    name: "NestedPropertyVariable",
    pattern: /\$@[\w-]+/
})

// must be after VariableCall
const VariableName = createToken({
    name: "VariableName",
    pattern: /@[\w-]+/
})

const NestedVariableName = createToken({
    name: "NestedVariableName",
    pattern: /@@[\w-]+/
})

const StringLiteral = createToken({
    name: "StringLiteral",
    pattern: MAKE_PATTERN("{{string1}}|{{string2}}")
})
// TODO: not sure this token is needed
// const Ampersand = createToken({ name: "Ampersand", pattern: "&" })
const AtExtend = createToken({ name: "AtExtend", pattern: "&:extend(" })
const Star = createToken({ name: "Star", pattern: "*" })
const Equals = createToken({ name: "Equals", pattern: "=" })
const Includes = createToken({ name: "Includes", pattern: "~=" })
const Dasmatch = createToken({ name: "Dasmatch", pattern: "|=" })
const BeginMatchExactly = createToken({
    name: "BeginMatchExactly",
    pattern: "^="
})
const EndMatchExactly = createToken({ name: "EndMatchExactly", pattern: "$=" })
const ContainsMatch = createToken({ name: "ContainsMatch", pattern: "*=" })

const ImportantSym = createToken({
    name: "ImportantSym",
    pattern: /!important/i
})

const When = createToken({
    name: "When",
    pattern: /when/
})

// must must appear before Ident due to common prefix
const Func = createToken({
    name: "Func",
    pattern: MAKE_PATTERN("{{ident}}\\(")
})

// Ident must be before Minus
const Ident = createToken({
    name: "Ident",
    pattern: MAKE_PATTERN("{{ident}}")
})
// TODO: keywords vs identifiers
// TODO: would LParen conflict with other tokens that include LParen?
const LParen = createToken({ name: "LParen", pattern: "(" })
const RParen = createToken({ name: "RParen", pattern: ")" })
const SemiColon = createToken({ name: "SemiColon", pattern: ";" })
const Percentage = createToken({
    name: "Percentage",
    pattern: /(?:\d+\.\d+|\d+)%/
})
const LSquare = createToken({ name: "LSquare", pattern: "[" })
const RSquare = createToken({ name: "RSquare", pattern: "]" })

const Plus = createToken({ name: "Plus", pattern: "+" })
const GreaterThan = createToken({ name: "GreaterThan", pattern: ">" })
const Tilde = createToken({ name: "Tilde", pattern: "~" })
const Hash = createToken({
    name: "Hash",
    pattern: MAKE_PATTERN("#{{name}}")
})
const Dot = createToken({ name: "Dot", pattern: "." })
const Comma = createToken({ name: "Comma", pattern: "," })
const Colon = createToken({ name: "Colon", pattern: ":" })
const LCurly = createToken({ name: "LCurly", pattern: "{" })
const RCurly = createToken({ name: "RCurly", pattern: "}" })

const LessLexer = new Lexer(lessTokens)

// ----------------- parser -----------------

class LessParser extends Parser {
    constructor(input) {
        super(input, lessTokens, {
            ignoredIssues: {
                selector: { OR: true }
            }
        })

        const $ = this

        $.RULE("primary", () => {
            $.MANY(() => {
                $.OR2([
                    { ALT: () => $.SUBRULE($.extendRule) },
                    { ALT: () => $.SUBRULE($.variableCall) },
                    // { ALT: () => $.SUBRULE($.declaration) },
                    // { ALT: () => $.SUBRULE($.entitiesCall) },
                    // { ALT: () => $.SUBRULE($.atrule) }

                    // this combines mixincall, mixinDefinition and rule set
                    // because of common prefix
                    { ALT: () => $.SUBRULE($.rulesetOrMixin) }
                ])
            })
        })

        // The original extend had two variants "extend" and "extendRule"
        // implemented in the same function, we will have two separate functions
        // for readability and clarity.
        $.RULE("extendRule", () => {
            $.CONSUME(AtExtend)
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => {
                    // TODO: a GATE is needed here because the following All
                    $.SUBRULE($.selector)

                    // TODO: this probably has to be post processed
                    // because "ALL" may be a normal ending part of a selector
                    // $.OPTION(() => {
                    //     $.CONSUME(All)
                    // })
                }
            })
            $.CONSUME(RParen)
            $.CONSUME(SemiColon)
        })

        $.RULE("declaration", () => {
            // TODO: TBD
        })

        $.RULE("rulesetOrMixin", () => {
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => {
                    $.SUBRULE($.selector)
                }
            })

            $.OR([
                {
                    // args indicate a mixin call or definition
                    ALT: () => {
                        // TODO: variable argument list syntax inside args indicates a definition
                        $.SUBRULE($.args)
                        $.OR2([
                            {
                                // a guard or block indicates a mixin definition
                                ALT: () => {
                                    $.OPTION(() => {
                                        $.SUBRULE($.guard)
                                    })
                                    $.SUBRULE($.block)
                                }
                            },

                            // can there also be a lookup ("") here?
                            // a SemiColon or "!important" indicates a mixin call
                            {
                                ALT: () => {
                                    $.OPTION2(() => {
                                        $.CONSUME(ImportantSym)
                                    })
                                    $.CONSUME(SemiColon)
                                }
                            }
                        ])
                    }
                },
                {
                    // Block indicates a ruleset
                    ALT: () => {
                        $.SUBRULE2($.block)
                    }
                }
            ])
        })

        $.RULE("variableCall", () => {
            $.OR([
                { ALT: () => $.CONSUME(VariableCall) },
                { ALT: () => $.CONSUME(VariableName) }
            ])

            $.OPTION(() => {
                $.SUBRULE($.mixinRuleLookup)
            })

            $.OPTION2(() => {
                $.CONSUME(ImportantSym)
            })
        })

        $.RULE("entitiesCall", () => {
            // TODO: TBD
        })

        $.RULE("atrule", () => {
            // TODO: TBD
        })

        // TODO: misaligned with CSS: Missing case insensitive attribute flag
        // https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
        $.RULE("attrib", () => {
            $.CONSUME(LSquare)
            $.CONSUME(Ident)

            this.OPTION(() => {
                $.OR([
                    { ALT: () => $.CONSUME(Equals) },
                    { ALT: () => $.CONSUME(Includes) },
                    { ALT: () => $.CONSUME(Dasmatch) },
                    { ALT: () => $.CONSUME(BeginMatchExactly) },
                    { ALT: () => $.CONSUME(EndMatchExactly) },
                    { ALT: () => $.CONSUME(ContainsMatch) }
                ])

                // REVIEW: misaligned with LESS: LESS allowed % number here, but
                // that is not valid CSS
                $.OR2([
                    { ALT: () => $.CONSUME2(Ident) },
                    { ALT: () => $.CONSUME(StringLiteral) }
                ])
            })
            $.CONSUME(RSquare)
        })

        $.RULE("variableCurly", () => {
            // TODO: TBD
        })

        $.RULE("selector", () => {
            $.SUBRULE($.simple_selector)
            $.OPTION(() => {
                $.OR([
                    {
                        GATE: () => {
                            const prevToken = $.LA(0)
                            const nextToken = $.LA(1)
                            //  This is the only place in CSS where the grammar is whitespace sensitive.
                            return nextToken.startOffset > prevToken.endOffset
                        },
                        ALT: () => {
                            $.OPTION2(() => {
                                $.SUBRULE($.combinator)
                            })
                            $.SUBRULE($.selector)
                        }
                    },
                    {
                        ALT: () => {
                            $.SUBRULE2($.combinator)
                            $.SUBRULE2($.selector)
                        }
                    }
                ])
            })
        })

        // TODO: 'variableCurly' can appear here?
        this.RULE("simple_selector", () => {
            $.OR([
                {
                    ALT: () => {
                        $.SUBRULE($.element_name)
                        $.MANY(() => {
                            $.SUBRULE($.simple_selector_suffix)
                        })
                    }
                },
                {
                    ALT: () => {
                        $.AT_LEAST_ONE(() => {
                            $.SUBRULE2($.simple_selector_suffix)
                        })
                    }
                }
            ])
        })

        this.RULE("combinator", () => {
            $.OR([
                { ALT: () => $.CONSUME(Plus) },
                { ALT: () => $.CONSUME(GreaterThan) },
                { ALT: () => $.CONSUME(Tilde) }
            ])
        })

        // helper grammar rule to avoid repetition
        // [ HASH | class | attrib | pseudo ]+
        $.RULE("simple_selector_suffix", () => {
            $.OR([
                { ALT: () => $.CONSUME(Hash) },
                { ALT: () => $.SUBRULE($.class) },
                { ALT: () => $.SUBRULE($.attrib) },
                { ALT: () => $.SUBRULE($.pseudo) }
            ])
        })

        // '.' IDENT
        $.RULE("class", () => {
            $.CONSUME(Dot)
            $.CONSUME(Ident)
        })

        // IDENT | '*'
        $.RULE("element_name", () => {
            $.OR([
                { ALT: () => $.CONSUME(Ident) },
                { ALT: () => $.CONSUME(Star) }
            ])
        })

        // ':' [ IDENT | FUNCTION S* [IDENT S*]? ')' ]
        $.RULE("pseudo", () => {
            $.CONSUME(Colon)

            $.OR([
                { ALT: () => $.CONSUME(Ident) },
                {
                    ALT: () => {
                        $.CONSUME(Func)
                        $.OPTION(() => {
                            $.CONSUME2(Ident)
                        })
                        $.CONSUME(RParen)
                    }
                }
            ])
        })

        $.RULE("block", () => {
            $.CONSUME(LCurly)
            $.SUBRULE($.primary)
            $.CONSUME(RCurly)
        })

        $.RULE("mixinRuleLookup", () => {
            $.CONSUME(LSquare)
            $.AT_LEAST_ONE(() => {
                $.SUBRULE($.lookupValue)
            })

            $.CONSUME(RSquare)
        })

        $.RULE("lookupValue", () => {
            $.OR([
                { ALT: () => $.CONSUME(Ident) },
                { ALT: () => $.CONSUME(VariableName) },
                { ALT: () => $.CONSUME(NestedVariableName) },
                { ALT: () => $.CONSUME(PropertyVariable) },
                { ALT: () => $.CONSUME(NestedPropertyVariable) },
                { ALT: () => EMPTY_ALT }
            ])
        })

        $.RULE("args", () => {
            $.CONSUME(LParen)
            $.CONSUME(RParen)
            // TODO: TBD
        })

        $.RULE("guard", () => {
            $.CONSUME(When)
            // TODO: TBD
        })

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
        const value = parser.primary()

        return {
            // This is a pure grammar, the value will be undefined until we add embedded actions
            // or enable automatic CST creation.
            value: value,
            lexErrors: lexResult.errors,
            parseErrors: parser.errors
        }
    }
}
