"use strict";

const fs = require("fs");
const path = require("path");
require('dotenv').config()

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);
const NEWLINE = "\n"
const STOP_SEQ = "<|endoftext|>"
var CONVERT = ""

let MESSAGES = [ { role: "system", content: "" }  ];


exports.submitSystem = async function (req, res, _next) {
	console.log("...............................");
	console.log("............submitSystem.............");
	console.log("...............................");

	let system = req.body.system;
	console.log("system: " + system);

	MESSAGES[0].content = system;
	console.log("DATA", MESSAGES);

	res.send({ status : "success" });
}


exports.submitPrompt = async function (req, res, _next) {
	console.log("...............................");
	console.log("............submitPrompt.............");
	console.log("...............................");

	let prompt = req.body.prompt;
	console.log("prompt: " + prompt);

	MESSAGES.push({ role: "user", content: prompt });
	MESSAGES.push({ role: "assistant", content: prompt });
	console.log("DATA", MESSAGES);

	res.send({ status: "success", completion: prompt });
}

exports.getAll = async function (req, res, _next) {

	console.log("...............................");
	console.log("............getAll.............");
	console.log("...............................");

	res.send({ 'data': MESSAGES });
};

exports.save = async function (req, res, _next) {

	console.log("...............................");
	console.log("............save.............");
	console.log("...............................");

	let suffix = req.body.suffix == null ? '' : req.body.suffix;
	console.log('Suffix:', suffix)

	// file system module to perform file operations
	const fs = require('fs');	
	if (!fs.existsSync(`./data_files/${suffix}`)) {
		fs.mkdirSync(`./data_files/${suffix}`, { recursive: true });
	}

	// stringify JSON Object
	var jsonContent = JSON.stringify(MESSAGES);

	fs.writeFile(`./data_files/${suffix}/save_output.json`, jsonContent, 'utf8', function (err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
		console.log("JSON file has been saved.");
	});
	res.send({ 'status': 'success' });
}
 
exports.restore = async function (req, res, _next) {

	console.log("...............................");
	console.log("............restore.............");
	console.log("...............................");
	console.log('API-KEY', process.env.OPENAI_API_KEY)

	let suffix = req.body.suffix == null ? '' : req.body.suffix;
	console.log('Suffix:', suffix)

	var fs = require('fs');
	MESSAGES = JSON.parse(fs.readFileSync(`./data_files/${suffix}/save_output.json`, 'utf8'));

	res.send({ 'status': 'success' });
}

exports.convert = async function (req, res, _next) {

	console.log("...............................");
	console.log("............convert.............");
	console.log("...............................");

	let suffix = req.body.suffix == null ? '' : req.body.suffix;
	console.log('Suffix:', suffix)

	var json_lines = convertv1(suffix);
	// var json_lines = convertv2(suffix);
	var fs = require('fs');
	fs.writeFileSync(`./data_files/${suffix}/conv_output_txt.jsonl`, json_lines);
	// fs.writeFileSync(`./data_files/${suffix}/conv_output.jsonl`, json_lines);

	res.send({ 'status': 'success' });
}

exports.upload = async function (req, res, _next) {

	console.log("...............................");
	console.log("............upload.............");
	console.log("...............................");

	let suffix = req.body.suffix == null ? '' : req.body.suffix;
	console.log('Suffix:', suffix)
	
	(async () => {
		const response = await openai.createFile(
			fs.createReadStream(`./data_files/${suffix}/conv_output.jsonl`),
			"fine-tune"
		  );
		  console.log(response);
		  var file_id = response.data.id
		  console.log(response.data);
		  
		  (async () => {
			  const response = await openai.createFineTune({
				  training_file: file_id,
				  model: "davinci",
				  suffix: `${suffix}_${CONVERT}`,
				});
			  console.log(response);
		  })();
		  
		  res.send({ file_id: file_id, status: 'Success' });
	})();
}
