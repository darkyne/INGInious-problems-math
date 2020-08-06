var homepath = "";

function load_input_math(submissionid, key, input) {
    var field = $("form#task input[name='" + key + "']");
    $("#math-fields-" + key).html("");
    if(key in input) {
        $.each(input[key], function(index) {
            math_add_answer(key, this);
        });
    } else {
        math_add_answer(key, '');
    }
}

function studio_init_template_math(well, pid, problem)
{
    var tolerance = "";
    var success_message = "";
    var error_message = "";
    var hints = "";
    if("tolerance" in problem)
        tolerance = problem["tolerance"];
    if("success_message" in problem)
        success_message = problem["success_message"];
    if("error_message" in problem)
        error_message = problem["error_message"];
    if("hints" in problem)
        hints = problem["hints"];
    if("answer" in problem) // retrocompat
        problem["answers"] = [problem["answer"]]

    $("#tolerance-" + pid).val(tolerance);
    registerCodeEditor($('#success_message-' + pid)[0], 'rst', 1).setValue(success_message);
    registerCodeEditor($('#error_message-' + pid)[0], 'rst', 1).setValue(error_message);
    registerCodeEditor($('#hints-' + pid)[0], 'rst', 1).setValue(hints);

    jQuery.each(problem["choices"], function(index, elem) {
        math_create_choice(pid, elem);
    });

    jQuery.each(problem["answers"], function(index, elem) {
        math_create_answer(pid, elem);
    });
}

function load_feedback_math(key, content) {
    var alert_type = "danger";
    if(content[0] === "timeout" || content[0] === "overflow")
        alert_type = "warning";
    if(content[0] === "success")
        alert_type = "success";
    $("#task_alert_" + key).html(getAlertCode("", content[1], alert_type, true));
}

function math_create_choice(pid, choice_data) {
    var well = $(studio_get_problem(pid));

    var index = 0;
    while($('#choice-' + index + '-' + pid).length != 0)
        index++;

    var row = $("#subproblem_math_choice").html();
    var new_row_content = row.replace(/PID/g, pid).replace(/CHOICE/g, index);
    var new_row = $("<div></div>").attr('id', 'choice-' + index + '-' + pid).html(new_row_content);
    $("#choices-" + pid, well).append(new_row);

    var editor_answer = new MathEditor("problem[" + pid + "][choices][" + index + "][answer]");
    var editor_feedback = registerCodeEditor($(".subproblem_math_feedback", new_row)[0], 'rst', 1);

    if("answer" in choice_data)
        editor_answer.setLatex(choice_data["answer"]);
    if("feedback" in choice_data)
        editor_feedback.setValue(choice_data["feedback"]);
}

function math_delete_choice(pid, choice)
{
    $('#choice-' + choice + '-' + pid).detach();
}

function math_create_answer(pid, choice_data) {
    var well = $(studio_get_problem(pid));

    var index = 0;
    while($('#answer-' + index + '-' + pid).length != 0)
        index++;

    var row = $("#subproblem_math_answer").html();
    var new_row_content = row.replace(/PID/g, pid).replace(/CHOICE/g, index);
    var new_row = $("<div></div>").attr('id', 'answer-' + index + '-' + pid).html(new_row_content);
    $("#answers-" + pid, well).append(new_row);

    var editor_answer = new MathEditor("problem[" + pid + "][answers][" + index + "]");
    editor_answer.setLatex(choice_data);
}

function math_delete_answer(pid, choice)
{
    $('#answer-' + choice + '-' + pid).detach();
}

function math_add_answer(pid, data) {
    var index = 0;
    while($('#math-field-' + index + '-' + pid).length != 0)
        index++;

    var div = $("<div></div>");
    var del_btn = $("<button></button>").attr("type", "button")
        .attr("class", "close")
        .attr("onclick", "$(this).parent().remove();");
    del_btn.html('<span>&times;</span>');
    var math_field = $("<div></div>").attr('id', 'math-field-' + index + '-' + pid);
    var math_input = $("<input></input>").attr('id', 'math-input-' + index + '-' + pid)
        .attr("name", pid)
        .attr("type", "hidden");
    div.append(del_btn).append(math_field).append(math_input);
    $("#math-fields-" + pid).append(div);

    var editor_answer = new MathEditor(index + "-" + pid);
    editor_answer.setLatex(data);
}

$( document ).ready(function() {
    $(".math_modal").on('show.bs.modal', function (e) {
        var button = $(e.relatedTarget); // Button that triggered the modal
        var courseid = button.data('courseid');
        var taskid = button.data('taskid');
        var problemid = button.data('problemid');

        $.ajax({
            url: homepath + '/plugins/math/hint',
            type: 'post',
            data: {courseid: courseid, taskid: taskid, problemid: problemid},
            success: function(response){
                // Add response in Modal body
                $('.math_modal_' + problemid + ' .modal-body').html(response);
                MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
            }
        });
    })
});