var VALID={};var OPEN_MODULE=null;var EDIT_VALID={};var EMAIL_VALID;var typeof_validator=function(a){if(typeof(a.add)!="function"){return false}if(typeof(a.attach)!="function"){return false}if(typeof(a.title)!="string"){return false}return true};var load_cron_table=function(){var b=YAHOO.util.Dom.get("cron_jobs");var c={success:function(d){b.innerHTML=d.responseText},error:function(d){b.innerHTML=CPANEL.icons.error+" "+CPANEL.lang.ajax_error+": "+CPANEL.lang.ajax_try_again}};YAHOO.util.Connect.asyncRequest("GET","cron_entries.html",c,"");var a=YAHOO.util.Region.getRegion(b);if(a.height>0){b.innerHTML='<div style="height: '+a.height+'px"><div style="padding: 15px">'+CPANEL.icons.ajax+" "+CPANEL.lang.ajax_loading+"</div></div>"}else{b.innerHTML='<div style="padding: 15px">'+CPANEL.icons.ajax+" "+CPANEL.lang.ajax_loading+"</div>"}};var reset_all_input=function(b){if(!b){b=""}reset_input_fields(b);reset_option_fields(b);if(b==""){YAHOO.util.Dom.get("common_options").value="--";for(var a in VALID){if(VALID.hasOwnProperty(a)){if(typeof_validator(VALID[a])==false){continue}VALID[a].clear_messages()}}}else{YAHOO.util.Dom.get("common_options_"+b).value="--"}};var reset_input_fields=function(a){(!a)?a="":a="_"+a;YAHOO.util.Dom.get("minute"+a).value="";YAHOO.util.Dom.get("hour"+a).value="";YAHOO.util.Dom.get("day"+a).value="";YAHOO.util.Dom.get("month"+a).value="";YAHOO.util.Dom.get("weekday"+a).value="";YAHOO.util.Dom.get("command"+a).value=""};var reset_option_fields=function(a){(!a)?a="":a="_"+a;YAHOO.util.Dom.get("minute_options"+a).value="--";YAHOO.util.Dom.get("hour_options"+a).value="--";YAHOO.util.Dom.get("day_options"+a).value="--";YAHOO.util.Dom.get("month_options"+a).value="--";YAHOO.util.Dom.get("weekday_options"+a).value="--"};var select_common_option=function(d){var b;(!d)?b="":b="_"+d;var c=YAHOO.util.Dom.get("common_options"+b).value;if(c!="--"){var a=c.split(" ");YAHOO.util.Dom.get("minute"+b).value=a[0];YAHOO.util.Dom.get("hour"+b).value=a[1];YAHOO.util.Dom.get("day"+b).value=a[2];YAHOO.util.Dom.get("month"+b).value=a[3];YAHOO.util.Dom.get("weekday"+b).value=a[4];check_common_options();if(b==""){VALID.minute.verify();VALID.hour.verify();VALID.day.verify();VALID.month.verify();VALID.weekday.verify()}else{EDIT_VALID.minute.verify();EDIT_VALID.hour.verify();EDIT_VALID.day.verify();EDIT_VALID.month.verify();EDIT_VALID.weekday.verify()}}};var select_single_option=function(b,c){(!c)?c="":c="_"+c;var a=YAHOO.util.Dom.get(b+"_options"+c).value;if(a!="--"){YAHOO.util.Dom.get(b+c).value=a}VALID[b].verify();check_common_options()};var validate_minute_field=function(a){return validate_cron_field(YAHOO.util.Dom.get(a).value,0,59)};var validate_hour_field=function(a){return validate_cron_field(YAHOO.util.Dom.get(a).value,0,23)};var validate_day_field=function(a){return validate_cron_field(YAHOO.util.Dom.get(a).value,1,31)};var validate_month_field=function(b){var a=YAHOO.util.Dom.get(b).value;a=a.toLowerCase();a=a.replace("jan",1);a=a.replace("feb",2);a=a.replace("mar",3);a=a.replace("apr",4);a=a.replace("may",5);a=a.replace("jun",6);a=a.replace("jul",7);a=a.replace("aug",8);a=a.replace("sep",9);a=a.replace("oct",10);a=a.replace("nov",11);a=a.replace("dec",12);return validate_cron_field(a,1,12)};var validate_weekday_field=function(b){var a=YAHOO.util.Dom.get(b).value;a=a.toLowerCase();a=a.replace("sun",0);a=a.replace("mon",1);a=a.replace("tue",2);a=a.replace("wed",3);a=a.replace("thu",4);a=a.replace("fri",5);a=a.replace("sat",6);return validate_cron_field(a,0,7)};var validate_cron_field=function(e,g,d){var f=e.split(",");for(var c=0;c<f.length;c++){if(f.hasOwnProperty(c)){if(f[c].search("-")!=-1){var a=f[c].split("-");if(a.length!=2){return false}if(validate_cron_unit(a[0],g,d)==false){return false}if(validate_cron_unit(a[1],g,d)==false){return false}a[0]=parseInt(a[0]);a[1]=parseInt(a[1]);if(a[0]>=a[1]){return false}}else{if(f[c].search("/")!=-1){var b=f[c].split("/");if(b.length!=2){return false}if(validate_cron_unit(b[0],g,d,true)==false){return false}if(validate_cron_unit(b[1],g,d)==false){return false}}else{if(validate_cron_unit(f[c],g,d,true)==false){return false}}}}}return true};var validate_cron_unit=function(b,d,a,c){if(c){if(b=="*"){return true}}if(CPANEL.validate.positive_integer(b)==true){if(b>=d&&b<=a){return true}}return false};var check_common_options=function(g){(!g)?g="":g="_"+g;var f=YAHOO.util.Dom.get("minute"+g).value;select_if_equal(f,"minute_options"+g);var a=YAHOO.util.Dom.get("hour"+g).value;select_if_equal(a,"hour_options"+g);var b=YAHOO.util.Dom.get("day"+g).value;select_if_equal(b,"day_options"+g);var e=YAHOO.util.Dom.get("month"+g).value;select_if_equal(e,"month_options"+g);var d=YAHOO.util.Dom.get("weekday"+g).value;select_if_equal(d,"weekday_options"+g);var c=f+" "+a+" "+b+" "+e+" "+d;select_if_equal(c,"common_options"+g)};var select_if_equal=function(d,e){var b=document.getElementById(e).options;var a=false;for(var c=0;c<b.length;c++){if(b[c].value==d){b[c].selected=true;a=true}}if(a==false){b[0].selected=true}};var add_new_cron_job=function(){if(window.demo_mode){return}var c={cpanel_jsonapi_version:2,cpanel_jsonapi_module:"Cron",cpanel_jsonapi_func:"add_line",minute:YAHOO.util.Dom.get("minute").value,hour:YAHOO.util.Dom.get("hour").value,day:YAHOO.util.Dom.get("day").value,month:YAHOO.util.Dom.get("month").value,weekday:YAHOO.util.Dom.get("weekday").value,command:YAHOO.util.Dom.get("command").value};var a=function(){YAHOO.util.Dom.get("add_new_cron").disabled=false;YAHOO.util.Dom.get("add_new_cron_status").innerHTML=""};var b={success:function(g){try{var d=YAHOO.lang.JSON.parse(g.responseText);if(d.cpanelresult.data[0].status=="1"){CPANEL.widgets.status_bar("add_cron_status_bar","success",LANG.added_cron_job);reset_all_input();load_cron_table()}else{CPANEL.widgets.status_bar("add_cron_status_bar","error",CPANEL.lang.Error,d.cpanelresult.data[0].statusmsg)}}catch(f){CPANEL.widgets.status_bar("add_cron_status_bar","error",CPANEL.lang.json_error,CPANEL.lang.json_parse_failed)}a()},failure:function(d){a();CPANEL.widgets.status_bar("add_cron_status_bar","error",CPANEL.lang.ajax_error,CPANEL.lang.ajax_try_again)}};YAHOO.util.Connect.asyncRequest("GET",CPANEL.urls.json_api(c),b,"");YAHOO.util.Dom.get("add_new_cron").disabled=true;YAHOO.util.Dom.get("add_new_cron_status").innerHTML=CPANEL.icons.ajax+" "+LANG.adding_cron_job};var toggle_module=function(b){if(OPEN_MODULE!==b&&YAHOO.util.Dom.getStyle(OPEN_MODULE,"display")=="block"){var a=OPEN_MODULE;before_hide_module(a);CPANEL.animate.slide_up(a,function(){after_hide_module(a)})}if(YAHOO.util.Dom.getStyle(b,"display")!="none"){before_hide_module(b);CPANEL.animate.slide_up(b,function(){after_hide_module(b)})}else{before_show_module(b);CPANEL.animate.slide_down(b,function(){after_show_module(b)});OPEN_MODULE=b}};var before_show_module=function(d){var a=d.split("_");var c=a[0];var b=a[2];if(c=="edit"){YAHOO.util.Dom.get("minute_"+b).value=YAHOO.util.Dom.get("minute_info_"+b).innerHTML;YAHOO.util.Dom.get("hour_"+b).value=YAHOO.util.Dom.get("hour_info_"+b).innerHTML;YAHOO.util.Dom.get("day_"+b).value=YAHOO.util.Dom.get("day_info_"+b).innerHTML;YAHOO.util.Dom.get("month_"+b).value=YAHOO.util.Dom.get("month_info_"+b).innerHTML;YAHOO.util.Dom.get("weekday_"+b).value=YAHOO.util.Dom.get("weekday_info_"+b).innerHTML;YAHOO.util.Dom.get("command_"+b).value=YAHOO.util.Dom.get("command_info_"+b).value;EDIT_VALID.minute=new CPANEL.validate.validator(LANG.Minute);EDIT_VALID.minute.add("minute_"+b,function(){return validate_minute_field("minute_"+b)},LANG.cron_field_not_valid);EDIT_VALID.minute.attach();EDIT_VALID.hour=new CPANEL.validate.validator(LANG.Hour);EDIT_VALID.hour.add("hour_"+b,function(){return validate_hour_field("hour_"+b)},LANG.cron_field_not_valid);EDIT_VALID.hour.attach();EDIT_VALID.day=new CPANEL.validate.validator(LANG.Day);EDIT_VALID.day.add("day_"+b,function(){return validate_day_field("day_"+b)},LANG.cron_field_not_valid);EDIT_VALID.day.attach();EDIT_VALID.month=new CPANEL.validate.validator(LANG.Month);EDIT_VALID.month.add("month_"+b,function(){return validate_month_field("month_"+b)},LANG.cron_field_not_valid);EDIT_VALID.month.attach();EDIT_VALID.weekday=new CPANEL.validate.validator(LANG.Weekday);EDIT_VALID.weekday.add("weekday_"+b,function(){return validate_weekday_field("weekday_"+b)},LANG.cron_field_not_valid);EDIT_VALID.weekday.attach();EDIT_VALID.command=new CPANEL.validate.validator(LANG.Command);EDIT_VALID.command.add("command_"+b,"min_length(%input%, 1)",LANG.command_not_empty);EDIT_VALID.command.attach();CPANEL.validate.attach_to_form("edit_line_"+b,EDIT_VALID,function(){edit_line(b)});CPANEL.util.catch_enter(["minute_"+b,"hour_"+b,"day_"+b,"month_"+b,"weekday_"+b,"command_"+b],"edit_line_"+b)}};var before_hide_module=function(e){var a=e.split("_");var d=a[0];var b=a[2];if(d=="edit"){for(var c in EDIT_VALID){if(EDIT_VALID.hasOwnProperty(c)){if(typeof_validator(EDIT_VALID[c])==false){continue}EDIT_VALID[c].clear_messages()}}YAHOO.util.Event.purgeElement(e,true)}};var after_show_module=function(a){};var after_hide_module=function(a){};var edit_line=function(f){if(window.demo_mode){return}var a=YAHOO.util.Dom.get("minute_"+f).value;var c=YAHOO.util.Dom.get("hour_"+f).value;var h=YAHOO.util.Dom.get("day_"+f).value;var g=YAHOO.util.Dom.get("month_"+f).value;var e=YAHOO.util.Dom.get("weekday_"+f).value;var b=YAHOO.util.Dom.get("command_"+f).value;var j=YAHOO.util.Dom.get("linekey_"+f).value;var i={cpanel_jsonapi_version:2,cpanel_jsonapi_module:"Cron",cpanel_jsonapi_func:"edit_line",minute:a,hour:c,day:h,month:g,weekday:e,command:b,linekey:j};var d=function(){YAHOO.util.Dom.setStyle("edit_input_"+f,"display","block");YAHOO.util.Dom.get("edit_status_"+f).innerHTML=""};var k={success:function(n){try{var l=YAHOO.lang.JSON.parse(n.responseText);if(l.cpanelresult.data[0].status=="1"){YAHOO.util.Dom.get("minute_info_"+f).innerHTML=a;YAHOO.util.Dom.get("hour_info_"+f).innerHTML=c;YAHOO.util.Dom.get("day_info_"+f).innerHTML=h;YAHOO.util.Dom.get("month_info_"+f).innerHTML=g;YAHOO.util.Dom.get("weekday_info_"+f).innerHTML=e;YAHOO.util.Dom.get("command_htmlsafe_"+f).innerHTML=b.html_encode();YAHOO.util.Dom.get("command_info_"+f).value=b;YAHOO.util.Dom.get("linekey_"+f).value=l.cpanelresult.data[0].linekey;CPANEL.widgets.status_bar("status_bar_"+f,"success",LANG.edit_successful);toggle_module("edit_module_"+f)}else{CPANEL.widgets.status_bar("status_bar_"+f,"error",CPANEL.lang.Error,l.cpanelresult.data[0].statusmsg)}}catch(m){CPANEL.widgets.status_bar("status_bar_"+f,"error",CPANEL.lang.json_error,CPANEL.lang.json_parse_failed)}d()},failure:function(l){d();CPANEL.widgets.status_bar("status_bar_"+f,"error",CPANEL.lang.ajax_error,CPANEL.lang.ajax_try_again)}};YAHOO.util.Connect.asyncRequest("GET",CPANEL.urls.json_api(i),k,"");YAHOO.util.Dom.setStyle("edit_input_"+f,"display","none");YAHOO.util.Dom.get("edit_status_"+f).innerHTML=CPANEL.icons.ajax+" "+LANG.editing_cron_job};var delete_line=function(a){if(window.demo_mode){return}var e={cpanel_jsonapi_version:2,cpanel_jsonapi_module:"Cron",cpanel_jsonapi_func:"remove_line",linekey:YAHOO.util.Dom.get("linekey_"+a).value};var b=function(){YAHOO.util.Dom.setStyle("delete_input_"+a,"display","block");YAHOO.util.Dom.get("delete_status_"+a).innerHTML=""};var c=function(){var g=YAHOO.util.Dom.getElementsByClassName("dt_info_row","tr","cron_jobs_table");var h=true;for(var f=0;f<g.length;f++){if(YAHOO.util.Dom.getStyle(g[f],"display")!="none"){h=false}}if(h==true){load_cron_table()}};var d={success:function(h){try{var f=YAHOO.lang.JSON.parse(h.responseText);if(f.cpanelresult.data[0].status=="1"){CPANEL.animate.fade_out("info_row_"+a);CPANEL.animate.fade_out("delete_module_"+a,c)}else{b();CPANEL.widgets.status_bar("status_bar_"+a,"error",CPANEL.lang.Error,f.cpanelresult.data[0].statusmsg)}}catch(g){b();CPANEL.widgets.status_bar("status_bar_"+a,"error",CPANEL.lang.json_error,CPANEL.lang.json_parse_failed)}},failure:function(f){b();CPANEL.widgets.status_bar("status_bar_"+a,"error",CPANEL.lang.ajax_error,CPANEL.lang.ajax_try_again)}};YAHOO.util.Connect.asyncRequest("GET",CPANEL.urls.json_api(e),d,"");YAHOO.util.Dom.setStyle("delete_input_"+a,"display","none");YAHOO.util.Dom.get("delete_status_"+a).innerHTML=CPANEL.icons.ajax+" "+LANG.deleting_cron_job};var validate_cron_email=function(){var a=YAHOO.util.Dom.get("email").value;if(a==""){return true}if(a==SYSTEM_ACCOUNT){return true}return CPANEL.validate.email(a)};var setup_email=function(){EMAIL_VALID=new CPANEL.validate.validator(LANG.email_address);EMAIL_VALID.add("email",validate_cron_email,LANG.cron_valid_email);EMAIL_VALID.attach();CPANEL.validate.attach_to_form("update_email",EMAIL_VALID,change_email);CPANEL.util.catch_enter("email","update_email")};var change_email=function(){if(window.demo_mode){return}var a=YAHOO.util.Dom.get("email").value;if(a==""){var b=confirm(LANG.confirm_empty_email);if(b==false){EMAIL_VALID.clear_messages();return}}var d={cpanel_jsonapi_version:2,cpanel_jsonapi_module:"Cron",cpanel_jsonapi_func:"set_email",email:a};var c={success:function(h){EMAIL_VALID.clear_messages();try{var f=YAHOO.lang.JSON.parse(h.responseText);if(f.cpanelresult.data[0].status=="1"){YAHOO.util.Dom.get("update_email").disabled=false;YAHOO.util.Dom.get("email_status").innerHTML="";CPANEL.widgets.status_bar("email_status_bar","success",LANG.email_updated);YAHOO.util.Dom.get("current_email").innerHTML=a;YAHOO.util.Dom.get("email").value=""}else{YAHOO.util.Dom.get("update_email").disabled=false;YAHOO.util.Dom.get("email_status").innerHTML="";CPANEL.widgets.status_bar("email_status_bar","error",CPANEL.lang.Error,f.cpanelresult.data[0].statusmsg)}}catch(g){YAHOO.util.Dom.get("update_email").disabled=false;YAHOO.util.Dom.get("email_status").innerHTML="";CPANEL.widgets.status_bar("email_status_bar","error",CPANEL.lang.json_error,CPANEL.lang.json_parse_failed)}check_empty_email()},failure:function(e){EMAIL_VALID.clear_messages();YAHOO.util.Dom.get("update_email").disabled=false;YAHOO.util.Dom.get("email_status").innerHTML="";CPANEL.widgets.status_bar("email_status_bar","error",CPANEL.lang.ajax_error,CPANEL.lang.ajax_try_again);check_empty_email()}};YAHOO.util.Connect.asyncRequest("GET",CPANEL.urls.json_api(d),c,"");YAHOO.util.Dom.get("update_email").disabled=true;YAHOO.util.Dom.get("email_status").innerHTML=CPANEL.icons.ajax+" "+LANG.changing_email};var init_email_div=function(){var a=YAHOO.util.Dom.get("current_email").innerHTML;if(a!=""){YAHOO.util.Dom.setStyle("edit_cron_email","display","block");YAHOO.util.Dom.get("email_toggle_more_less").innerHTML=CPANEL.lang.toggle_less}};var check_empty_email=function(){var a=YAHOO.util.Dom.get("current_email");if(a.innerHTML==""){a.innerHTML="("+LANG.none+")"}};var init=function(){if(CRONTAB_PERMISSIONS_ERROR==true){YAHOO.util.Dom.setStyle("crontab_interface","display","none");YAHOO.util.Dom.addClass("crontab_permissions_error","highlight2");YAHOO.util.Dom.addClass("crontab_permissions_error","cjt_status_bar_error");YAHOO.util.Dom.setStyle("crontab_permissions_error","display","block");return}VALID.minute=new CPANEL.validate.validator(LANG.Minute);VALID.minute.add("minute",function(){return validate_minute_field("minute")},LANG.cron_field_not_valid);VALID.minute.attach();VALID.hour=new CPANEL.validate.validator(LANG.Hour);VALID.hour.add("hour",function(){return validate_hour_field("hour")},LANG.cron_field_not_valid);VALID.hour.attach();VALID.day=new CPANEL.validate.validator(LANG.Day);VALID.day.add("day",function(){return validate_day_field("day")},LANG.cron_field_not_valid);VALID.day.attach();VALID.month=new CPANEL.validate.validator(LANG.Month);VALID.month.add("month",function(){return validate_month_field("month")},LANG.cron_field_not_valid);VALID.month.attach();VALID.weekday=new CPANEL.validate.validator(LANG.Weekday);VALID.weekday.add("weekday",function(){return validate_weekday_field("weekday")},LANG.cron_field_not_valid);VALID.weekday.attach();VALID.command=new CPANEL.validate.validator(LANG.Command);VALID.command.add("command","min_length(%input%, 1)",LANG.command_not_empty);VALID.command.attach();YAHOO.util.Event.on(["minute","hour","day","month","weekday"],"change",function(){check_common_options()});CPANEL.validate.attach_to_form("add_new_cron",VALID,add_new_cron_job);CPANEL.util.catch_enter(["minute","hour","day","month","weekday","command"],"add_new_cron");setup_email();init_email_div();check_empty_email();load_cron_table()};YAHOO.util.Event.onDOMReady(init);