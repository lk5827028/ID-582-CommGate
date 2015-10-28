// Globals
var accounts;

var get_accounts = function () {
    var api2_call = {
        "cpanel_jsonapi_version": 2,
        "cpanel_jsonapi_module": "CommuniGate",
        "cpanel_jsonapi_func": "AccountsOverview"
    };
    // callback
    var success = function (res) {
	$("#load_accounts_status_bar").html("").slideUp("slow");
	$("#add_status_bar").removeClass("status_bar_success status_bar_error").html("").slideUp("slow");
	var data = JSON.parse(res);
	accounts = Object.keys(data.cpanelresult.data[0].accounts).map(function(k) { return data.cpanelresult.data[0].accounts[k] });
	var html = new EJS({url: 'accounts_table.ejs'}).render({"accounts": accounts});
	$("#accounts_table").html(html);
	load_events();	
	search_accounts();
    };
    // send the request
    $.ajax({
	    type: "GET",
		url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
		success: success
	});
};
$("#load_accounts_status_bar").hide().html(CPANEL.icons.ajax + " Loading...").slideDown("slow");
get_accounts();

var initialize_new_email_validators = function() {
    ADD_EMAIL_VALID = new CPANEL.validate.validator("Account Name");
    ADD_EMAIL_VALID.add("add_email_account", "local_part_email(%input%, 'cpanel')", "This is not a valid email");
    ADD_EMAIL_VALID.add("add_email_account", "max_length(%input%, 128)", "Max length is 128 digits");
    ADD_EMAIL_VALID.attach();

    var password1 = "add_email_password1";
    var password2 = "add_email_password2";

    // add validation
    CHANGE_PASSWORD1_VALIDATION = new CPANEL.validate.validator("Add Account");
    CHANGE_PASSWORD1_VALIDATION.add(password1, verify_password_strength, LOCALE.maketext('Password strength must be at least [numf,_1].', REQUIRED_PASSWORD_STRENGTH));
    CHANGE_PASSWORD1_VALIDATION.add(password1, 'no_chars(%input%, " ")', CPANEL.lang.password_validator_no_spaces);
    CHANGE_PASSWORD1_VALIDATION.attach();
		    
    CHANGE_PASSWORD2_VALIDATION = new CPANEL.validate.validator(CPANEL.lang.passwords_match);
    CHANGE_PASSWORD2_VALIDATION.add(password2, "equals('" + password1 + "', '" + password2 + "')", CPANEL.lang.password_validator_no_match);
    CHANGE_PASSWORD2_VALIDATION.attach();

    // initialize the password bar
    CHANGE_PASSWORD_BAR = new CPANEL.password.strength_bar("password_strength");
    CHANGE_PASSWORD_BAR.attach(password1, function() {
	    CHANGE_PASSWORD1_VALIDATION.verify();
	});
};
initialize_new_email_validators();
$("#add_email_create").click(function() {
	create_account();
    });		    
$("#create_strong_password_add_email").click(function() {
	create_strong_password_add_email();
    });		    

var create_account = function(account_id) {
    // check the validation
    ADD_EMAIL_VALID.verify();
    CHANGE_PASSWORD1_VALIDATION.verify();
    CHANGE_PASSWORD2_VALIDATION.verify();
    var error_messages = [];
    if (ADD_EMAIL_VALID.is_valid() == false) error_messages.push(ADD_EMAIL_VALID.error_messages());
    if (CHANGE_PASSWORD1_VALIDATION.is_valid() == false) error_messages.push(CHANGE_PASSWORD1_VALIDATION.error_messages());
    if (CHANGE_PASSWORD2_VALIDATION.is_valid() == false) error_messages.push(CHANGE_PASSWORD2_VALIDATION.error_messages());

    // if the validation is good submit the password to be changed
    if (error_messages.length === 0) {
        // create the API variables
	var email = $("#add_email_account").val();
	var domain = $("#add_email_domain").find(":selected").text();
	var password = $("#add_email_password1").val();
	var quota = 250;

	// create the API call
	var api2_call = {
	    cpanel_jsonapi_version: 2,
	    cpanel_jsonapi_module: "Email",
	    cpanel_jsonapi_func: "addpop",
	    email: email,
	    password: password,
	    quota: quota,
	    domain: domain
	};

        var success = function(res) {
            // reset the input form
            reset_add_account_form();
	    
            // parse the JSON
	    var data = JSON.parse(res);
	    
            // success
            if (data.cpanelresult.data && (data.cpanelresult.data[0].result == 1)) {
		$("#add_status_bar").removeClass("status_bar_error").addClass("status_bar_success").hide().html("Account <strong>" + api2_call.email + "@" + api2_call.domain  + " </strong>successfully created! Refreshing table, please wait... " + CPANEL.icons.ajax).slideDown();
		get_accounts();
		$("#search_input").val(api2_call.email + "@" + api2_call.domain);
                return;
            }

            // failure
            if (data.cpanelresult.data && (data.cpanelresult.data[0].result == 0)) {
		$("#add_status_bar").removeClass("status_bar_success").addClass("status_bar_error").hide().html("Error: " + data.cpanelresult.data[0].reason).slideDown("slow");
                return;
            }

            // unknown?
            var error = data.cpanelresult.error || LANG.unknown_error;
	    $("#add_status_bar").removeClass("status_bar_success").addClass("status_bar_error").hide().html("Error: " + error).slideDown("slow");
        };

    	// send the request
    	$("#add_status_bar").hide().removeClass("status_bar_success status_bar_error").html(CPANEL.icons.ajax + " Loading...").slideDown("slow");
    	$.ajax({
    		type: "GET",
    		    url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
    		    success: success
    		    });
    }
};

function reset_add_account_form () {
    $("#add_email_account").val("");
    $("#add_email_password1").val("");
    $("#add_email_password2").val("");

    // clear validation
    $(".validation_errors_li").each(function() {
	    $(this).remove();
	});
    $(".validation_errors_div").each(function() {
	    $(this).remove();
	});

    // set the password bar to 0
    CPANEL.password.show_strength_bar("password_strength", 0);
};

function create_strong_password_add_email (account_id) {
    CPANEL.password.generate_password(function(password) {
	    $("#add_email_password1").val(password);
	    $("#add_email_password2").val(password);
	    CHANGE_PASSWORD_BAR.check_strength("add_email_password1", function() {
		    CHANGE_PASSWORD1_VALIDATION.verify()
			});
	    CHANGE_PASSWORD2_VALIDATION.verify();
	});
};

function create_strong_password (account_id) {
    CPANEL.password.generate_password(function(password) {
	    $("#change_password_input_1_" + account_id).val(password);
	    $("#change_password_input_2_" + account_id).val(password);
	    CHANGE_PASSWORD_BAR.check_strength("change_password_input_1_" + account_id, function() {
		    CHANGE_PASSWORD1_VALIDATION.verify()
			});
	    CHANGE_PASSWORD2_VALIDATION.verify();
	});
};

function verify_password_strength (o) {
    if (CHANGE_PASSWORD_BAR.current_strength < REQUIRED_PASSWORD_STRENGTH) return false;
    else return true;
};

function verify_password_uppercase (o) {
    var id = $(o).attr("id");
    var index = $(o).attr("id").lastIndexOf("_");
    index = id.substr(index + 1);
    if (accounts[index]['data']['PasswordComplexity'] == "MixedCaseDigit") {
	var pass1 = $(o).val();    
	var pattern_lowercase = /[a-z]/;
	var pattern_uppercase = /[A-Z]/;
	var pattern_digit = /[0-9]/;
	var result_lowercase = pattern_lowercase.test(pass1);
	var result_uppercase = pattern_uppercase.test(pass1);
	var result_digit = pattern_digit.test(pass1);
	return result_lowercase && result_uppercase && result_digit;
    }
    else {
    	return true;
    }
};

function load_events () {
    $(".avatar_span").mouseover(function() {
	    $(this).siblings("span.glyph-edit:first").show();
	}).mouseout(function(){
		$(this).siblings("span.glyph-edit:first").hide();
	    });
    $(".avatar").mouseover(function() {
	    $(this).siblings("span.glyph-edit:first").show();
	}).mouseout(function(){
		$(this).siblings("span.glyph-edit:first").hide();
	    });

    // Click events to show templates
    $(".password_template_btn").click(function() {
	    load_password_template($(this));
	    $(".status_bar").each(function(){
		    $(this).removeClass("status_bar_success").removeClass("status_bar_error").html("").hide();
		});
	    remove_cropper_element();
	});

    $(".details_template_btn").click(function() {
	    load_details_template($(this));
	    $(".status_bar").each(function(){
		    $(this).removeClass("status_bar_success").removeClass("status_bar_error").html("").hide();
		});
	    remove_cropper_element();
	});

    $(".plan_template_btn").click(function() {
	    load_plan_template($(this));
	    $(".status_bar").each(function(){
		    $(this).removeClass("status_bar_success").removeClass("status_bar_error").html("").hide();
		});
	    remove_cropper_element();
	});

    $(".delete_template_btn").click(function() {
	    load_delete_template($(this));
	    $(".status_bar").each(function(){
		    $(this).removeClass("status_bar_success").removeClass("status_bar_error").html("").hide();
		});
	    remove_cropper_element();
	});

    $(".active_sync_template_btn").click(function() {
	    var account_id = $(this).attr("id").replace("active_sync_template_btn_","");
	    load_active_sync_data(account_id);
	    $(".status_bar").each(function(){
		    $(this).removeClass("status_bar_success").removeClass("status_bar_error").html("").hide();
		});
	    remove_cropper_element();
	});
	
    $(".change_avatar_template_btn").click(function() {
	    load_avatar_template($(this));
	    $(".status_bar").each(function(){
		    $(this).removeClass("status_bar_success").removeClass("status_bar_error").html("").hide();
		});
	});
}

function load_delete_template (item) {
    var account_id = item.attr("id").replace("delete_template_btn_","");
    var account = accounts[account_id];
    $(".show_template").each(function() {
    	    if ($(this).attr("id") != "show_template_" + account_id) {
    		$(this).slideUp("slow");
    		$(this).html("");
    	    }
    	});
    if ($("#show_template_" + account_id).find("div.delete_template").length < 1) {
    	var delete_tmpl_html = new EJS({url: 'delete_template.ejs'}).render({"account": account, "account_id": account_id});
	$("#show_template_" + account_id).hide().html(delete_tmpl_html).promise().done(function(){
		setTimeout( function () {$("#show_template_" + account_id).slideDown("slow");}, 1);
	    });
    	$("#cancel_btn_" + account_id).click(function() {
    		$("#show_template_" + account_id).slideUp("slow").html("");
    	    });
	$("#delete_account_btn_" + account_id).click(function() {
		delete_account(account_id);	
 	    });
    } else {
    	$("#show_template_" + account_id).slideUp("slow", function(){$(this).html("")});
    }
}

function load_details_template (item) {
    var account_id = item.attr("id").replace("details_template_btn_","");
    var account = accounts[account_id];
    $(".show_template").each(function() {
	    if ($(this).attr("id") != "show_template_" + account_id) {
		$(this).slideUp("slow");
		$(this).html("");
	    }
	});
    if ($("#show_template_" + account_id).find("div.details_template").length < 1) {
	var details_tmpl_html = new EJS({url: 'details_template.ejs'}).render({"account": account, "account_id": account_id});
	$("#show_template_" + account_id).hide().html(details_tmpl_html).promise().done(function(){
		setTimeout( function () {$("#show_template_" + account_id).slideDown("slow");}, 1);
	    });
	$("#cancel_btn_" + account_id).click(function() {
		$("#show_template_" + account_id).slideUp("slow").html("");
	    });
	$("#change_details_btn_" + account_id).click(function() {
		change_details(account_id);	
 	    });
    } else {
    	$("#show_template_" + account_id).slideUp("slow", function(){$(this).html("")});
    }
		
    $('input:radio').click(function() {
	    if ($(this).val() == "unlimited") {
		$("#quota_number_input_" + account_id).attr("disabled",true)
		    } else {
		$("#quota_number_input_" + account_id).attr("disabled",false)
		    }
	});
}

function load_password_template (item) {
    var account_id = item.attr("id").replace("password_template_btn_","");
    var account = accounts[account_id];
    $(".show_template").each(function() {
	    if ($(this).attr("id") != "show_template_" + account_id) {
		$(this).slideUp("slow");
		$(this).html("");
		$(".validation_errors_li").each(function() {
			$(this).remove();
		    });
		$(".validation_errors_div").each(function() {
			$(this).remove();
		    });
	    }
	});
    if ($("#show_template_" + account_id).find("div.password_template").length < 1) {
	var pass_tmpl_html = new EJS({url: 'password_template.ejs'}).render({"account": account, "account_id": account_id});
	$("#show_template_" + account_id).hide().html(pass_tmpl_html).promise().done(function(){
		setTimeout( function () {$("#show_template_" + account_id).slideDown("slow");}, 1);
	    });
	$("#create_strong_password_" + account_id).click(function() {
		create_strong_password(account_id);
	    });		    
	$("#cancel_btn_" + account_id).click(function() {
		$("#show_template_" + account_id).slideUp("slow").html("");
	    });
		    
	var password1 = "change_password_input_1_" + account_id;
	var password2 = "change_password_input_2_" + account_id;

	// add validation
	CHANGE_PASSWORD1_VALIDATION = new CPANEL.validate.validator("Change Password");
	CHANGE_PASSWORD1_VALIDATION.add(password1, verify_password_strength, LOCALE.maketext('Password strength must be at least [numf,_1].', REQUIRED_PASSWORD_STRENGTH));
	CHANGE_PASSWORD1_VALIDATION.add(password1, 'no_chars(%input%, " ")', CPANEL.lang.password_validator_no_spaces);
	CHANGE_PASSWORD1_VALIDATION.add(password1, verify_password_uppercase, "Password should contain a <strong>uppercase</strong> letter, <strong>lowercase</strong> letter and a <strong>digit</strong>." );
	CHANGE_PASSWORD1_VALIDATION.attach();
		    
	CHANGE_PASSWORD2_VALIDATION = new CPANEL.validate.validator(CPANEL.lang.passwords_match);
	CHANGE_PASSWORD2_VALIDATION.add(password2, "equals('" + password1 + "', '" + password2 + "')", CPANEL.lang.password_validator_no_match);
	CHANGE_PASSWORD2_VALIDATION.attach();

	// initialize the password bar
	CHANGE_PASSWORD_BAR = new CPANEL.password.strength_bar("password_strength_bar_" + account_id);
	CHANGE_PASSWORD_BAR.attach(password1, function() {
		CHANGE_PASSWORD1_VALIDATION.verify();
	    });
	
	$("#change_password_btn_" + account_id).click(function() {
		change_password(account_id);	
 	    });
    } else {
    	$("#show_template_" + account_id).slideUp("slow", function(){$(this).html("")});
    }
}

function load_plan_template (item) {
    if (item.parent().hasClass("plan_td")) {
	var account_id = item.parent().attr("id");
	var account = accounts[account_id];
    } else {
	var account_id = item.attr("id").replace("plan_template_btn_","");
	var account = accounts[account_id];
    }
    $(".show_template").each(function() {
	    if ($(this).attr("id") != "show_template_" + account_id) {
		$(this).slideUp("slow");
		$(this).html("");
	    }
	});
    if ($("#show_template_" + account_id).find("div.plan_template").length < 1) {
	var plan_tmpl_html = new EJS({url: 'plan_template.ejs'}).render({"account": account, "account_id": account_id});
	$("#show_template_" + account_id).hide().html(plan_tmpl_html).promise().done(function(){
		setTimeout( function () {$("#show_template_" + account_id).slideDown("slow");}, 1);
	    });
	$("#cancel_btn_" + account_id).click(function() {
		$("#show_template_" + account_id).slideUp("slow").html("");
	    });
	$("#change_type_btn_" + account_id).click(function() {
		change_type(account_id);	
 	    });
    } else {
    	$("#show_template_" + account_id).slideUp("slow", function(){$(this).html("")});
    }
}

var load_avatar_template = function (item) {
    remove_cropper_element();    
    var account_id = item.attr("id").replace("change_avatar_template_btn_","");
    var account = accounts[account_id];
    $(".show_template").each(function() {
	    if ($(this).attr("id") != "show_template_" + account_id) {
		$(this).slideUp("slow");
		$(this).html("");
	    }
	});
    if ($("#show_template_" + account_id).find("div.avatar_template").length < 1) {
	var change_avatar_tmpl_html = new EJS({url: 'avatar_template.ejs'}).render({"account": account, "account_id": account_id});
	$("#show_template_" + account_id).hide().html(change_avatar_tmpl_html).promise().done(function(){
		setTimeout( function () {
			$("#show_template_" + account_id).slideDown("slow");
			    }, 1);
	    });
	

	$jq("#crop_" + account_id).simpleCropper();

	$("#cancel_btn_" + account_id).click(function() {
		$("#show_template_" + account_id).slideUp("slow").html("");
	    });
	$("#change_avatar_confirm_" + account_id).click(function() {
		change_avatar(account_id);
	    });
    } else {
    	$("#show_template_" + account_id).slideUp("slow", function(){$(this).html("")});
	remove_cropper_element();
    }
}

function load_active_sync_template (account_id, data) {
    var account = accounts[account_id];
    var active_sync_tmpl_html = new EJS({url: 'active_sync_template.ejs'}).render({"account": account, "account_id": account_id, "active_sync_data": data});
    $("#show_template_" + account_id).hide().html(active_sync_tmpl_html).promise().done(function(){
	    setTimeout( function () {$("#show_template_" + account_id).slideDown("slow");}, 1);
	});
    $("#change_active_sync_btn_" + account_id).click(function() {
	    change_active_sync(account_id);	
	});
    $(".active_sync_wipe_btn").click(function() {
	    active_sync_wipe(account_id, $(this).val(), "wipe");	
 	    });
    $(".active_sync_wipe_cancel_btn").click(function() {
	    active_sync_wipe(account_id, $(this).val(), "cancel");	
	});
    $("#cancel_btn_" + account_id).click(function() {
	    $("#show_template_" + account_id).slideUp("slow").html("");
	});
}

function load_active_sync_data (item) {
    $(".show_template").each(function() {
	    if ($(this).attr("id") != "show_template_" + item) {
		$(this).slideUp("slow");
		$(this).html("");
	    }
	});
    if ($("#show_template_" + item).find("div.active_sync_template").length < 1) {

	$("#status_bar_" + item).hide().promise().done(function(){
		setTimeout( function () {$("#status_bar_" + item).slideDown("slow", function(){$(this).html(CPANEL.icons.ajax + " Loading...")});}, 1);
	    });
 	var api2_call = {
	    "cpanel_jsonapi_version": 2,
	    "cpanel_jsonapi_module": "CommuniGate",
	    "cpanel_jsonapi_func": "ListAirSyncs",
	    "account": accounts[item].prefs.AccountName
	};
    
	var success = function (res) {
	    $("#status_bar_" + item).slideUp("slow", function(){$(this).html("")});
	    var data = JSON.parse(res);
	    data = data.cpanelresult.data[0];
	    load_active_sync_template(item, data);
	};
    
	// send the request
	$.ajax({
		type: "GET",
		    url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
		    success: success
		    });
    } else {
	$("#status_bar_" + item).slideUp("slow", function(){$(this).html("")});
	$("#show_template_" + item).slideUp("slow", function(){$(this).html("")});
    }
}

var change_password = function(account_id) {
    // check the validation
    CHANGE_PASSWORD1_VALIDATION.verify();
    CHANGE_PASSWORD2_VALIDATION.verify();
    var error_messages = [];
    if (CHANGE_PASSWORD1_VALIDATION.is_valid() == false) error_messages.push(CHANGE_PASSWORD1_VALIDATION.error_messages());
    if (CHANGE_PASSWORD2_VALIDATION.is_valid() == false) error_messages.push(CHANGE_PASSWORD2_VALIDATION.error_messages());

    // if the validation is good submit the password to be changed
    if (error_messages.length === 0) {
        // create the API variables
        var password = $("#change_password_input_1_" + account_id).val();
        var api2_call = {
            "cpanel_jsonapi_version": 2,
            "cpanel_jsonapi_module": "Email",
            "cpanel_jsonapi_func": "passwdpop",
            "email": accounts[account_id]['username'],
            "domain": accounts[account_id]['domain'],
            "password": password
        };

	var success = function(res) {
	    var data = JSON.parse(res);
	    $("#show_template_" + account_id).html("");
	    if (data.cpanelresult.data[0].result == "1") {
		$("#status_bar_" + account_id).removeClass("status_bar_error").addClass("status_bar_success").html("<span class='glyphicon glyphicon-ok'></span> Password changed successfully!").show();
	    } else {
		$("#status_bar_" + account_id).removeClass("status_bar_success").addClass("status_bar_error").html("<span class='glyphicon glyphicon-remove'></span> Error changing password!").show();
	    }
	};

	// send the request
	$("#show_template_" + account_id).slideUp("slow").html("");
	$("#status_bar_" + account_id).removeClass("status_bar_error").removeClass("status_bar_success").html(CPANEL.icons.ajax + " Changing password...").show();
	$.ajax({
		type: "GET",
		    url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
		    success: success
		    });
    }
};

var change_type = function(account_id) {
    // create the API variables
    var new_type = $("input[name='class_" + account_id + "']:checked").val();
    var api2_call = {
	"cpanel_jsonapi_version": 2,
	"cpanel_jsonapi_module": "CommuniGate",
        "cpanel_jsonapi_func": "UpdateAccountClass",
        "account": accounts[account_id].prefs.AccountName,
	"class": new_type
    };

    var success = function(res) {
	var data = JSON.parse(res);
	$("#show_template_" + account_id).html("");
	if (data.cpanelresult.data[0].msg) {
	    $("#status_bar_" + account_id).removeClass("status_bar_success").addClass("status_bar_error").html("<span class='glyphicon glyphicon-remove'></span> Error changing type! Error: " + data.cpanelresult.data[0].msg).show();
	} else {
	    $("#status_bar_" + account_id).removeClass("status_bar_error").addClass("status_bar_success").html("<span class='glyphicon glyphicon-ok'></span> Plan changed successfully! Refreshing table, please wait... " + CPANEL.icons.ajax).show();
	    get_accounts();
	}
    };

    // send the request
    $("#show_template_" + account_id).slideUp("slow").html("");
    $("#status_bar_" + account_id).removeClass("status_bar_error").removeClass("status_bar_success").html(CPANEL.icons.ajax + " Changing type...").show();
    $.ajax({
	    type: "GET",
		url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
		success: success
		});
};

var delete_account = function(account_id) {
    // create the API variables
    var api2_call = {
        cpanel_jsonapi_version: 2,
        cpanel_jsonapi_module: "Email",
        cpanel_jsonapi_func: "delpop",
        email: accounts[account_id].username,
        domain: accounts[account_id].domain
    };

    var success = function(res) {
	var data = JSON.parse(res);
	$("#show_template_" + account_id).html("");
	if (data.cpanelresult.data[0].result == "1") {
	    get_accounts();
	} else {
	    $("#status_bar_" + account_id).removeClass("status_bar_success").addClass("status_bar_error").html("<span class='glyphicon glyphicon-remove'></span> Error deleting account! Error: " + data.cpanelresult.data[0].reason).show();
	}
    };

    // send the request
    $("#show_template_" + account_id).slideUp("slow").html("");
    $("#status_bar_" + account_id).removeClass("status_bar_error").removeClass("status_bar_success").html(CPANEL.icons.ajax + " Deleting account...").show();
    $.ajax({
	    type: "GET",
		url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
		success: success
		});
};

var change_details = function(account_id) {
    var quota = 0;  
    if ($("input[name='quota_" + account_id + "']:checked").val() == "custom_qouta") {
        quota = $("#quota_number_input_" + account_id).val();
    }
    // create the API variables
    var api2_call = {
        "cpanel_jsonapi_version": 2,
        "cpanel_jsonapi_module": "Email",
        "cpanel_jsonapi_func": "editquota",
        "email": accounts[account_id].username,
        "domain": accounts[account_id].domain,
	"realaname": $("#realname_input_" + account_id).val(),
        "quota": quota,
	"unit": $("#ou_input_" + account_id).val(),
	"mobile": $("#mobile_phone_input_" + account_id).val(),
	"workphone": $("#work_phone_input_" + account_id).val(),
	"WorkDays": undefined,
	"WorkDays-0": undefined,
	"WorkDays-1": undefined,
	"WorkDays-2": undefined,
	"WorkDays-3": undefined,
	"WorkDays-4": undefined,
	"WorkDays-5": undefined
    };

    var work_days = $('input:checkbox[name=work_days]:checked').map(function() { return this.value; }).get();
    for (var i=0; i < work_days.length; i++) {
    	switch(work_days[i]) {
    	case "Sun": api2_call['WorkDays'] = work_days[i];
    	    break;
    	case "Mon": api2_call['WorkDays-0'] = work_days[i];
    	    break;
    	case "Tue": api2_call['WorkDays-1'] = work_days[i];
    	    break;
    	case "Wed": api2_call['WorkDays-2'] = work_days[i];
    	    break;
    	case "Thu": api2_call['WorkDays-3'] = work_days[i];
    	    break;
    	case "Fri": api2_call['WorkDays-4'] = work_days[i];
    	    break;
    	case "Sat": api2_call['WorkDays-5'] = work_days[i];
    	    break;
    	    }
    }

    if ($('#complex_pass_input_' + account_id).is(":checked")){
	api2_call['PasswordComplexity'] = $('#complex_pass_input_' + account_id).val();
    }
    
    var success = function(res) {
    	var data = JSON.parse(res);
    	$("#show_template_" + account_id).html("");
	if (data.cpanelresult.data && (data.cpanelresult.data[0].result == 1)) {
    	    $("#status_bar_" + account_id).removeClass("status_bar_error").addClass("status_bar_success").html("<span class='glyphicon glyphicon-ok'></span> Details changed successfully! Refreshing table, please wait... " + CPANEL.icons.ajax).show();
	    get_accounts();
    	} else {
    	    $("#status_bar_" + account_id).removeClass("status_bar_success").addClass("status_bar_error").html("<span class='glyphicon glyphicon-remove'></span> Error changing details! Error: " + data.cpanelresult.data[0].reason).show();
    	}
    };

    // send the request
    $("#show_template_" + account_id).slideUp("slow").html("");
    $("#status_bar_" + account_id).removeClass("status_bar_error").removeClass("status_bar_success").html(CPANEL.icons.ajax + " Changing details...").show();
    $.ajax({
    	    type: "GET",
    		url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
    		success: success
    		});
};

var change_active_sync = function(account_id){
    var api2_call = {
        "cpanel_jsonapi_version": 2,
        "cpanel_jsonapi_module": "CommuniGate",
        "cpanel_jsonapi_func": "ListAirSyncs",
        "account": accounts[account_id].prefs.AccountName,
        "AirSyncAllowed": $("#active_sync_allowed_" + account_id).val(),
        "save": "save"
    };

    var success = function(res) {
    	var data = JSON.parse(res);
    	$("#show_template_" + account_id).html("");
	if (data.cpanelresult.event && (data.cpanelresult.event.result == 1)) {
    	    $("#status_bar_" + account_id).removeClass("status_bar_error").addClass("status_bar_success").html("<span class='glyphicon glyphicon-ok'></span> Active sync changed successfully! Refreshing table, please wait... " + CPANEL.icons.ajax).show();
	    get_accounts();
    	} else {
    	    $("#status_bar_" + account_id).removeClass("status_bar_success").addClass("status_bar_error").html("<span class='glyphicon glyphicon-remove'></span> Error changing active sync! Error: " + data.cpanelresult.data[0].reason).show();
    	}
    };

    // send the request
    $("#show_template_" + account_id).slideUp("slow").html("");
    $("#status_bar_" + account_id).removeClass("status_bar_error").removeClass("status_bar_success").html(CPANEL.icons.ajax + " Changing active sync...").show();
    $.ajax({
    	    type: "GET",
    		url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
    		success: success
    		});
};

var active_sync_wipe = function(account_id, device, type){
    var api2_call = {
        "cpanel_jsonapi_version": 2,
        "cpanel_jsonapi_module": "CommuniGate",
        "cpanel_jsonapi_func": "UpdateAirSync",
	"account": accounts[account_id].prefs.AccountName,
	"device": device,
	"type": type
    };
 
    var success = function(res) {
    	var data = JSON.parse(res);
    	$("#show_template_" + account_id).html("");
    	if (data.cpanelresult.event && (data.cpanelresult.event.result == 1)) {
    	    $("#status_bar_" + account_id).removeClass("status_bar_error").addClass("status_bar_success").html("<span class='glyphicon glyphicon-ok'></span> Active sync changed successfully! Refreshing table, please wait... " + CPANEL.icons.ajax).show();
    	    get_accounts();
    	} else {
    	    $("#status_bar_" + account_id).removeClass("status_bar_success").addClass("status_bar_error").html("<span class='glyphicon glyphicon-remove'></span> Error changing active sync! Error: " + data.cpanelresult.data[0].reason).show();
    	}
    };

    // send the request
    $("#show_template_" + account_id).slideUp("slow").html("");
    $("#status_bar_" + account_id).removeClass("status_bar_error").removeClass("status_bar_success").html(CPANEL.icons.ajax + " Changing active sync...").show();
    $.ajax({
    	    type: "GET",
    		url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
    		success: success
    		});
};

function clear_search () {
    $("#search_input").val("");
    search_accounts();
};

function search_accounts () {
    var tmp_accounts = [];
    var searchregex = $("#search_input").val();
    for (var i=0; i < accounts.length; i++) {
	var res = accounts[i].prefs.AccountName.match(searchregex);
	if (res) {
	    tmp_accounts.push(accounts[i]);
	}
    }
    var html = new EJS({url: 'accounts_table.ejs'}).render({"accounts": tmp_accounts});
    $("#accounts_table").html(html);
    load_events();	
}   
$("#search_input").keyup(search_accounts);

var change_avatar = function(account_id){
    if ( $("#crop_" + account_id + " img")[0] ) {
	var new_avatar = $("#crop_" + account_id + " img").attr('src');	
    }
    else {
	if (accounts[account_id].vcard
	    && accounts[account_id].vcard.fileData
	    && accounts[account_id].vcard.fileData[0]
	    && accounts[account_id].vcard.fileData[0].vCard
	    && accounts[account_id].vcard.fileData[0].vCard[0]
	    && accounts[account_id].vcard.fileData[0].vCard[0].PHOTO
	    && accounts[account_id].vcard.fileData[0].vCard[0].PHOTO[0]
	    && accounts[account_id].vcard.fileData[0].vCard[0].PHOTO[0].BINVAL
	    && accounts[account_id].vcard.fileData[0].vCard[0].PHOTO[0].BINVAL[0]) { 
	    var new_avatar = accounts[account_id].vcard.fileData[0].vCard[0].PHOTO[0].BINVAL[0]; 
	} else {
	    alert("Please add image!");
	    return;
	}
    } 

    new_avatar = encodeURIComponent(new_avatar.substring(22));

    if (accounts[account_id].vcard
	&& accounts[account_id].vcard.fileData
	&& accounts[account_id].vcard.fileData[0]
	&& accounts[account_id].vcard.fileData[0].vCard
	&& accounts[account_id].vcard.fileData[0].vCard[0]
	&& accounts[account_id].vcard.fileData[0].vCard[0].PHOTO
	&& accounts[account_id].vcard.fileData[0].vCard[0].PHOTO[0]
	&& accounts[account_id].vcard.fileData[0].vCard[0].PHOTO[0].BINVAL
	&& accounts[account_id].vcard.fileData[0].vCard[0].PHOTO[0].BINVAL[0]) { 
	var vCard = accounts[account_id].vcard.fileData[0].vCard[0]; 
	vCard.PHOTO[0].BINVAL[0] = new_avatar;
    } else {
	var vCard = { PHOTO: [ { BINVAL: [new_avatar] } ] };
    }
    
    var api2_call = {
        "cpanel_jsonapi_version": 2,
        "cpanel_jsonapi_module": "CommuniGate",
        "cpanel_jsonapi_func": "UpdateVCard",
	"account": accounts[account_id].prefs.AccountName
    };

    var success = function(res) {
	var data = JSON.parse(res);
	console.log(data);

	if (data.cpanelresult.data && data.cpanelresult.data[0].response.id) {
    	    $("#status_bar_" + account_id).removeClass("status_bar_error").addClass("status_bar_success").html("<span class='glyphicon glyphicon-ok'></span> Avatar changed successfully! Refreshing table, please wait... " + CPANEL.icons.ajax).show();
	    get_accounts();
	} else if (data.cpanelresult.event && (data.cpanelresult.event['result'] == 0)) {
    	    $("#status_bar_" + account_id).removeClass("status_bar_success").addClass("status_bar_error").html("<span class='glyphicon glyphicon-remove'></span> Error changing avatar! Error: " + data.cpanelresult.data[0].reason).show();
    	} else {
    	    $("#status_bar_" + account_id).removeClass("status_bar_success").addClass("status_bar_error").html("<span class='glyphicon glyphicon-remove'></span> Error changing avatar!");
    	}
    }

    // send the AJAX request
    $("#show_template_" + account_id).slideUp("slow").html("");
    $("#status_bar_" + account_id).removeClass("status_bar_error").removeClass("status_bar_success").html(CPANEL.icons.ajax + " Changing avatar...").show();
    $.ajax({
	    type: "POST",
	    url: CPANEL.urls.json_api() + '&' + $.param(api2_call),
	    data: "vcard=" + JSON.stringify(vCard),
	    success: success,
	    dataType: "text"
	});
};

function remove_cropper_element () {
    $("#fileInput").remove();
    $("#myCanvas").remove();
    $("#modal").remove();
    $("#preview").remove();
}
