"use strict";

const fs = require("fs");
const path = require("path");
const NEWLINE = "\n"
const STOP_SEQ = "<|endoftext|>"
var CONVERT = ""
require('dotenv').config()

let SAMPLE_DATA =
	[
		{
			summary: "",
			details: [
				{
					instruction: "None",
					prompt: "Something",
					completion: "Everything"
				}
			]
		}
	];

let DATA = [];

exports.addSummary = async function (req, res, _next) {
	console.log("...............................");
	console.log("............addSummary.............");
	console.log("...............................");

	let summary = req.body.summary;
	console.log("summary: " + summary);

	DATA.push({ summary: summary, details: [] });

	console.log("DATA", DATA);
	res.send({ "index": DATA.length });
}

exports.updateSummary = async function (req, res, _next) {
	console.log("...............................");
	console.log("............updateSummary.............");
	console.log("...............................");

	let summary = req.body.summary;
	let index = req.body.index;
	console.log("summary: " + summary);
	console.log("index: " + index);

	DATA[index - 1].summary = summary;

	console.log("DATA", DATA);
	res.send({ "index": index });
}

exports.addDetails = async function (req, res, _next) {
	console.log("...............................");
	console.log("............addDetails.............");
	console.log("...............................");


	let instruction = req.body.instruction;
	let prompt = req.body.prompt;
	let completion = req.body.completion;
	let index = req.body.index;

	console.log("instruction: " + instruction);
	console.log("prompt: " + prompt);
	console.log("completion: " + completion);

	if (DATA.length < (index - 1) || index == undefined || index == null) {
		console.log('Details cannot be added... index issue...')
		return;
	}

	DATA[index - 1].details.push({
		instruction: instruction,
		prompt: prompt,
		completion: completion,
	})

	console.log("DATA", DATA);
	res.send({ "result": "success" });
}

exports.updateDetails = async function (req, res, _next) {
	console.log("...............................");
	console.log("............updateDetails.............");
	console.log("...............................");


	let instruction = req.body.instruction;
	let prompt = req.body.prompt;
	let completion = req.body.completion;
	let summary_index = req.body.summary_index;
	let index = req.body.index;

	console.log("instruction: " + instruction);
	console.log("prompt: " + prompt);
	console.log("completion: " + completion);
	console.log("index: " + index);
	console.log("summary_index: " + summary_index);

	DATA[summary_index - 1].details[index - 1] = {
		instruction: instruction,
		prompt: prompt,
		completion: completion
	}

	console.log("DATA", DATA);
	res.send({ "result": "success" });
}

exports.getAll = async function (req, res, _next) {

	console.log("...............................");
	console.log("............getAll.............");
	console.log("...............................");

	res.send({ 'data': DATA });
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
	var jsonContent = JSON.stringify(DATA);

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
	DATA = JSON.parse(fs.readFileSync(`./data_files/${suffix}/save_output.json`, 'utf8'));

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

function convertv2() {
	
	CONVERT = "convertv2"

	var json_lines = ''
	for (var i = 0; i < DATA.length; i++) {
		var element = DATA[i]
		var conversations = ''
		var j=0;
		for (; j < element.details.length-1; j++) {
			var detail_element = element.details[j];
			conversations += `${NEWLINE}${NEWLINE}User:${NEWLINE}${NEWLINE}${detail_element.prompt}${STOP_SEQ}${NEWLINE}${NEWLINE}ChatGPT:${NEWLINE}${NEWLINE}${detail_element.completion}${STOP_SEQ}`
		}
		var detail_element = element.details[j];
		var summary = element.summary //.replace(/\n/g, '\\n').replace(/"/g, '\\"');
		var prompt = detail_element.prompt //.replace(/\n/g, '\\n').replace(/"/g, '\\"');
		prompt = `User:${NEWLINE}${NEWLINE}${prompt}${STOP_SEQ}${NEWLINE}${NEWLINE}`
		var completion  = detail_element.completion //.replace(/\n/g, '\\n').replace(/"/g, '\\"');
		conversations = conversations //.replace(/\n/g, '\\n').replace(/"/g, '\\"');

		var jsonl = `{"prompt":"Instructions:${NEWLINE}${summary}${STOP_SEQ}${conversations}${NEWLINE}${NEWLINE}${prompt}ChatGPT:${NEWLINE}", "completion":" ${completion}${NEWLINE}"}`
		jsonl = jsonl.replace(/\n/g, '\\n');
		json_lines += (jsonl + NEWLINE)
	}
	console.log('jsonl', json_lines);

	return json_lines;
}

function convertv1() {

	CONVERT = "convertv1"
	var json_lines = ''
	for (var i = 0; i < DATA.length; i++) {
		var element = DATA[i]
		var conversations = ''
		for (var j = 0; j < element.details.length; j++) {
			var detail_element = element.details[j];
			
			var prompt = `${element.summary}\n\nSpecific information: ${detail_element.instruction} ${NEWLINE}${NEWLINE}####${NEWLINE}${conversations}${STOP_SEQ}${NEWLINE}`
			var completion  = `${detail_element.completion}`
			// prompt = prompt.replace(/\n/g, '\\n').replace(/"/g, '\\"');
			// completion = completion.replace(/\n/g, '\\n').replace(/"/g, '\\"');

			json_lines += `{"prompt":"Summary: ${prompt}You:${STOP_SEQ}${NEWLINE}", "completion":" ${completion}"}${NEWLINE}`
			// json_lines += `{"prompt":"Summary: ${element.summary}\n\nSpecific information: ${detail_element.instruction} \n\n###\n\n${conversations}You: -->", "completion":" ${detail_element.completion}${NEWLINE}"${NEWLINE}`
			conversations += `Customer: ${detail_element.prompt}${STOP_SEQ}${NEWLINE}You: ${detail_element.completion}${STOP_SEQ}${NEWLINE}`
		}
	}
	console.log('jsonl', json_lines);

	return json_lines;
}


exports.upload = async function (req, res, _next) {

	console.log("...............................");
	console.log("............upload.............");
	console.log("...............................");

	let suffix = req.body.suffix == null ? '' : req.body.suffix;
	console.log('Suffix:', suffix)

	const fs = require("fs");
	const { Configuration, OpenAIApi } = require("openai");
	console.log('API-KEY', process.env.OPENAI_API_KEY)
	
	const configuration = new Configuration({
	  apiKey: process.env.OPENAI_API_KEY //"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",
	});
	const openai = new OpenAIApi(configuration);
	
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
