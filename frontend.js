
$(document).ready(function () {
    updateTable()
});

function convertString(originalString) {
    return originalString
    .replace(/\\/g, '\\\\')  // Escape backslashes first to avoid double escaping
    .replace(/'/g, "\\'")    // Escape single quotes
    .replace(/"/g, '\\"')    // Escape double quotes
    .replace(/\n/g, '\\n');  // Escape newline characters
}

function updateTable() {
    $.get("/getAll", function (data, status) {

        var DATA = data.data;
        var tr_element = ''
        for (var i = 0; i < DATA.length; i++) {
            var element = DATA[i]
            var table_ = ''
            for (var j = 0; j < element.details.length; j++) {
                var detail_element = element.details[j];
                table_ += `
                    <tr>
                        <td> <a href="#" onclick="editDetails('${detail_element.instruction}', '${detail_element.prompt}', '${detail_element.completion}', ${i + 1},  ${j + 1})">  ${detail_element.instruction} </a> </td>
                        <td> ${detail_element.prompt} </td>
                        <td> ${detail_element.completion} </td>
                    </tr>
                `
            }
            tr_element += `
            <tr>
                <td> <a href="#" onclick="editSummary('${element.summary.replace(/'/g, "\\'").replace(/\n/g, '\\n')}', ${i + 1} )"> ${element.summary} </a> </td>
                <td> <table> ${table_} </table> </td>
            </tr>
            `
        }
        $('#table').html(`<table>${tr_element} </table>`);
    });
}

function editSummary(summary, index) {

    console.log('Edit summary', summary)

    $('#sumary').val(summary);
    $('#summary_index').html(index);
}

function editDetails(instruction, prompt, completion, summary_index, index) {
    $('#instruction').val(instruction);
    $('#prompt').val(prompt);
    $('#completion').val(completion);
    $('#summary_index').html(summary_index);
    $('#detail_index').html(index);
}

function submitSummary() {
    var summary = $('#sumary').val();

    $.post('/addSummary',
        { summary: summary }, // data to be submit
        function (data, status, jqXHR) {// success callback
            console.log(data)
            $('#summary_index').html(data.index);
            updateTable();
        })
}
 

function updateSummary() {
    var summary = $('#sumary').val();

    $.post('/updateSummary',
        {
            summary: summary,
            index: $('#summary_index').html()
        }, // data to be submit
        function (data, status, jqXHR) {// success callback
            console.log(data)
            $('#summary_len').html(data.index);
            updateTable();
        })
}

function submitDetails() {
    var instruction = $('#instruction').val();
    var prompt = $('#prompt').val();
    var completion = $('#completion').val();
    var index = $('#summary_index').html()

    $.post('/addDetails',
        {
            instruction: instruction,
            prompt: prompt,
            completion: completion,
            index: index
        },
        // data to be submit
        function (data, status, jqXHR) { // success callback
            console.log(data)
            updateTable();
        })
}

function updateDetails() {
    var instruction = $('#instruction').val();
    var prompt = $('#prompt').val();
    var completion = $('#completion').val();
    var summary_index = $('#summary_index').html()
    var index = $('#detail_index').html()

    $.post('/updateDetails',
        {
            instruction: instruction,
            prompt: prompt,
            completion: completion,
            summary_index: summary_index,
            index: index,
        },
        // data to be submit
        function (data, status, jqXHR) { // success callback
            console.log(data)
            updateTable();
        })
}

function checkSuffix(suffix) {
    if(suffix == null || suffix == '' || suffix == undefined) {
        alert('Need Proper Suffix / Fine-Tune Name to proceed')
        return true;
    }
    return false;
}

function save() {
    var suffix = $('#suffix').val();
    if(checkSuffix(suffix)) return;
    
    $.post('/save',
        { suffix : suffix },
        // data to be submit
        function (data, status, jqXHR) { // success callback
            console.log(data)
            var date = new Date();
            $('#save_status').html('Saved - ' + date.toLocaleTimeString());
        })
}

function restore() {
    var suffix = $('#suffix').val();
    if(checkSuffix(suffix)) return;

    $.post('/restore',
        { suffix : suffix },
        // data to be submit
        function (data, status, jqXHR) { // success callback
            console.log(data)
            var date = new Date();
            $('#save_status').html('Restored - ' + date.toLocaleTimeString());
            updateTable();
        })
}

function convert() {
    var suffix = $('#suffix').val();
    if(checkSuffix(suffix)) return;

    $.post('/convert',
        { suffix : suffix },
        // data to be submit
        function (data, status, jqXHR) { // success callback
            console.log(data)
            var date = new Date();
            $('#save_status').html('Convert Done - ' + date.toLocaleTimeString());
            updateTable();
        })
}

function upload() {
    var suffix = $('#suffix').val();
    if(checkSuffix(suffix)) return;

    $.post('/upload',
        { suffix : suffix },
        // data to be submit
        function (data, status, jqXHR) { // success callback
            console.log(data)
            $('#save_status').html(`Upload Status ${data.status} - FileID: ${data.file_id}`);
        })
}

function refresh() {
    updateTable();
}