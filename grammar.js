/**
 * @file A larlpop parser
 * @author Conando <conando025@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "lalrpop",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
