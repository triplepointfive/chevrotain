const assert = require("assert")
const parseCss = require("./moreLess").parse

describe("The Better LESS Grammar", () => {
    it("can parse a LESS extend rule", () => {
        const inputText = `
          &:extend(.b);
        `
        const result = parseCss(inputText)

        assert.equal(result.lexErrors, 0)
        assert.equal(result.parseErrors.length, 0)
    })

    it("can parse a LESS ruleSet", () => {
        const inputText = `
          .foo #oops {
             &:extend(.b);
          }
        `
        const result = parseCss(inputText)

        assert.equal(result.lexErrors, 0)
        assert.equal(result.parseErrors.length, 0)
    })

    it("can parse a LESS nested rule ruleSet", () => {
        const inputText = `
          .foo #oops {
             &:extend(.b);
             
             a ~ b {
               &:extend(.c);
             }
          }
        `
        const result = parseCss(inputText)

        assert.equal(result.lexErrors, 0)
        assert.equal(result.parseErrors.length, 0)
    })
})
