(function(CodeExpression){
	var
		identifierBeginsWith		= /[a-zA-Z_\$]/,
		identifierContinuesWith		= /[a-zA-Z0-9_\$]/,
		operatorMatch			= /[{}\(\)\[\]\.;,<>+\-\*%&|\^!~\?:=\/]/,
		crazyRegExpMatch		= /^\/(\\[^\x00-\x1f]|\[(\\[^\x00-\x1f]|[^\x00-\x1f\\\/])*\]|[^\x00-\x1f\\\/\[])+\/[gim]*/, //GEEZ, this is horrifying, but can't think of a better way to do this.
		reservedWords			= ['boolean', 'break', 'byte', 'case', 'catch', 'char', 'continue', 'default', 'delete', 'do', 'double', 'else', 'false', 'final', 'finally', 'float', 'for', 'function', 'if', 'in', 'instanceof', 'int', 'long', 'new', 'null', 'return', 'short', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with'],
		keyWords			= ['abstract', 'debugger', 'enum', 'goto', 'implements', 'native', 'protected', 'synchronized', 'throws', 'transient', 'volatile'],
		futureWords			= ['as', 'class', 'export', 'extends', 'import', 'interface', 'is', 'namespace', 'package', 'private', 'public', 'static', 'super', 'use'],
		constructorWords		= ['Function', 'Object', 'Number', 'Date', 'String', 'RegExp', 'Array', 'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'Int8Array', 'Int16Array', 'Uint16Array', 'Int32Array', 'Float32Array', 'Float64Array'],
		predefinedWords			= ['undefined', 'null', 'infinity', 'Math', 'JSON'],
		predefinedFunctions		= ['eval', 'parseInt', 'parseFloat', 'isNaN', 'isFinite'],
		namedWords			= [reservedWords, keyWords, futureWords, constructorWords, predefinedWords, predefinedFunctions],
		namedWordNames			= ['ReservedWord', 'KeyWord', 'FutureWord', 'ConstructorWord', 'PredefinedWord', 'PredefinedFunctionWord'],
		
		operators			= [ '{}()[].;,<>+-*%&|^!~?:=/',
							['<=', '>=', '==', '!=', '++', '--', '<<', '>>', '&&', '||', '+=', '-=', '*=', '%=', '&=', '|=', '^=', '/='],
							['===', '!==', '>>>', '<<=', '>>='], ['>>>=']],

		devourToken			= CodeExpression.devourToken,
		JS				= CodeExpression.createLanguage('JavaScript');

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

	JS.addRule('Comment', function(left, str){
		str = /^\/\/[^\n]+/.exec(left);
		return str && str[0];
	});

	JS.addRule('RegExp', function(left, str){
		str = crazyRegExpMatch.exec(left);
		return str && str[0];
	});

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
		str = /^[a-z_\$][a-z_\$0-9]*/i.exec(left);
		if (str){
			str = str[0];
			for (i=0; i < namedWords.length; i++){
				if (isIn(str, namedWords[i])){
					return {
						content: str,
						type: 'Word',
						subtype: namedWordNames[i]
					};
				}
			}
			return str;
		}
	});

	JS.addRule('Hexadecimal', function(left, str){
		str = /^0x[0-9a-f]+/i.exec(left);
		return str && str[0];
	});

	JS.addRule('Octal', function(left, str){
		str = /^0[0-7]+/.exec(left);
		return str && str[0];
	});

	JS.addRule('Number', function(left, str){
		str = /^(0?\.[0-9]+)|^([1-9][0-9]*(\.[0-9]+)?)|^0/.exec(left);
		return str && str[0];
	});

	JS.addRule('Whitespace', function(left, str){
		str = /^[\n\t\r ]/.exec(left);
		return str && str[0];
	});

	JS.addRule('Operator', function(left, str){
		if (left.search(operatorMatch) === 0){
			var	token	= devourToken(left, operatorMatch, 4),
				i;
			for (i = 3; i >= 0; i--){
				if (isIn(token, operators[i])){
					return token;
				}
				token = token.substr(0, i);
			}
		}
	});
}(CodeExpression));
