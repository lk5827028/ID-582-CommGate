var expanded={};var expanding={};var tracker={};var expc=[];var expander_active=0;var expander_on=0;function getTime(){var a=new Date();return(a.getTime())}function unshadow(a){if(!expander_on){return}var b=a.split("_");if(b[b.length-1]=="0"){b.pop()}else{return a}return b.join("_")}function shadow(a){return a+"_0"}function runAnimOut_single(j){if(!expander_on||!j){return}var i=j.id;if(!expanded[i]){return}if(expanding[i]){tracker[i]=getTime();return}var a=shadow(j.id);var c=YAHOO.util.Dom.get(a);var f=(c.getElementsByTagName("img"))[0];var d=(j.getElementsByTagName("img"))[0];var b=YAHOO.util.Dom.getXY(j);var e={width:{to:j.offsetWidth},height:{to:j.offsetHeight},points:{to:[b[0],b[1]]},fontSize:{from:11,to:7,unit:"px"}};var g=function(){expanded[i]=0;if(!c||!c.parentNode){return}c.parentNode.removeChild(c)};if(d){var h={width:{to:d.offsetWidth},height:{to:d.offsetHeight}};var l=new YAHOO.util.Motion(f,h,0.4,YAHOO.util.Easing.easeOut);l.animate()}var k=new YAHOO.util.Motion(c,e,0.4,YAHOO.util.Easing.easeOut);if(!expanded[i]){return}k.onComplete.subscribe(g);k.animate()}function trackAnim(a){if(!a){return}delete tracker[a.id];return false}function runAnimOut(a){if(!expander_on||!a){return}var b=a.id;if(!expanded[b]){tracker[b]=0;return}tracker[b]=getTime()}var handleOuts=function(b){if(!expander_on){return}var a=getTime();for(var c in tracker){if(tracker.hasOwnProperty(c)){if(b||(tracker[c]>0&&(tracker[c]+300)<a)){if(expanding[c]){tracker[c]=getTime();continue}delete tracker[c];runAnimOut_single(YAHOO.util.Dom.get(c))}}}};function trackAnim_wrapper(a){if(!expander_on){return}trackAnim(YAHOO.util.Dom.get(unshadow(this.id)))}function runAnimOut_wrapper(a){if(!expander_on){return}runAnimOut(YAHOO.util.Dom.get(unshadow(this.id)))}function handleOuts_wrapper(){if(!expander_on){return}handleOuts(1)}function pop_start(){if(!expander_on){return}if(!YAHOO){return}for(var c=0;c<expc.length;c++){var d=YAHOO.util.Dom.get(expc[c]);var a=d.getElementsByTagName("td");for(var b=0;b<a.length;b++){if(YAHOO.util.Dom.hasClass(a[b],"exptextboxpre")){a[b].className="exptxtbox"}else{if(YAHOO.util.Dom.hasClass(a[b],"maindisp")){a[b].className="mainhide"}else{if(YAHOO.util.Dom.hasClass(a[b],"mainhide")){a[b].className="maindisp"}}}}}expander_active=1;setInterval(handleOuts,250);YAHOO.util.Event.addListener(document,"mousemove",handleOuts_wrapper)}function register_expander_container(a){expander_on=1;expc.push(a)}function register_expander_obj(a){expander_on=1}function runAnimOver_single(o,e){if(!expander_on||!o){return}var n=o.id;if(expanded[n]||expanding[n]){return}expanding[n]=1;var a=YAHOO.util.Dom.getXY(o);var b=document.createElement("div");var c=o.id+"_0";b.id=c;b.className="expbox";b.innerHTML=o.innerHTML;YAHOO.util.Dom.get("divgen_expand").appendChild(b);YAHOO.util.Event.addListener(b,"mousemove",trackAnim_wrapper,this);YAHOO.util.Event.addListener(b,"mouseout",runAnimOut_wrapper,this);handleOuts(1);b.style.border="solid 1px";b.style.background="#fff";b.style.position="absolute";b.style.zIndex=30;b.style.left=a[0]+"px";b.style.top=a[1]+"px";var j=(a[1]-o.offsetHeight/2);var i=(a[0]-o.offsetWidth/2);var l={width:{to:(o.offsetWidth*2)},height:{to:(o.offsetHeight*2)},points:{to:[i,j]},fontSize:{from:7,to:11,unit:"px"}};var h=(b.getElementsByTagName("img"))[0];var d=(o.getElementsByTagName("img"))[0];var m=function(){if(tracker[n]===null){tracker[n]=0}expanded[n]=1;expanding[n]=0};var g=new YAHOO.util.Motion(b,l,0.4);g.onComplete.subscribe(m);g.animate();if(h&&d){var k={width:{to:(d.offsetWidth*2)},height:{to:(d.offsetHeight*2)}};var f=new YAHOO.util.Motion(h,k,0.4);f.animate()}}function runAnimOver(a){if(!expander_on||!a){return}runAnimOver_single(YAHOO.util.Dom.get(unshadow(a.id)))}YAHOO.util.Event.onDOMReady(pop_start);