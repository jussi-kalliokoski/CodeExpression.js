(function(CodeExpression){
	var
		reservedWords			= ['boolean', 'break', 'byte', 'case', 'catch', 'char', 'continue', 'default', 'delete', 'do', 'double', 'else', 'false', 'final', 'finally', 'float', 'for', 'function', 'if', 'in', 'instanceof', 'int', 'long', 'new', 'null', 'return', 'short', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with'],
		keyWords			= ['abstract', 'debugger', 'enum', 'goto', 'implements', 'native', 'protected', 'synchronized', 'throws', 'transient', 'volatile'],
		futureWords			= ['as', 'class', 'export', 'extends', 'import', 'interface', 'is', 'namespace', 'package', 'private', 'public', 'static', 'super', 'use'],
		constructorWords		= ['Function', 'Object', 'Number', 'Date', 'String', 'RegExp', 'Array', 'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'Int8Array', 'Int16Array', 'Uint16Array', 'Int32Array', 'Float32Array', 'Float64Array'],
		predefinedWords			= ['undefined', 'null', 'infinity', 'Math', 'JSON'],
		predefinedFunctions		= ['eval', 'parseInt', 'parseFloat', 'isNaN', 'isFinite'],

		devourToken			= CodeExpression.devourToken,
		JS				= CodeExpression.createLanguage('JavaScript');

	JS.parser.operator	= /[{}\(\)\[\]\.;,<>+\-\*%&|\^!~\?:=\/]/;
	JS.parser.operator.list = [ '{}()[].;,<>+-*%&|^!~?:=/',
					['<=', '>=', '==', '!=', '++', '--', '<<', '>>', '&&', '||', '+=', '-=', '*=', '%=', '&=', '|=', '^=', '/='],
					['===', '!==', '>>>', '<<=', '>>='], ['>>>=']];
	JS.parser.identifier	= /^[a-z_\$][a-z_\$0-9]*/i;
	JS.parser.identifier.namedWords = [reservedWords, keyWords, futureWords, constructorWords, predefinedWords, predefinedFunctions];
	JS.parser.identifier.namedWordNames = ['ReservedWord', 'KeyWord', 'FutureWord', 'ConstructorWord', 'PredefinedWord', 'PredefinedFunctionWord'];

	function isIn(needle, haystack){
		var i, l = haystack.length;
		for (i=0; i<l; i++){
			if (haystack[i] === needle){
				return true;
			}
		}
		return false;
	}

	JS.addRule('Comment', function(left, str, end){
		if (left.indexOf('/*') === 0 && (end = left.indexOf('*/')) !== -1){
			return left.substr(0, end + 2);
		}
	});

	JS.parser('Comment', /^\/\/[^\n]+/);

	JS.parser('RegExp', /^\/(\\[^\x00-\x1f]|\[(\\[^\x00-\x1f]|[^\x00-\x1f\\\/])*\]|[^\x00-\x1f\\\/\[])+\/[gim]*/);

	JS.addRule('String', function(left, str){
		if (left.search(/["']/) !== 0){
			return;
		}
		var token = left[0],
		nextChar = '\\',
		temp = left.substr(token.length),
		searchQuery = (token === '"') ? /[^"\\]/ : /[^'\\]/;
		while(nextChar === '\\'){
			if (temp[0] === '\\'){
				token += '\\'+temp[1];
				temp = temp.substr(2);
			}
			token += devourToken(temp, searchQuery);
			temp = left.substr(token.length);
			nextChar = temp[0];
		}
		if (left.length === token.length){
			throw('Error: unterminated string');
		}
		token += left[token.length];
		return token;
	});

	JS.addRule('Identifier', function(left, str, i){
		str = JS.parser.identifier.exec(left);
		if (str){
			str = str[0];
			for (i=0; i < JS.parser.identifier.namedWords.length; i++){
				if (isIn(str, JS.parser.identifier.namedWords[i])){
					return {
						content: str,
						type: 'Word',
						subtype: JS.parser.identifier.namedWordNames[i]
					};
				}
			}
			return str;
		}
	});

	JS.parser('Hexadecimal', /^0x[0-9a-f]+/i);

	JS.parser('Octal', /^0[0-7]+/);

	JS.parser('Degal', /^(0|([1-9][0-9]*))e[0-9]+/i);

	JS.parser('Number', /^(0?\.[0-9]+)|^([1-9][0-9]*(\.[0-9]+)?)|^0/);

	JS.parser('Whitespace', /^[\n\t\r ]/);

	JS.addRule('Operator', function(left, str){
		if (left.search(JS.parser.operator) === 0){
			var	token	= devourToken(left, JS.parser.operator, 4),
				i;
			for (i = 3; i >= 0; i--){
				if (isIn(token, JS.parser.operator.list[i])){
					return token;
				}
				token = token.substr(0, i);
			}
		}
	});
}(CodeExpression));
