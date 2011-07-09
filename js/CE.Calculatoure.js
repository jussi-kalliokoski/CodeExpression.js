(function(CodeExpression){
	var
		devourToken			= CodeExpression.devourToken,
		Calc				= CodeExpression.createLanguage('Calculatoure');

	Calc.parser.operator	= /[{}\(\)\[\]\.;,<>+\-\*%&|\^!~\?:=\/]/;
	Calc.parser.operator.list = [ '{}()[].;,<>+-*%&|^!~?:=/',
					['<=', '>=', '==', '!=', '++', '--', '<<', '>>', '&&', '||', '+=', '-=', '*=', '%=', '&=', '|=', '^=', '/='],
					['===', '!==', '>>>', '<<=', '>>='], ['>>>=']];
	Calc.parser.identifier	= /^[a-z_\$][a-z_\$0-9]*/i;
	Calc.parser.operator.literal = ['and', 'or', 'xor', 'not'];

	function isIn(needle, haystack){
		var i, l = haystack.length;
		for (i=0; i<l; i++){
			if (haystack[i] === needle){
				return true;
			}
		}
		return false;
	}

	Calc.addRule('Comment', function(left, str, end){
		if (left.indexOf('/*') === 0 && (end = left.indexOf('*/')) !== -1){
			return left.substr(0, end + 2);
		}
	});

	Calc.addRule('Identifier', function(left, str, i){
		str = Calc.parser.identifier.exec(left);
		if (str){
			str = str[0];
			for (i=0; i < Calc.parser.operator.literals.length; i++){
				if (str.toLowerCase() === Calc.parser.operator.literals[i]){
					return {
						content: str.toUpperCase(),
						type: 'Operator',
						subtype: 'Literal'
					};
				}
			}
			return str;
		}
	});

	Calc.parser('Hexadecimal', /^0x[0-9a-f]+/i);

	Calc.parser('Octal', /^0[0-7]+/);

	Calc.parser('Degal', /^(0|([1-9][0-9]*))e[0-9]+/i);

	Calc.parser('Number', /^(0?\.[0-9]+)|^([1-9][0-9]*(\.[0-9]+)?)|^0/);

	Calc.parser('Whitespace', /^[\n\t\r ]/);

	Calc.addRule('Operator', function(left, str){
		if (left.search(Calc.parser.operator) === 0){
			var	token	= devourToken(left, Calc.parser.operator, 4),
				i;
			for (i = 3; i >= 0; i--){
				if (isIn(token, Calc.parser.operator.list[i])){
					return token;
				}
				token = token.substr(0, i);
			}
		}
	});
}(CodeExpression));
