
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql2');
const {Sequelize, DataTypes} = require("sequelize");
const http = require('http');
const path = require('path');
const fs = require('fs');
const alert=require("alert")
const { JSDOM } = require('jsdom');

const staticPath = path.join(__dirname, "../public");
const htmlPath = path.join(__dirname, "../public/index.html");
const html = fs.readFileSync(htmlPath, 'utf8');

const dom = new JSDOM(html);
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(staticPath));

app.get("/", function(req, res){
  //res.sendFile(__dirname + "/index.html");
});

app.post("/", function(){
  res.send();
});

app.listen(3000, function(){
  console.log("Server is up and running on port 3000");
});


const keywords = ["int", "double", "float", "char", "if", "else", "while", "for", "do", "switch", "case", "break", "auto", "const", "continue", "default", "goto", "long", "return", "struct", "<<", ">>", "string", "using", "namespace", "std", "main", "cout", "cin", "endl"];

// Regular expressions for common patterns
const digitRegex = /\d/;
const alphaRegex = /[a-zA-Z]/;
const identifierRegex = /[a-zA-Z_]\w*/;

// Token types
const TokenType = {
  IDENTIFIER: "IDENTIFIER",
  KEYWORD: "KEYWORD",
  NUMBER: "NUMBER",
  OPERATOR: "OPERATOR",
  PUNCTUATION: "PUNCTUATION",
  STRING: "STRING"
};

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

function tokenize(code) {
  const tokens = [];
  let currentToken = "";

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const nextChar = code[i + 1];

    if (char === "/") {
      if (nextChar === "/") {
        // Single-line comment, skip to end of line
        i++;
        while (code[i] !== "\n" && i < code.length - 1) {
          i++;
        }
        continue;
      } else if (nextChar === "*") {
        // Multi-line comment, skip until end of comment
        i += 2;
        while (!(code[i] === "*" && code[i + 1] === "/") && i < code.length - 1) {
          i++;
        }
        i += 2; // Skip past end of comment
        continue;
      }
    }

    if (char.match(digitRegex)) {
      // Number literal
      currentToken += char;
      if (!nextChar || !nextChar.match(digitRegex)) {
        tokens.push(new Token(TokenType.NUMBER, currentToken));
        currentToken = "";
      }
    } else if (char.match(alphaRegex)) {
      // Identifier or keyword
      currentToken += char;
      if (!nextChar || !nextChar.match(/\w/)) {
        if (keywords.includes(currentToken)) {
          tokens.push(new Token(TokenType.KEYWORD, currentToken));
        } else {
          tokens.push(new Token(TokenType.IDENTIFIER, currentToken));
        }
        currentToken = "";
      }
    } else if (char === "\"" || char === "'") {
      // String literal
      let string = char;
      i++;
      while (code[i] !== char && i < code.length - 1) {
        string += code[i];
        i++;
      }
      string += char;
      tokens.push(new Token(TokenType.STRING, string));
    } else if (char.match(/\s/)) {
      // Whitespace, ignore
      continue;
    } else if (char.match(/[\+\-\*\/=&\|><!%]/)) {
      // Operator
      currentToken += char;
      if (char === "=" && nextChar === "=") {
        currentToken += nextChar;
        i++;
      }
      tokens.push(new Token(TokenType.OPERATOR, currentToken));
      currentToken = "";
    } else if (char.match(/[\(\)\{\}\[\];,:]/)) {
      // Punctuation
      tokens.push(new Token(TokenType.PUNCTUATION, char));
    } else {
      throw new Error(`Unexpected character: ${char}`);
    }
  }

  return tokens;
}


let form = [];
let output = [];
const o_identifiers = [];
const o_keywords = [];
const o_numbers = [];
const o_operators = [];
const o_punctuations = [];
const o_strings = [];
const current_timestamp = new Date();


app.post("/index.html", function(req, res){
  form = req.body.code;
  //output = req.body.token_output;
  let code=req.body.code;

    const program = form;
    //console.log(program);
    const tokens = tokenize(form);
    //console.log(`<h1>Token Output:<h1> <ul> ${tokens.map(tokens => `<li>${tokens}<li>`).join('')}</ul>`);

    for (const token of tokens){
      if(token.type === 'IDENTIFIER' && !o_identifiers.includes(token.value)){
        o_identifiers.push(token.value);
      }else if(token.type === 'KEYWORD' && !o_keywords.includes(token.value)){
        o_keywords.push(token.value);
      }else if(token.type === 'NUMBER' && !o_numbers.includes(token.value)){
        o_numbers.push(token.value);
      }else if(token.type === 'OPERATOR' && !o_operators.includes(token.value)){
        o_operators.push(token.value);
      }else if(token.type === 'PUNCTUATION' && !o_punctuations.includes(token.value)){
        o_punctuations.push(token.value);
      }else if(token.type === 'STRING' && !o_strings.includes(token.value)){
        o_strings.push(token.value);
      }
    }

    //output.value = 'Hello World!!!'

    //const output = document.getElementById('t_output');
    //console.log(output.innerHtml);

    //output.innerHtml = `Identifiers: ${o_identifiers.join(', ')} <br> Keywords: ${o_keywords.join(', ')} <br> Numbers: ${o_numbers.join(', ')} <br> Operators: ${o_operators.join(', ')} <br> Punctuations: ${o_punctuations.join(', ')} <br> Strings: ${o_strings.join(', ')}`;

    console.log("Tokens printed in the textarea");
    //console.log(tokens);
    console.log(`Identifiers: ${o_identifiers.join(', ')} <br> Keywords: ${o_keywords.join(', ')} <br> Numbers: ${o_numbers.join(', ')} <br> Operators: ${o_operators.join(', ')} <br> Punctuations: ${o_punctuations.join(', ')} <br> Strings: ${o_strings.join(', ')}`);

    insertDataIntoTable(form, o_identifiers, o_keywords, o_numbers, o_operators, o_punctuations, o_strings,code);

});





/*button.addEventListener("submit", event => {
  event.preventDefault();
  const program = form.elements["program"].value;
  const tokens = lex(program);
  console.log(`<h1>Token Outout:<h1> <ul> ${tokens.map(tokens => `<li>${tokens}<li>`).join('')}</ul>`);
});*/


/*function submit(){
  const program = form;
  console.log(program);
  //const tokens = lex(program);
  //console.log(`<h1>Token Outout:<h1> <ul> ${tokens.map(tokens => `<li>${tokens}<li>`).join('')}</ul>`);
}*/

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Compiler@2023',
  database: 'tokens_of_code'
});

function insertDataIntoTable(form, o_identifiers, o_keywords, o_numbers, o_operators, o_punctuations, o_strings,code) {

  connection.connect(function(error) {
    if (error) {
      console.error('Error connecting to the database: ' + error.stack);
      return;
    }

    console.log('Connected to the database with ID ' + connection.threadId);
  });

  //if (err) throw err;
  //console.log('Connected to MySQL database!');

  // perform a query to insert data into the database
  //const to_identifiers = o_identifiers;
  //const to_keywords = o_keywords;
  //const to_numbers = o_numbers;
  //const to_operators = o_operators;
  //const to_punctuations = o_punctuations;
  //const to_strings = o_strings;
  //const to_code = form;

  //const sql = `INSERT INTO token_table (identifiers, keywords, numbers, operators, punctuations, strings, date_and_time) VALUES (`${to_identifiers.join(',')}`, `${to_keywords.join(',')}`, `${to_numbers.join(',')}`, `${to_operators.join(',')}`, `${to_punctuations.join(',')}`, `${to_strings.join(',')}`, current_timestamp());`;
  //const values = [to_code.join(',') ,to_identifiers.join(','), to_keywords.join(','), to_numbers.join(','), to_operators.join(','), to_punctuations.join(','), to_strings.join(','), current_timestamp()];

  const sql = `INSERT INTO token_table (code, identifiers, keywords, numbers, operators, punctuations, strings, date_and_time) VALUES ('${form}', '${o_identifiers.join(',')}', '${o_keywords.join(',')}', '${o_numbers.join(',')}', '${o_operators.join(',')}', '${o_punctuations.join(',')}', '${o_strings.join(',')}', current_timestamp());`;

  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log('Data inserted into table!');


    // disconnect from the database
    /*connection.end(function(err) {
      if (err) throw err;
      console.log('Disconnected from MySQL database!');
    });*/
  });

  /*connection.connect(function(error) {
    if (error) {
      console.error('Error connecting to the database: ' + error.stack);
      return;
    }

    console.log('Connected to the database with ID ' + connection.threadId);
  });*/

  //var code = dom.window.document.querySelector('#t_input').value;
  // var code = dom?.window?.document?.getElementById('t_input').value;
  //var code = document.getElementById("t_input").value;
  console.log(code);
  const tokensTextarea = dom.window.document.getElementById("t_output");
  //tokensTextarea.value="Hello"
  const query = `SELECT identifiers, keywords, numbers, operators, punctuations, strings FROM token_table WHERE code = '${code}'`;
  connection.query(query, function(error, results, fields) {
    if (error) {
      console.error('Error fetching data from the database: ' + error.stack);
      return;
    }

    // print the tokens in the token's textarea

    if (results.length === 0) {
      tokensTextarea.value = 'No tokens found for the given code.';
    } else {
      const row = results[0];
      //console.log(row);
      const tokens = [];
      //tokens.push(...row.identifiers.split(','), ...row.keywords.split(','), ...row.numbers.split(','), ...row.operators.split(','), ...row.punctuations.split(','), ...row.strings.split(','));
      //tokensTextarea.value = tokens;
      //console.log(tokens);
      //console.log(tokensTextarea.value);
      tokens.push(...row.identifiers.split(','), ...row.keywords.split(','), ...row.numbers.split(','), ...row.operators.split(','), ...row.punctuations.split(','), ...row.strings.split(','));
      const identifierTokens = tokens.filter(token => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token) && !keywords.includes(token));
      const keywordTokens = tokens.filter(token => /^[a-zA-Z_]+$/.test(token) && !identifierTokens.includes(token));
      const numberTokens = tokens.filter(token => /^\d+$/.test(token));
      const operatorTokens = tokens.filter(token => /^[-+*/%=<>!&|^~?]+$/.test(token));
      const punctuationTokens = tokens.filter(token => /^[,.:;(){}\[\]]+$/.test(token));
      const stringTokens = tokens.filter(token => /^"[^"]*"$/.test(token));
      //const tokensTextarea = document.getElementById('tokens-textarea');







      //const keywordTokens = tokens.filter(token => /^(int|float|char|double|void)$/.test(token));
      //const numberTokens = tokens.filter(token => /^\d+$/.test(token));
      //const operatorTokens = tokens.filter(token => /^[-+*/%<>=!&|^~?]+=$/.test(token));
      //const punctuationTokens = tokens.filter(token => /^[,.:;(){}\[\]]+$/.test(token));




      tokensTextarea.value = `identifiers:${identifierTokens.join(',')}\nkeywords:${keywordTokens.join(',')}\nnumbers:${numberTokens.join(',')}\noperators:${operatorTokens.join(',')}\npunctuations:${punctuationTokens.join(',')}\nstrings:${stringTokens.join(',')}`;



      console.log(tokensTextarea.value);
    }

    // close the MySQL connection
    /*connection.end(function(error) {
      if (error) {
        console.error('Error closing the database connection: ' + error.stack);
        return;
      }

      console.log('Disconnected from the database with ID ' + connection.threadId);
    });*/
  });


}






app.post("/index.html", function(req, res){
  /*button.addEventListener("submit", event => {
    event.preventDefault();
    const program = req.body.code;
    console.log(program);
    //const tokens = lex(program);
    //console.log(`<h1>Token Outout:<h1> <ul> ${tokens.map(tokens => `<li>${tokens}<li>`).join('')}</ul>`);
  });*/
  //const t_output = document.getElementById('t_output');
  //t_output.value = `Identifiers: ${o_identifiers.join(', ')} <br> Keywords: ${o_keywords.join(', ')} <br> Numbers: ${o_numbers.join(', ')} <br> Operators: ${o_operators.join(', ')} <br> Punctuations: ${o_punctuations.join(', ')} <br> Strings: ${o_strings.join(', ')}`;

  //console.log(`Identifiers: ${o_identifiers.join(', ')} <br> Keywords: ${o_keywords.join(', ')} <br> Numbers: ${o_numbers.join(', ')} <br> Operators: ${o_operators.join(', ')} <br> Punctuations: ${o_punctuations.join(', ')} <br> Strings: ${o_strings.join(', ')}`);

  //res.send(`Identifiers: ${o_identifiers.join(', ')} <br> Keywords: ${o_keywords.join(', ')} <br> Numbers: ${o_numbers.join(', ')} <br> Operators: ${o_operators.join(', ')} <br> Punctuations: ${o_punctuations.join(', ')} <br> Strings: ${o_strings.join(', ')}`);


});



/*function fetchTokensFromDatabase(html){
  connection.connect(function(error) {
    if (error) {
      console.error('Error connecting to the database: ' + error.stack);
      return;
    }

    console.log('Connected to the database with ID ' + connection.threadId);
  });
  // fetch data from the table for the given code


}*/


/*connection.connect(function(error) {
  if (error) {
    console.error('Error connecting to the database: ' + error.stack);
    return;
  }

  console.log('Connected to the database with ID ' + connection.threadId);
});*/

/*const code = dom.window.document.querySelectorAll('#t_input').value;
console.log(code);*/
/*const codes = dom.window.document.querySelectorAll('#t_input');
var code = [];
codes.forEach((code) => {
  console.log(code.value);
});
const query = `SELECT identifiers, keywords, numbers, operators, punctuations, strings FROM token_table WHERE code = '${code}'`;
connection.query(query, function(error, results, fields) {
  if (error) {
    console.error('Error fetching data from the database: ' + error.stack);
    return;
  }

  // print the tokens in the token's textarea
  const tokensTextarea = dom.window.document.querySelectorAll('#t_output');
  if (results.length === 0) {
    tokensTextarea.value = 'No tokens found for the given code.';
  } else {
    const row = results[0];
    /*const tokens = [];
    tokens.push(...row.identifiers.split(','), ...row.keywords.split(','), ...row.numbers.split(','), ...row.operators.split(','), ...row.punctuations.split(','), ...row.strings.split(','));
    tokensTextarea.value = tokens.join('\n');*/
    /*console.log(row);
  }

  // close the MySQL connection
  connection.end(function(error) {
    if (error) {
      console.error('Error closing the database connection: ' + error.stack);
      return;
    }

    console.log('Disconnected from the database with ID ' + connection.threadId);
  });
});*/
