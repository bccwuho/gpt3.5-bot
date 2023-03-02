
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
        var tr_element = `
            <tr>
                <td colspan=2>
                ${ DATA[0].content }
                </td>
        `
        for (var i = 1; i < DATA.length;) {
            var element = DATA[i]
            var table_ = ''
            tr_element += `
            <tr>
                <td> ${ DATA[i++].content } </td>
                <td> ${ DATA[i++].content } </td>
            </tr>
            `
        }
        $('#table').html(`<table>${tr_element} </table>`);
    });
}

function submitPrompt() {
    var prompt = $('#prompt').val();

    $.post('/submitPrompt',
        { prompt: prompt }, // data to be submit
        function (data, status, jqXHR) {// success callback
            console.log('submitPrompt:', data.status)
            updateTable();
            $('#completion').html(data.completion);
        })
}
    
function submitSystem() {
    var system = $('#system').val();

    $.post('/submitSystem',
        { system: system }, // data to be submit
        function (data, status, jqXHR) {// success callback
            console.log('submitSystem:', data.status)
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