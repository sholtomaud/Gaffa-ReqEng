//Copyright (C) 2014 Sholto Maud

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


var xlsxj = require("xlsx-to-json"),
Converter = require("csvtojson").core.Converter,
fs = require("fs"),
inquirer = require("inquirer"),
glob = require("glob"),
page = './pages/output.js',
page2 = './pages/pageOut.js',
json = './json/json.json';

console.log("Generate Gaffa code from .csv requirements file");


function getForm(){

	var formJSON ={};

	fs.unlink(page, function (err) {
    if (err) throw err;
    console.log('successfully deleted ['+page+']');
  });
  
  fs.unlink(page2, function (err) {
    if (err) throw err;
    console.log('successfully deleted ['+page2+']');
  });
  
  fs.unlink(json, function (err) {
    if (err) throw err;
    console.log('successfully deleted ['+json+']');
  });
  
  
  glob("*.csv", function (err,files){
			
	var questions = [
		{
			type: "input",
	    name: "appName",
	    message: "What is the name of your page?",
	  },
		{
			type: "list",
	    name: "file",
	    message: "What .csv file would you like to use??",
	    choices: files,
	    when: function( answers ) {
	      return answers.comments !== "Nope, all good!";
	    }
	}];	
	
	inquirer.prompt(questions, function( selected ) {
	  // Use user feedback for... whatever!!
	  //console.log("\nReturn:");
	  //  console.log(JSON.stringify(selected,null, "  "));


		var csvFileName = selected.file;
		var app = './pages/' + selected.appName + '.js';
		
           
		var fileStream = fs.createReadStream(csvFileName);

		//new converter instance
		var csvConverter = new Converter({constructResult:true});

    var pageArray = new Array;

		//end_parsed will be emitted once parsing finished
		csvConverter.on("end_parsed",function(jsonObj){
		  //console.log(jsonObj); //here is your result json object
			
			//console.log('jsonObj end'); //here is your result json object
			//console.log(jsonObj); //here is your result json object

		  fs.appendFile(json, JSON.stringify(jsonObj), function (err) {
      	if (err) throw err;
			});
		  
      
      
      //label,type,class,rows,cols,postLabel,placeholder,maxLength,size,required,validation,lookups,binding,comment

		  fs.appendFile(page, 'function createForm(){\n  var formPage = new views.Form();\n', function (err) {
      	if (err) throw err;
			});
	
      pageArray.push('function createForm(){\n  var formPage = new views.Form();\n');
    
			//jsonObj.forEach(function(key) {
      //  fs.appendFile(page, 'var ' + key.label.replace(/\s/g, '') + ' = new views.Label();\n', function (err) {
      //  	if (err) throw err;
		//		});
		//	});

			jsonObj.forEach(function(key) {
        fs.appendFile(page, '  var ' + key.label.replace(/\s/g, '') + 'Label = new views.Label();\n  var ' + key.label.replace(/\s/g, '') + key.type + ' = new views.'+key.type+'();\n\n', function (err) {
        	if (err) throw err;
				});
        
        pageArray.push('  var ' + key.label.replace(/\s/g, '') + 'Label = new views.Label();\n  var ' + key.label.replace(/\s/g, '') + key.type + ' = new views.'+key.type+'();\n\n');
        
			});

			jsonObj.forEach(function(key) {
        fs.appendFile(page, key.label.replace(/\s/g, '') + '.text.value = \''+ key.label +'\';\n' + key.label.replace(/\s/g, '') + '.classes.value = \''+ key.classes +'\';\n\n', function (err) {
        	if (err) throw err;
				});
        
        pageArray.push(key.label.replace(/\s/g, '') + '.text.value = \''+ key.label +'\';\n' + key.label.replace(/\s/g, '') + '.classes.value = \''+ key.classes +'\';\n');
			});

      
      
      
		  fs.appendFile(page, '  formPage.views.content.add([\n', function (err) {
      	if (err) throw err;
			});
      pageArray.push('  formPage.views.content.add([\n');
      
      
		  jsonObj.forEach(function(key) {
        fs.appendFile(page, key.label.replace(/\s/g, '') + 'Label,\n' + key.label.replace(/\s/g, '') + key.type + ',\n', function (err) {
        	if (err) throw err;
				});
        
        pageArray.push(key.label.replace(/\s/g, '') + 'Label,\n' + key.label.replace(/\s/g, '') + key.type + ',\n');
        
			});

		  fs.appendFile(page, '  ]);\n  formPage.path = \'[/form]\';', function (err) {
      	if (err) throw err;
			});
      
      pageArray.push('  ]);\n  formPage.path = \'[/form]\';');
      
      
      fs.writeFile(
         page2 ,
         //pageArray.map(function(v){ return v.join(', ')).join('\n'),
         pageArray.join('\n'),
         function (err) { console.log(err ? 'Error :' + err : 'ok - writeFile ['+page2+']') }
      );
      
      
      
      


/*
			var select = new views.Select();
        	var someArray = ['a','b','c'];

			
        	select.options.value = someArray;
        
        
        pageTitle.classes.value = 'subHead';
        pageTitle.text.value = 'Ground Water Monitoring Field Form';
        
        	
        	jobName.classes.value = 'input';
        	

        	jobName.value.binding = '[jobName]';
  */                  





			//fs.writeFile(app, JSON.stringify(jsonObj) , function (err) {
			fs.writeFile(app, JSON.stringify(jsonObj) , function (err) {
			  if (err) throw err;
			  console.log(selected.appName + ' saved to /pages/ folder');
			});

			formJSON = jsonObj;

			
			
			
		});

		//read from file
		fileStream.pipe(csvConverter);
		


	/*
		xlsxj({
		    input: selected.file, 
		    output: null
		  }, function(err, result) {
		    if(err) {
		      console.error(err);
		    }else {
		      console.log(result);
		    }
		 });
	*/

		});
	});

	return formJSON;
}


function runApp(){

	var formJSON = getForm();
	//console.log('formJSON');
	//console.log(formJSON);

/*
fs.writeFile(app,JSON.stringify(jsonObj), function (err) {
			  if (err) throw err;
			  console.log(selected.appName + ' saved to /pages/ folder');
			});

*/

}


	runApp();

/*
  
*/  