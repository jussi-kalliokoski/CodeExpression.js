var CodeExpression = (function(){

/**
 * Creates a new token object.
 *
 * @private
 * @constructor
 * @this {Token}
 * @param {String} content The data content of the Token.
 * @param {String} type The type of the Token.
 * @param {String} subtype (Optional) The subtype of the Token.
*/
	function Token(content, type, subtype){
/**
 * The data content of the Token.
*/
		this.content = content;
/**
 * The type of the Token.
*/
		this.type = type;
/**
 * The subtype of the Token.
*/
		this.subtype = subtype;
/**
 * Returns the string representation of the Token.
 *
 * @return {String} The string representation of the Token.
*/
		this.toString = function(){
			return this.content;
		};
	}

/**
 * Returns a substring terminated either by regexp mismatch OR length match.
 *
 * @param {String} string The string to perform the operation on.
 * @param {RegExp} reg The regexp to compare the character to.
 * @param {Number} length (Optional) the maximum length of the returned string.
 * @return {String}
*/
	function devourToken(string, reg, length){
		var	str	= string,
			ret	= '',
			i	= 0;
		while (str.search(reg) === 0 && (!length || i++ < length)){
			ret += str[0];
			str = str.substr(1);
		}
		return ret;
	}

/**
 * Returns an object containing the line and column of a certain cursor position in a specified string.
 *
 * @param {number} pos The cursor position.
 * @param {String} str The string to search from.
 * @return {Object}
*/
	function getLineAndCol(pos, str){
		var	newp	= 0,
			p	= 0,
			line	= 0,
			col	= 0;
		do{
			newp = str.indexOf('\n');
			if (newp >= pos){
				col = pos - p;
				break;
			}
			p = newp;
			line++;
		} while (p < pos);
		p = {
			line: line,
			col: col,
			toString: function(){
				return 'line ' + this.line + ', col ' + this.col;
			}
		};
		return p;
	}

/**
 * Chops a string into a CodeExpression with the provided checks.
 *
 * @private
 * @param {String} str The string to tokenize.
 * @param {Array} checks The checks to run to determine the type and subtype.
 * @return {CodeExpression}
*/
	function tokenizeMath(str, checks){
		var	left		= str,
			tokens		= [],
			token, tokentype, tokensub,
			stuck		= 0,
			i, n, cont;
		while(left.length){
			if (stuck++ > str.length){
				throw('Error in tokenizing string at ' + getLineAndCol(str.length - left.length, str) );
			}
			token = '';
			tokensub = undefined;
			cont = false;
			for (i=0; i<checks.length && !token; i++){
				token = checks[i](left, str);
				if (token && token.constructor === Array){ // What an ugly mess, it's vomiting multiple tokens at us. I guess it's XML. Pucker up and take it with a smile.
					for (n=0; n<token.length; n++){
						left = left.substr(token[n].content.length);
						tokens.push(new Token(token[n].content, token[n].type, token[n].subtype));
					}
					cont = true;
				} else if (token && token.type) {
					tokentype = token.type;
					tokensub = token.subtype;
					token = token.content;
				} else {
					tokentype = checks[i].type;
				}
				
			}
			if (!token){
				token = left[0];
				tokentype = 'ILLEGAL';
			}
			if (cont){
				continue;
			}
			left = left.substr(token.length);
			tokens.push(new Token(token, tokentype, tokensub));
		}
		return new CodeExpression(tokens, checks.name);
	}

/**
 * Creates a new CodeExpression object of the provided string in a provided language.
 *
 * @constructor
 * @this CodeExpression
 * @param {String} arg1 The string to convert.
 * @param {String} arg2 The language to apply.
*/
	function CodeExpression(arg1, arg2){
		if (this.constructor !== CodeExpression){
			return new CodeExpression(arg1, arg2);
		}

		if (typeof arg1 === 'string' && typeof arg2 === 'string'){
			return tokenizeMath(arg1, CodeExpression.languages[arg2]);
		} else if (arg1.constructor !== Array){
			throw 'Invalid arguments';
		}

		this.type = arg2;
		var i, length = arg1.length;
		for (i=0; i<length; i++){
			this[i] = arg1[i];
		}

		Object.defineProperty(this, 'length', {
			get: function(){
				return length;
			}
		});

/**
 * Returns a string representation of the CodeExpression object.
 *
 * @return {String} A string representation of the CodeExpression object.
*/
		this.toString = function(){
			var i, s = [];
			for (i=0; i<length; i++){
				s.push(this[i].content+' ('+this[i].type+')');
			}
			return s.toString();
		};
	}

/**
 * Creates a new Language object.
 *
 * @constructor
 * @this {Language}
 * @param {String} name The name of the language.
*/
	function Language(name){
		var l = [];
/**
 * Adds a new rule to the language's ruleset.
*/
		l.addRule = function(type, rule){
			rule.type = type;
			this.push(rule);
		};
		l.name = name;
		return l;
	}

	CodeExpression.name = 'CodeExpression';
	CodeExpression.languages = {};
	CodeExpression.devourToken = devourToken;
/**
 * Creates a new Language object and attaches it to CodeExpression.
 *
 * @param {String} name The name of the language.
 * @return {Language}
*/
	CodeExpression.createLanguage = function(name){
		return ( CodeExpression.languages[name] = Language(name) );
	};

	return CodeExpression;
}());
