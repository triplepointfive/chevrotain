const XRegExp = require("xregexp")
const chevrotain = require("chevrotain")
const { Lexer, Parser } = chevrotain

// ----------------- lexer -----------------
// Based on the specs in:
// https://www.w3.org/TR/CSS21/grammar.html

// A little mini DSL for easier lexer definition using xRegExp.
const fragments = {}

function FRAGMENT(name, def) {
    fragments[name] = XRegExp.build(def, fragments)
}

function MAKE_PATTERN(def, flags) {
    return XRegExp.build(def, fragments, flags)
}

// ----------------- Lexer -----------------

// A Little wrapper to save us the trouble of manually building the
// array of cssTokens
const lessTokens = []
const createToken = function() {
    const newToken = chevrotain.createToken.apply(null, arguments)
    lessTokens.push(newToken)
    return newToken
}

// The order of fragments definitions is important
FRAGMENT("nl", "\\n|\\r|\\f")
FRAGMENT("h", "[0-9a-f]")
FRAGMENT("nonascii", "[\\u0240-\\uffff]")
FRAGMENT("unicode", "{{h}}{1,6}")
FRAGMENT("escape", "{{unicode}}|\\\\[^\\r\\n\\f0-9a-f]")
FRAGMENT("nmstart", "[_a-zA-Z]|{{nonascii}}|{{escape}}")
FRAGMENT("nmchar", "[_a-zA-Z0-9-]|{{nonascii}}|{{escape}}")
FRAGMENT("string1", '\\"([^\\n\\r\\f\\"]|{{nl}}|{{escape}})*\\"')
FRAGMENT("string2", "\\'([^\\n\\r\\f\\']|{{nl}}|{{escape}})*\\'")
FRAGMENT("comment", "\\/\\*[^*]*\\*+([^/*][^*]*\\*+)*\\/")
FRAGMENT("name", "({{nmchar}})+")
FRAGMENT("url", "([!#\\$%&*-~]|{{nonascii}}|{{escape}})*")
FRAGMENT("spaces", "[ \\t\\r\\n\\f]+")
FRAGMENT("ident", "-?{{nmstart}}{{nmchar}}*")
FRAGMENT("num", "[0-9]+|[0-9]*\\.[0-9]+")

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

// This group has to be defined BEFORE Ident as their prefix is a valid Ident
const Uri = createToken({ name: "Uri", pattern: Lexer.NA })
const UriString = createToken({
    name: "UriString",
    pattern: MAKE_PATTERN(
        "url\\((:?{{spaces}})?({{string1}}|{{string2}})(:?{{spaces}})?\\)"
    ),
    categories: Uri
})
const UriUrl = createToken({
    name: "UriUrl",
    pattern: MAKE_PATTERN("url\\((:?{{spaces}})?{{url}}(:?{{spaces}})?\\)"),
    categories: Uri
})
const Func = createToken({
    name: "Func",
    pattern: MAKE_PATTERN("{{ident}}\\(")
})

const Cdo = createToken({ name: "Cdo", pattern: "<!--" })
// Cdc must be before Minus
const Cdc = createToken({ name: "Cdc", pattern: "-->" })
const Includes = createToken({ name: "Includes", pattern: "~=" })
const Dasmatch = createToken({ name: "Dasmatch", pattern: "|=" })
const Exclamation = createToken({ name: "Exclamation", pattern: "!" })
const Dot = createToken({ name: "Dot", pattern: "." })
const LCurly = createToken({ name: "LCurly", pattern: "{" })
const RCurly = createToken({ name: "RCurly", pattern: "}" })
const LSquare = createToken({ name: "LSquare", pattern: "[" })
const RSquare = createToken({ name: "RSquare", pattern: "]" })
const LParen = createToken({ name: "LParen", pattern: "(" })
const RParen = createToken({ name: "RParen", pattern: ")" })
const Comma = createToken({ name: "Comma", pattern: "," })
const Colon = createToken({ name: "Colon", pattern: ":" })
const SemiColon = createToken({ name: "SemiColon", pattern: ";" })
const Equals = createToken({ name: "Equals", pattern: "=" })
const Star = createToken({ name: "Star", pattern: "*" })
const Plus = createToken({ name: "Plus", pattern: "+" })
const GreaterThan = createToken({ name: "GreaterThan", pattern: ">" })
const Slash = createToken({ name: "Slash", pattern: "/" })

const StringLiteral = createToken({
    name: "StringLiteral",
    pattern: MAKE_PATTERN("{{string1}}|{{string2}}")
})
const Hash = createToken({
    name: "Hash",
    pattern: MAKE_PATTERN("#{{name}}")
})

const ImportSym = createToken({
    name: "ImportSym",
    pattern: /@import/
})
const PageSym = createToken({ name: "PageSym", pattern: /@page/ })
const MediaSym = createToken({ name: "MediaSym", pattern: /@media/ })
const CharsetSym = createToken({
    name: "CharsetSym",
    pattern: /@charset/
})
const ImportantSym = createToken({
    name: "ImportantSym",
    pattern: /important/i
})

const Ems = createToken({
    name: "Ems",
    pattern: MAKE_PATTERN("{{num}}em", "i")
})
const Exs = createToken({
    name: "Exs",
    pattern: MAKE_PATTERN("{{num}}ex", "i")
})

const Length = createToken({ name: "Length", pattern: Lexer.NA })
const Px = createToken({
    name: "Px",
    pattern: MAKE_PATTERN("{{num}}px", "i"),
    categories: Length
})
const Cm = createToken({
    name: "Cm",
    pattern: MAKE_PATTERN("{{num}}cm", "i"),
    categories: Length
})
const Mm = createToken({
    name: "Mm",
    pattern: MAKE_PATTERN("{{num}}mm", "i"),
    categories: Length
})
const In = createToken({
    name: "In",
    pattern: MAKE_PATTERN("{{num}}in", "i"),
    categories: Length
})
const Pt = createToken({
    name: "Pt",
    pattern: MAKE_PATTERN("{{num}}pt", "i"),
    categories: Length
})
const Pc = createToken({
    name: "Pc",
    pattern: MAKE_PATTERN("{{num}}pc", "i"),
    categories: Length
})

const Angle = createToken({ name: "Angle", pattern: Lexer.NA })
const Deg = createToken({
    name: "Deg",
    pattern: MAKE_PATTERN("{{num}}deg", "i"),
    categories: Angle
})
const Rad = createToken({
    name: "Rad",
    pattern: MAKE_PATTERN("{{num}}rad", "i"),
    categories: Angle
})
const Grad = createToken({
    name: "Grad",
    pattern: MAKE_PATTERN("{{num}}grad", "i"),
    categories: Angle
})

const Time = createToken({ name: "Time", pattern: Lexer.NA })
const Ms = createToken({
    name: "Ms",
    pattern: MAKE_PATTERN("{{num}}ms", "i"),
    categories: Time
})
const Sec = createToken({
    name: "Sec",
    pattern: MAKE_PATTERN("{{num}}sec", "i"),
    categories: Time
})

const Freq = createToken({ name: "Freq", pattern: Lexer.NA })
const Hz = createToken({
    name: "Hz",
    pattern: MAKE_PATTERN("{{num}}hz", "i"),
    categories: Freq
})
const Khz = createToken({
    name: "Khz",
    pattern: MAKE_PATTERN("{{num}}khz", "i"),
    categories: Freq
})

const Percentage = createToken({
    name: "Percentage",
    pattern: MAKE_PATTERN("{{num}}%", "i")
})

// Num must appear after all the num forms with a suffix
const Num = createToken({
    name: "Num",
    pattern: MAKE_PATTERN("{{num}}")
})

// Ident must be before Minus
const Ident = createToken({
    name: "Ident",
    pattern: MAKE_PATTERN("{{ident}}")
})

const Minus = createToken({ name: "Minus", pattern: /-/ })

const LessLexer = new Lexer(lessTokens, { ensureOptimizations: true })

// ----------------- parser -----------------

class LessParser extends Parser {
    // Unfortunately no support for class fields with initializer in ES2015, only in esNext...
    // so the parsing rules are defined inside the constructor, as each parsing rule must be initialized by
    // invoking RULE(...)
    // see: https://github.com/jeffmo/es-class-fields-and-static-properties
    constructor(input) {
        super(input, lessTokens, {
            positionTracking: "onlyOffset",
            // outputCst: true,
            ignoredIssues: {
                selector: { OR: true }
            }
        })

        const $ = this

        // avoids hidden class changes due to performance hacks.
        this.c1 = undefined
        this.c2 = undefined
        this.c3 = undefined
        this.c4 = undefined
        this.c5 = undefined
        this.c6 = undefined
        this.c7 = undefined
        this.c8 = undefined
        this.c9 = undefined
        this.c10 = undefined

        this.RULE("stylesheet", () => {
            // [ CHARSET_SYM STRING ';' ]?
            $.OPTION(() => {
                $.SUBRULE($.charsetHeader)
            })

            // [S|CDO|CDC]*
            $.SUBRULE($.cdcCdo)

            // [ import [ CDO S* | CDC S* ]* ]*
            $.MANY(() => {
                $.SUBRULE($.cssImport)
                $.SUBRULE2($.cdcCdo)
            })

            // [ [ ruleset | media | page ] [ CDO S* | CDC S* ]* ]*
            $.MANY2(() => {
                $.SUBRULE($.contents)
            })
        })

        this.RULE("charsetHeader", () => {
            $.CONSUME(CharsetSym)
            $.CONSUME(StringLiteral)
            $.CONSUME(SemiColon)
        })

        this.RULE("contents", () => {
            $.OR(
                $.c3 ||
                    ($.c3 = [
                        { ALT: () => $.SUBRULE($.ruleset) },
                        { ALT: () => $.SUBRULE($.media) },
                        { ALT: () => $.SUBRULE($.page) }
                    ])
            )
            $.SUBRULE3($.cdcCdo)
        })

        // factor out repeating pattern for cdc/cdo
        this.RULE("cdcCdo", () => {
            $.MANY(() => {
                $.OR([
                    { ALT: () => $.CONSUME(Cdo) },
                    { ALT: () => $.CONSUME(Cdc) }
                ])
            })
        })

        // IMPORT_SYM S*
        // [STRING|URI] S* media_list? ';' S*
        this.RULE("cssImport", () => {
            $.CONSUME(ImportSym)

            $.OR(
                $.c4 ||
                    ($.c4 = [
                        { ALT: () => $.CONSUME(StringLiteral) },
                        { ALT: () => $.CONSUME(Uri) }
                    ])
            )

            $.OPTION(() => {
                $.SUBRULE($.media_list)
            })

            $.CONSUME(SemiColon)
        })

        // MEDIA_SYM S* media_list '{' S* ruleset* '}' S*
        this.RULE("media", () => {
            $.CONSUME(MediaSym)
            $.SUBRULE($.media_list)
            $.CONSUME(LCurly)
            $.SUBRULE($.ruleset)
            $.CONSUME(RCurly)
        })

        // medium [ COMMA S* medium]*
        this.RULE("media_list", () => {
            $.SUBRULE($.medium)
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => {
                    $.SUBRULE2($.medium)
                }
            })
        })

        // IDENT S*
        this.RULE("medium", () => {
            $.CONSUME(Ident)
        })

        // PAGE_SYM S* pseudo_page?
        // '{' S* declaration? [ ';' S* declaration? ]* '}' S*
        this.RULE("page", () => {
            $.CONSUME(PageSym)
            $.OPTION(() => {
                $.SUBRULE($.pseudo_page)
            })

            $.SUBRULE($.declarationsGroup)
        })

        // '{' S* declaration? [ ';' S* declaration? ]* '}' S*
        // factored out repeating grammar pattern
        this.RULE("declarationsGroup", () => {
            $.CONSUME(LCurly)
            $.OPTION(() => {
                $.SUBRULE($.declaration)
            })

            $.MANY(() => {
                $.CONSUME(SemiColon)
                $.OPTION2(() => {
                    $.SUBRULE2($.declaration)
                })
            })
            $.CONSUME(RCurly)
        })

        // ':' IDENT S*
        this.RULE("pseudo_page", () => {
            $.CONSUME(Colon)
            $.CONSUME(Ident)
        })

        // '/' S* | ',' S*
        this.RULE("operator", () => {
            $.OR([
                { ALT: () => $.CONSUME(Slash) },
                { ALT: () => $.CONSUME(Comma) }
            ])
        })

        // '+' S* | '>' S*
        this.RULE("combinator", () => {
            $.OR(
                $.c5 ||
                    ($.c5 = [
                        { ALT: () => $.CONSUME(Plus) },
                        { ALT: () => $.CONSUME(GreaterThan) }
                    ])
            )
        })

        // '-' | '+'
        this.RULE("unary_operator", () => {
            $.OR([
                { ALT: () => $.CONSUME(Minus) },
                { ALT: () => $.CONSUME(Plus) }
            ])
        })

        // IDENT S*
        this.RULE("property", () => {
            $.CONSUME(Ident)
        })

        // selector [ ',' S* selector ]*
        // '{' S* declaration? [ ';' S* declaration? ]* '}' S*
        this.RULE("ruleset", () => {
            $.OPTION(() => {
                $.SUBRULE($.selector)
            })

            $.MANY(() => {
                $.CONSUME(Comma)
                $.SUBRULE2($.selector)
            })
            $.SUBRULE($.declarationsGroup)
        })

        // simple_selector [ combinator selector | S+ [ combinator? selector ]? ]?
        this.RULE("selector", () => {
            $.SUBRULE($.simple_selector)
            $.OPTION(() => {
                $.OR(
                    $.c6 ||
                        ($.c6 = [
                            {
                                GATE: () => {
                                    const prevToken = $.LA(0)
                                    const nextToken = $.LA(1)
                                    //  This is the only place in CSS where the grammar is whitespace sensitive.
                                    return (
                                        nextToken.startOffset >
                                        prevToken.endOffset
                                    )
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
                )
            })
        })

        // element_name [ HASH | class | attrib | pseudo ]*
        // | [ HASH | class | attrib | pseudo ]+
        this.RULE("simple_selector", () => {
            $.OR(
                $.c7 ||
                    ($.c7 = [
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
            )
        })

        // helper grammar rule to avoid repetition
        // [ HASH | class | attrib | pseudo ]+
        this.RULE("simple_selector_suffix", () => {
            $.OR(
                $.c2 ||
                    ($.c2 = [
                        { ALT: () => $.CONSUME(Hash) },
                        { ALT: () => $.SUBRULE($.class) },
                        { ALT: () => $.SUBRULE($.attrib) },
                        { ALT: () => $.SUBRULE($.pseudo) }
                    ])
            )
        })

        // '.' IDENT
        this.RULE("class", () => {
            $.CONSUME(Dot)
            $.CONSUME(Ident)
        })

        // IDENT | '*'
        this.RULE("element_name", () => {
            $.OR([
                { ALT: () => $.CONSUME(Ident) },
                { ALT: () => $.CONSUME(Star) }
            ])
        })

        // '[' S* IDENT S* [ [ '=' | INCLUDES | DASHMATCH ] S* [ IDENT | STRING ] S* ]? ']'
        this.RULE("attrib", () => {
            $.CONSUME(LSquare)
            $.CONSUME(Ident)

            this.OPTION(() => {
                $.OR(
                    $.c8 ||
                        ($.c8 = [
                            { ALT: () => $.CONSUME(Equals) },
                            { ALT: () => $.CONSUME(Includes) },
                            { ALT: () => $.CONSUME(Dasmatch) }
                        ])
                )

                $.OR2(
                    $.c9 ||
                        ($.c9 = [
                            { ALT: () => $.CONSUME2(Ident) },
                            { ALT: () => $.CONSUME(StringLiteral) }
                        ])
                )
            })
            $.CONSUME(RSquare)
        })

        // ':' [ IDENT | FUNCTION S* [IDENT S*]? ')' ]
        this.RULE("pseudo", () => {
            $.CONSUME(Colon)

            $.OR(
                $.c10 ||
                    ($.c10 = [
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
            )
        })

        // property ':' S* expr prio?
        this.RULE("declaration", () => {
            $.SUBRULE($.property)
            $.CONSUME(Colon)
            $.SUBRULE($.expr)

            $.OPTION(() => {
                $.SUBRULE($.prio)
            })
        })

        // IMPORTANT_SYM S*
        this.RULE("prio", () => {
            $.CONSUME(ImportantSym)
        })

        // term [ operator? term ]*
        this.RULE("expr", () => {
            $.SUBRULE($.term)
            $.MANY(() => {
                $.OPTION(() => {
                    $.SUBRULE($.operator)
                })
                $.SUBRULE2($.term)
            })
        })

        // unary_operator?
        // [ NUMBER S* | PERCENTAGE S* | LENGTH S* | EMS S* | EXS S* | ANGLE S* |
        // TIME S* | FREQ S* ]
        // | STRING S* | IDENT S* | URI S* | hexcolor | function
        this.RULE("term", () => {
            $.OPTION(() => {
                $.SUBRULE($.unary_operator)
            })

            // performance hack - http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
            // Look for: "Avoid reinitializing large arrays of alternatives" in the link above.
            $.OR(
                $.c1 ||
                    ($.c1 = [
                        { ALT: () => $.CONSUME(Num) },
                        { ALT: () => $.CONSUME(Percentage) },
                        { ALT: () => $.CONSUME(Length) },
                        { ALT: () => $.CONSUME(Ems) },
                        { ALT: () => $.CONSUME(Exs) },
                        { ALT: () => $.CONSUME(Angle) },
                        { ALT: () => $.CONSUME(Time) },
                        { ALT: () => $.CONSUME(Freq) },
                        { ALT: () => $.CONSUME(StringLiteral) },
                        { ALT: () => $.CONSUME(Ident) },
                        { ALT: () => $.CONSUME(Uri) },
                        { ALT: () => $.SUBRULE($.hexcolor) },
                        { ALT: () => $.SUBRULE($.cssFunction) }
                    ])
            )
        })

        // FUNCTION S* expr ')' S*
        this.RULE("cssFunction", () => {
            $.CONSUME(Func)
            $.SUBRULE($.expr)
            $.CONSUME(RParen)
        })

        this.RULE("hexcolor", () => {
            $.CONSUME(Hash)
        })

        this.performSelfAnalysis()
    }
}

// ----------------- wrapping it all together -----------------

// reuse the same parser instance.
const parser = new LessParser([])

module.exports = {
    parseLess: function(text) {
        const lexResult = LessLexer.tokenize(text)
        // setting a new input will RESET the parser instance's state.
        parser.input = lexResult.tokens
        // any top level rule may be used as an entry point
        const value = parser.stylesheet()

        return {
            // This is a pure grammar, the value will be undefined until we add embedded actions
            // or enable automatic CST creation.
            value: value,
            lexErrors: lexResult.errors,
            parseErrors: parser.errors
        }
    }
}
