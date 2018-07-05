const assert = require("assert")
const parseCss = require("./less2").parse

describe("The LESS Grammar", () => {
    it("can parse a LESS extend rule", () => {
        const inputText = `
          &:extend(.b);
        `
        const result = parseCss(inputText)

        assert.equal(result.lexErrors, 0)
        assert.equal(result.parseErrors.length, 0)
    })
})
