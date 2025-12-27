/**
 * @file A larlpop parser
 * @author Conando <conando025@protonmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

function comma(rule) {
  return seq(optional(rule), repeat(seq(',', rule)));
}

module.exports = grammar({
  name: "lalrpop",

  rules: {
    //TODO: add attributes and co
    source_file: $ => seq(
      repeat($.use),
      'grammar',
      optional($.grammar_type_parameters),
      optional($.grammar_parameters),
      ';',
      repeat($.grammar_item),
    ),

    grammar_type_parameters: $ => seq('<', comma(choice($.lifetime, $.id)), '>'),

    grammar_parameters: $ => seq('(', comma($.grammar_parameter), ')'),

    grammar_parameter: $ => seq($.id, ':', $.type_ref),

    grammar_item: $ => choice($.use, $.match_token, $.extern_token, $.nonterminal),

    nonterminal: $ => seq(
      repeat($.attribute),
      optional($.visibility),
      $.nonterminal_name,
      optional(seq(':', $.type_ref)),
      '=',
      $.alternatives,
    ),

    //FIX
    symbol: $ => choice(/<.*>/, $.symbol0),

    symbol0: $ => choice($.symbol1, seq($.symbol0, $.repeat_op)),

    repeat_op: $ => choice('+', '*', '?'),

    symbol1: $ => choice(
      seq($.macro_id, '<', comma($.symbol), '>'),
      $.quoted_terminal,
      "Id",
      $.escape,
      seq('(', repeat($.symbol), ')'),
      '@L', '@R', '!',
    ),

    escape: $ => /.*/,

    quoted_terminal: $ => /".*"/,

    nonterminal_name: $ => choice(
      seq($.macro_id, '<', comma($.not_macro_id), '>'),
      $.not_macro_id,
      //TODO: Escape?
    ),

    macro_id: $ => /\w+/,

    not_macro_id: $ => $.id,

    alternatives: $ => choice(seq($.alternative, ';'), seq('{', comma($.alternative), '}', optional(';'))),

    alternative: $ => seq(repeat($.attribute), choice(
      seq(repeat1($.symbol), optional(seq('if', $.cond)), optional($.action)),
      seq(optional(seq('if', $.cond)), $.action),
    )),

    action: $ => seq('=>', optional(choice('@L', '@R', '?'))),

    extern_token: $ => seq('extern', '{', /.*/, '}'),

    match_token: $ => $.match_token_int,

    match_token_int: $ => choice(
      seq($.match_token_int, 'else', '{', comma($.match_item), '}'),
      seq('match', '{', comma($.match_item), '}'),
    ),

    match_item: $ => choice('_'), //TODO: missing other options

    cond: $ => seq($.not_macro_id, $.cond_op, $.string_literal),

    cond_op: $ => choice('==', '!=', '~~', '!~'),

    lifetime: $ => /'\w+/,

    id: $ => /\w+/,

    //TODO: add symbol and dyn rules
    type_ref: $ => choice(
      seq('(', comma($.type_ref), ')'),
      seq('[', $.type_ref, ']'),
      seq('&', optional($.lifetime), optional('mut'), $.type_ref),
      seq($.path, optional(seq('<', choice($.lifetime, $.type_ref), '>'))),
    ),

    visibility: $ => seq('pub', optional(seq('(', optional('in'), $.path, ')'))),

    attribute: $ => seq('#', '[', $.attribute_inner, ']'),

    attribute_inner: $ => seq($.id, optional($.attribute_arg)),

    attribute_arg: $ => choice(
      seq('(', comma($.attribute_inner), ')'),
      seq('=', $.string_literal),
    ),

    path: $ => seq(optional('::'), repeat(seq($.id, '::')),  $.id),

    use: $ => /use [^;]*;/,

    string_literal: $ => /".*"/,
  }
});
