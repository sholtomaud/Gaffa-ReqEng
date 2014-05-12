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
      
      fs.unlink(app, function (err) {
        if (err) throw err;
        console.log('successfully deleted ['+app+']');
      });
              
      var fileStream = fs.createReadStream(csvFileName);

      //new converter instance
      var csvConverter = new Converter({constructResult:true});
      var pageArray = new Array;

      //end_parsed will be emitted once parsing finished
      csvConverter.on("end_parsed",function(jsonObj){
		  
		  fs.appendFile(json, JSON.stringify(jsonObj), function (err) {
      	if (err) throw err;
			});
		  
      //label,type,class,rows,cols,postLabel,placeholder,maxLength,size,required,validation,lookups,binding,comment

	
        //module export
        pageArray.push('module.exports = function(app){');
        pageArray.push('var views = app.views;');
        pageArray.push('var action = app.actions;');
        pageArray.push('var behaviours = app.behaviours;');
        
        //function
        pageArray.push(' function createForm(){');
        //pageArray.push('   var formPage = new views.Form();');
        
    
			//jsonObj.forEach(function(key) {
      //  fs.appendFile(page, 'var ' + key.label.replace(/\s/g, '') + ' = new views.Label();\n', function (err) {
      //  	if (err) throw err;
		//		});
		//	});
      
        //Array for field container
        var fieldArray = new Array;
        

        jsonObj.forEach(function(key) {
          var normalisedLabel = key.label.replace(/\s|\(|\)|\/|\?|\\/g, '');
          
          //var for label 
          var label = normalisedLabel + 'Label';
          pageArray.push('  var ' + label +' = new views.Label();');
          
           
          //var for inputType (textbox,dropdown etc)
          var inputType = normalisedLabel + ucfirst(key.type);
          
          if (key.type.toLowerCase() == 'date'){
            pageArray.push('  var ' + inputType + ' = new views.Textbox();');
            pageArray.push('  ' + inputType + '.type.value = \'date\'');
            
          }
          else if ( key.type.toLowerCase() == 'radio'){
            pageArray.push('  var ' + inputType + ' = new views.'+ucfirst(key.type)+'();');
          }
          else{
            pageArray.push('  var ' + inputType + ' = new views.'+ucfirst(key.type)+'();');
          }
          
          if ('undefined' !== typeof key.binding && key.binding !== '' && key.binding !== ' ' ) {
            pageArray.push('  ' + inputType + '.value.binding = \'['+ key.binding +']\''); //'[basin]';
          }
          
          if ('undefined' !== typeof key.size && key.size !== '' && key.size !== ' ' && key.type !== 'select') {
            var size = Number(key.size);
            size = size + 2;
            pageArray.push('  ' + inputType + '.size.value = '+ size +';');
          }
          
          if ( key.type.toLowerCase() == 'select' ){ //Create select box options
            var options = key.options.split(',');
            pageArray.push('  ' + inputType + '.options.value = [\''+options.join("','")+'\'];');
          }
          
          if ( key.type.toLowerCase() == 'textarea' ){ //Create select box options
            pageArray.push('  ' + inputType + '.cols.value = '+key.cols+';');
            pageArray.push('  ' + inputType + '.rows.value = '+key.rows+';');
          }
          
          
          //set label text value
          var labelText = '\'' + key.label + '\'';
          pageArray.push( '  ' + label + '.text.value = '+ labelText+';' );
          
          //set maxLength text value
          if ('undefined' !== typeof key.maxLength && key.maxLength !== '' && key.maxLength !== ' ' && key.type.toLowerCase() !== 'select') {
            pageArray.push('  ' + inputType + '.maxLength.value = '+key.maxLength +';');
          }
          
          //set postLabel text value
          if ('undefined' !== typeof key.postLabel && key.postLabel !== '' && key.postLabel !== ' ') {
            var pstLabel = normalisedLabel + 'PostLabel';
           
            pageArray.push('  var ' + pstLabel +' = new views.Label();');
            var postLabelText = '\'' + key.postLabel + '\'';
            pageArray.push( '  ' + pstLabel + '.text.value = '+ postLabelText+';' );
            
            //set pstLabel classes
            var inputlabelClasses = '\''+ key.classes +'\'';
            pageArray.push( '  ' + pstLabel + '.classes.value = \'postlab\';\n');
          }
          
          //set label classes
          var inputlabelClasses = '\''+ key.classes +'\'';
          pageArray.push( '  ' + label + '.classes.value = \'fldname\';\n');
          
          //set input classes
          var inputClasses = '\''+ key.classes +'\'';
          pageArray.push( '  ' + inputType + '.classes.value = ' + inputClasses +';\n');
          
          var fieldContainer = label + 'Container';
          pageArray.push('  var ' + fieldContainer + ' = new views.Container();');
          pageArray.push('  ' + fieldContainer + '.views.content.add([');
          pageArray.push('    ' + label + ',');
          pageArray.push('    ' + inputType + ',');
          if ('undefined' !== typeof key.postLabel && key.postLabel !== '' && key.postLabel !== ' ') { pageArray.push('    ' + pstLabel + ',') };
          pageArray.push('  ]);\n');
          pageArray.push('  ' + fieldContainer +'.classes.value = \'field\'');
          fieldArray.push(fieldContainer);
          
        });
        
        //add to page view
        pageArray.push('   var formTemplate = new views.Container();');
        
        var formTemplate = new Array;
        pageArray.push('    formTemplate.views.content.add([');
        
        var fieldArrayLength = fieldArray.length;
        for (var i = 0; i < fieldArrayLength; i++) {
            var container;
            if (i == (fieldArrayLength-1)){
              container = fieldArray[i];
            }
            else{
              container = fieldArray[i] +',';
            }
            pageArray.push('      ' + container);
        }
        
        pageArray.push('    ]);\n  formTemplate.path = \'[/form]\';');
        
        pageArray.push('    return formTemplate;');
        pageArray.push('  }'); //end function
        
        pageArray.push('function createView(){');
        pageArray.push('var appView = new views.Container();');

        pageArray.push('appView.views.content.add([');
            //createHeader(),
        pageArray.push('  createForm(),');
            //stickyFooter()
        pageArray.push(']);');

        pageArray.push('appView.classes.value = \'app\';');
        //pageArray.push('appView.behaviours = createAppBehaviours();');

        pageArray.push('return appView;');
        pageArray.push('}');//end createView()
        
        pageArray.push('return createView;');
        pageArray.push('}'); //end module
/*        
        pageArray.push('  formTemplate.views.content.add([');
        
        jsonObj.forEach(function(key) {
          var label = key.label.replace(/\s/g, '') + 'Label';
          pageArray.push('    ' + label +',');
          
          var type = key.label.replace(/\s/g, '') + key.type;
          pageArray.push('    ' + type + ',');
          
        });

        pageArray.push('  ]);\n  formTemplate.path = \'[/form]\';');
        
        pageArray.push('}');
  
        pageArray.push(fieldArray);
        pageArray.push(formTemplateArray);
        
*/  
        fs.appendFile(
           app ,
           //pageArray.map(function(v){ return v.join(', ')).join('\n'),
           pageArray.join('\n'),
           function (err) { console.log(err ? 'Error :' + err : 'ok - writeFile ['+app+']') }
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

        
      });

      //read from file
      fileStream.pipe(csvConverter);
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

function writePage(){
  
		  
  /*
	fs.unlink(page, function (err) {
    if (err) throw err;
    console.log('successfully deleted ['+page+']');
  });
  
  
  fs.unlink(json, function (err) {
    if (err) throw err;
    console.log('successfully deleted ['+json+']');
  });
  */
  
      
      fs.appendFile(page, 'function createForm(){\n  var formPage = new views.Form();\n', function (err) {
      	if (err) throw err;
			});
      
      jsonObj.forEach(function(key) {
        fs.appendFile(page, '  var ' + key.label.replace(/\s/g, '') + 'Label = new views.Label();\n  var ' + key.label.replace(/\s/g, '') + key.type + ' = new views.'+key.type+'();\n\n', function (err) {
        	if (err) throw err;
				});
       });
       
			jsonObj.forEach(function(key) {
        fs.appendFile(page, key.label.replace(/\s/g, '') + '.text.value = \''+ key.label +'\';\n' + key.label.replace(/\s/g, '') + '.classes.value = \''+ key.classes +'\';\n\n', function (err) {
        	if (err) throw err;
				});
      });
      
      fs.appendFile(page, '  formPage.views.content.add([\n', function (err) {
      	if (err) throw err;
			});
      
      
      
		  jsonObj.forEach(function(key) {
        
        fs.appendFile(page, key.label.replace(/\s/g, '') + 'Label,\n' + key.label.replace(/\s/g, '') + key.type + ',\n', function (err) {
        	if (err) throw err;
				});
      });
		  fs.appendFile(page, '  ]);\n  formPage.path = \'[/form]\';', function (err) {
      	if (err) throw err;
			});

}

function ucfirst(str) {
  var firstLetter = str.slice(0,1);
  return firstLetter.toUpperCase() + str.substring(1).toLowerCase();
}

	runApp();

/*
  
*/  