const serializedGrammar = [
    {
        type: "Rule",
        name: "primary",
        orgText:
            "() => {\n            $.MANY(() => {\n                $.OR([\n                    { ALT: () => $.SUBRULE($.extendRule) },\n                    { ALT: () => $.SUBRULE($.ruleset) }\n                    // { ALT: () => $.SUBRULE($.mixinDefinition) },\n                    // { ALT: () => $.SUBRULE($.declaration) },\n                    // { ALT: () => $.SUBRULE($.mixinCall) },\n                    // { ALT: () => $.SUBRULE($.variableCall) },\n                    // { ALT: () => $.SUBRULE($.entitiesCall) },\n                    // { ALT: () => $.SUBRULE($.atrule) }\n                ])\n            })\n        }",
        definition: [
            {
                type: "Repetition",
                idx: 0,
                definition: [
                    {
                        type: "Alternation",
                        idx: 0,
                        definition: [
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "NonTerminal",
                                        name: "extendRule",
                                        idx: 0
                                    }
                                ]
                            },
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "NonTerminal",
                                        name: "ruleset",
                                        idx: 0
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        type: "Rule",
        name: "extendRule",
        orgText:
            '() => {\n            $.CONSUME(AtExtend)\n            $.MANY_SEP({\n                SEP: Comma,\n                DEF: () => {\n                    // TODO: a GATE is needed here because the following All\n                    $.SUBRULE($.selector)\n\n                    // TODO: this probably has to be post processed\n                    // because "ALL" may be a normal ending part of a selector\n                    // $.OPTION(() => {\n                    //     $.CONSUME(All)\n                    // })\n                }\n            })\n            $.CONSUME(RParen)\n            $.CONSUME(SemiColon)\n        }',
        definition: [
            {
                type: "Terminal",
                name: "AtExtend",
                label: "AtExtend",
                idx: 0,
                pattern: "&:extend("
            },
            {
                type: "RepetitionWithSeparator",
                idx: 0,
                separator: {
                    type: "Terminal",
                    name: "Comma",
                    label: "Comma",
                    idx: 1,
                    pattern: ","
                },
                definition: [
                    {
                        type: "NonTerminal",
                        name: "selector",
                        idx: 0
                    }
                ]
            },
            {
                type: "Terminal",
                name: "RParen",
                label: "RParen",
                idx: 0,
                pattern: ")"
            },
            {
                type: "Terminal",
                name: "SemiColon",
                label: "SemiColon",
                idx: 0,
                pattern: ";"
            }
        ]
    },
    {
        type: "Rule",
        name: "mixinDefinition",
        orgText: "() => {}",
        definition: []
    },
    {
        type: "Rule",
        name: "declaration",
        orgText: "() => {}",
        definition: []
    },
    {
        type: "Rule",
        name: "ruleset",
        orgText:
            "() => {\n            $.MANY_SEP({\n                SEP: Comma,\n                DEF: () => {\n                    $.SUBRULE($.selector)\n                }\n            })\n\n            $.SUBRULE($.block)\n        }",
        definition: [
            {
                type: "RepetitionWithSeparator",
                idx: 0,
                separator: {
                    type: "Terminal",
                    name: "Comma",
                    label: "Comma",
                    idx: 1,
                    pattern: ","
                },
                definition: [
                    {
                        type: "NonTerminal",
                        name: "selector",
                        idx: 0
                    }
                ]
            },
            {
                type: "NonTerminal",
                name: "block",
                idx: 0
            }
        ]
    },
    {
        type: "Rule",
        name: "mixinCall",
        orgText: "() => {}",
        definition: []
    },
    {
        type: "Rule",
        name: "variableCall",
        orgText: "() => {\n            $.CONSUME(VariableCall)\n        }",
        definition: [
            {
                type: "Terminal",
                name: "VariableCall",
                label: "VariableCall",
                idx: 0,
                pattern: "@[\\w-]+\\(\\s*\\)"
            }
        ]
    },
    {
        type: "Rule",
        name: "entitiesCall",
        orgText: "() => {}",
        definition: []
    },
    {
        type: "Rule",
        name: "atrule",
        orgText: "() => {}",
        definition: []
    },
    {
        type: "Rule",
        name: "attrib",
        orgText:
            "() => {\n            $.CONSUME(LSquare)\n            $.CONSUME(Ident)\n\n            this.OPTION(() => {\n                $.OR([\n                    { ALT: () => $.CONSUME(Equals) },\n                    { ALT: () => $.CONSUME(Includes) },\n                    { ALT: () => $.CONSUME(Dasmatch) },\n                    { ALT: () => $.CONSUME(BeginMatchExactly) },\n                    { ALT: () => $.CONSUME(EndMatchExactly) },\n                    { ALT: () => $.CONSUME(ContainsMatch) }\n                ])\n\n                // REVIEW: misaligned with LESS: LESS allowed % number here, but\n                // that is not valid CSS\n                $.OR2([\n                    { ALT: () => $.CONSUME2(Ident) },\n                    { ALT: () => $.CONSUME(StringLiteral) }\n                ])\n            })\n            $.CONSUME(RSquare)\n        }",
        definition: [
            {
                type: "Terminal",
                name: "LSquare",
                label: "LSquare",
                idx: 0,
                pattern: "["
            },
            {
                type: "Terminal",
                name: "Ident",
                label: "Ident",
                idx: 0,
                pattern:
                    "(?:-?(?:[_a-zA-Z]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))(?:[_a-zA-Z0-9-]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))*)"
            },
            {
                type: "Option",
                idx: 0,
                definition: [
                    {
                        type: "Alternation",
                        idx: 0,
                        definition: [
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "Terminal",
                                        name: "Equals",
                                        label: "Equals",
                                        idx: 0,
                                        pattern: "="
                                    }
                                ]
                            },
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "Terminal",
                                        name: "Includes",
                                        label: "Includes",
                                        idx: 0,
                                        pattern: "~="
                                    }
                                ]
                            },
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "Terminal",
                                        name: "Dasmatch",
                                        label: "Dasmatch",
                                        idx: 0,
                                        pattern: "|="
                                    }
                                ]
                            },
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "Terminal",
                                        name: "BeginMatchExactly",
                                        label: "BeginMatchExactly",
                                        idx: 0,
                                        pattern: "^="
                                    }
                                ]
                            },
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "Terminal",
                                        name: "EndMatchExactly",
                                        label: "EndMatchExactly",
                                        idx: 0,
                                        pattern: "$="
                                    }
                                ]
                            },
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "Terminal",
                                        name: "ContainsMatch",
                                        label: "ContainsMatch",
                                        idx: 0,
                                        pattern: "*="
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "Alternation",
                        idx: 2,
                        definition: [
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "Terminal",
                                        name: "Ident",
                                        label: "Ident",
                                        idx: 2,
                                        pattern:
                                            "(?:-?(?:[_a-zA-Z]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))(?:[_a-zA-Z0-9-]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))*)"
                                    }
                                ]
                            },
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "Terminal",
                                        name: "StringLiteral",
                                        label: "StringLiteral",
                                        idx: 0,
                                        pattern:
                                            "(?:\\\"([^\\n\\r\\f\\\"]|(?:\\n|\\r|\\f)|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))*\\\")|(?:\\'([^\\n\\r\\f\\']|(?:\\n|\\r|\\f)|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))*\\')"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                type: "Terminal",
                name: "RSquare",
                label: "RSquare",
                idx: 0,
                pattern: "]"
            }
        ]
    },
    {
        type: "Rule",
        name: "variableCurly",
        orgText: "() => {}",
        definition: []
    },
    {
        type: "Rule",
        name: "selector",
        orgText:
            "() => {\n            $.SUBRULE($.simple_selector)\n            $.OPTION(() => {\n                $.OR([\n                    {\n                        GATE: () => {\n                            const prevToken = $.LA(0)\n                            const nextToken = $.LA(1)\n                            //  This is the only place in CSS where the grammar is whitespace sensitive.\n                            return nextToken.startOffset > prevToken.endOffset\n                        },\n                        ALT: () => {\n                            $.OPTION2(() => {\n                                $.SUBRULE($.combinator)\n                            })\n                            $.SUBRULE($.selector)\n                        }\n                    },\n                    {\n                        ALT: () => {\n                            $.SUBRULE2($.combinator)\n                            $.SUBRULE2($.selector)\n                        }\n                    }\n                ])\n            })\n        }",
        definition: [
            {
                type: "NonTerminal",
                name: "simple_selector",
                idx: 0
            },
            {
                type: "Option",
                idx: 0,
                definition: [
                    {
                        type: "Alternation",
                        idx: 0,
                        definition: [
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "Option",
                                        idx: 2,
                                        definition: [
                                            {
                                                type: "NonTerminal",
                                                name: "combinator",
                                                idx: 0
                                            }
                                        ]
                                    },
                                    {
                                        type: "NonTerminal",
                                        name: "selector",
                                        idx: 0
                                    }
                                ]
                            },
                            {
                                type: "Flat",
                                definition: [
                                    {
                                        type: "NonTerminal",
                                        name: "combinator",
                                        idx: 2
                                    },
                                    {
                                        type: "NonTerminal",
                                        name: "selector",
                                        idx: 2
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        type: "Rule",
        name: "simple_selector",
        orgText:
            "() => {\n            $.OR([\n                {\n                    ALT: () => {\n                        $.SUBRULE($.element_name)\n                        $.MANY(() => {\n                            $.SUBRULE($.simple_selector_suffix)\n                        })\n                    }\n                },\n                {\n                    ALT: () => {\n                        $.AT_LEAST_ONE(() => {\n                            $.SUBRULE2($.simple_selector_suffix)\n                        })\n                    }\n                }\n            ])\n        }",
        definition: [
            {
                type: "Alternation",
                idx: 0,
                definition: [
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "NonTerminal",
                                name: "element_name",
                                idx: 0
                            },
                            {
                                type: "Repetition",
                                idx: 0,
                                definition: [
                                    {
                                        type: "NonTerminal",
                                        name: "simple_selector_suffix",
                                        idx: 0
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "RepetitionMandatory",
                                idx: 0,
                                definition: [
                                    {
                                        type: "NonTerminal",
                                        name: "simple_selector_suffix",
                                        idx: 2
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        type: "Rule",
        name: "combinator",
        orgText:
            "() => {\n            $.OR([\n                { ALT: () => $.CONSUME(Plus) },\n                { ALT: () => $.CONSUME(GreaterThan) },\n                { ALT: () => $.CONSUME(Tilde) }\n            ])\n        }",
        definition: [
            {
                type: "Alternation",
                idx: 0,
                definition: [
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "Terminal",
                                name: "Plus",
                                label: "Plus",
                                idx: 0,
                                pattern: "+"
                            }
                        ]
                    },
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "Terminal",
                                name: "GreaterThan",
                                label: "GreaterThan",
                                idx: 0,
                                pattern: ">"
                            }
                        ]
                    },
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "Terminal",
                                name: "Tilde",
                                label: "Tilde",
                                idx: 0,
                                pattern: "~"
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        type: "Rule",
        name: "simple_selector_suffix",
        orgText:
            "() => {\n            $.OR([\n                { ALT: () => $.CONSUME(Hash) },\n                { ALT: () => $.SUBRULE($.class) },\n                { ALT: () => $.SUBRULE($.attrib) },\n                { ALT: () => $.SUBRULE($.pseudo) }\n            ])\n        }",
        definition: [
            {
                type: "Alternation",
                idx: 0,
                definition: [
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "Terminal",
                                name: "Hash",
                                label: "Hash",
                                idx: 0,
                                pattern:
                                    "#(?:([_a-zA-Z0-9-]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))+)"
                            }
                        ]
                    },
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "NonTerminal",
                                name: "class",
                                idx: 0
                            }
                        ]
                    },
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "NonTerminal",
                                name: "attrib",
                                idx: 0
                            }
                        ]
                    },
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "NonTerminal",
                                name: "pseudo",
                                idx: 0
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        type: "Rule",
        name: "class",
        orgText:
            "() => {\n            $.CONSUME(Dot)\n            $.CONSUME(Ident)\n        }",
        definition: [
            {
                type: "Terminal",
                name: "Dot",
                label: "Dot",
                idx: 0,
                pattern: "."
            },
            {
                type: "Terminal",
                name: "Ident",
                label: "Ident",
                idx: 0,
                pattern:
                    "(?:-?(?:[_a-zA-Z]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))(?:[_a-zA-Z0-9-]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))*)"
            }
        ]
    },
    {
        type: "Rule",
        name: "element_name",
        orgText:
            "() => {\n            $.OR([\n                { ALT: () => $.CONSUME(Ident) },\n                { ALT: () => $.CONSUME(Star) }\n            ])\n        }",
        definition: [
            {
                type: "Alternation",
                idx: 0,
                definition: [
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "Terminal",
                                name: "Ident",
                                label: "Ident",
                                idx: 0,
                                pattern:
                                    "(?:-?(?:[_a-zA-Z]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))(?:[_a-zA-Z0-9-]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))*)"
                            }
                        ]
                    },
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "Terminal",
                                name: "Star",
                                label: "Star",
                                idx: 0,
                                pattern: "*"
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        type: "Rule",
        name: "pseudo",
        orgText:
            "() => {\n            $.CONSUME(Colon)\n\n            $.OR([\n                { ALT: () => $.CONSUME(Ident) },\n                {\n                    ALT: () => {\n                        $.CONSUME(Func)\n                        $.OPTION(() => {\n                            $.CONSUME2(Ident)\n                        })\n                        $.CONSUME(RParen)\n                    }\n                }\n            ])\n        }",
        definition: [
            {
                type: "Terminal",
                name: "Colon",
                label: "Colon",
                idx: 0,
                pattern: ":"
            },
            {
                type: "Alternation",
                idx: 0,
                definition: [
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "Terminal",
                                name: "Ident",
                                label: "Ident",
                                idx: 0,
                                pattern:
                                    "(?:-?(?:[_a-zA-Z]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))(?:[_a-zA-Z0-9-]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))*)"
                            }
                        ]
                    },
                    {
                        type: "Flat",
                        definition: [
                            {
                                type: "Terminal",
                                name: "Func",
                                label: "Func",
                                idx: 0,
                                pattern:
                                    "(?:-?(?:[_a-zA-Z]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))(?:[_a-zA-Z0-9-]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))*)\\("
                            },
                            {
                                type: "Option",
                                idx: 0,
                                definition: [
                                    {
                                        type: "Terminal",
                                        name: "Ident",
                                        label: "Ident",
                                        idx: 2,
                                        pattern:
                                            "(?:-?(?:[_a-zA-Z]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))(?:[_a-zA-Z0-9-]|(?:[\\u0240-\\uffff])|(?:(?:(?:[0-9a-f]){1,6})|\\\\[^\\r\\n\\f0-9a-f]))*)"
                                    }
                                ]
                            },
                            {
                                type: "Terminal",
                                name: "RParen",
                                label: "RParen",
                                idx: 0,
                                pattern: ")"
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        type: "Rule",
        name: "block",
        orgText:
            "() => {\n            $.CONSUME(LCurly)\n            // TODO: does primary include the repetition?\n            $.SUBRULE($.primary)\n            $.CONSUME(RCurly)\n        }",
        definition: [
            {
                type: "Terminal",
                name: "LCurly",
                label: "LCurly",
                idx: 0,
                pattern: "{"
            },
            {
                type: "NonTerminal",
                name: "primary",
                idx: 0
            },
            {
                type: "Terminal",
                name: "RCurly",
                label: "RCurly",
                idx: 0,
                pattern: "}"
            }
        ]
    }
]
