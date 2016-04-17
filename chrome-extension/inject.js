// 192.168.43.188
var g = {
  url: "http://localhost:8888/text/",
  init_1: false,
  init_2: false,
  interval: false
}

var labs = {
  "SATPlus": "http://0.0.0.0:8888/static/SATPlus/indexSatPlus.html",
  "Nback": "http://0.0.0.0:8888/static/N-Back/indexNBack.html",
  "3DTetris": "http://0.0.0.0:8888/static/3D_TETRIS/index3DTetris.html",
  "CPT": "http://0.0.0.0:8888/static/CPT/indexCPT.html",
  "MathProc":   "http://0.0.0.0:8888/static/MathProcTask/indexMathProc.html",
  "MentalRotation": "http://0.0.0.0:8888/static/MentalRotation/indexMentalRotation.html",
  "ProgrMatrices": "http://0.0.0.0:8888/static/StandardProgressiveMatrices/indexStProgMatr.html"
}

function ajax(params, success, error){
    chrome.runtime.sendMessage({"func": "ajax", "params": params}, function(response) {
        if (response.success) {
            success(response.data);
        } else {
            error();
        }
    });
}

function init() {
  if (!g.interval){
    iframe();
    setInterval(function(){
      if(!g.init_1 && $('#step--response__submit').length){
        console.log('1111');
        g.init_1 = true;
        init_1();
      }

      if(!g.init_2 && $('#peer-assessment--001__assessment__submit').length){
        console.log('2222');
        g.init_2 = true;
        init_2();
      }
    }, 1000);

    g.interval = true;
  }
}
var isPressed = false;

function show_mistakes($el, full_text, mistakes){
  var html = '<div class="mistakes">'+full_text+'</div>';
  mistakes.forEach(function(v){
    html = html.replace(new RegExp(v, "g"), '<span style="color:red;">' + v + '</span>');
  });
  if ($el.prev().attr('class') == "mistakes") {
    $el.prev().html(html);
  } else {
    $el.before($(html));
  }
}

function init_1() {
    var subm = $('#step--response__submit');
    var func = $._data(subm.get(0), 'events').click[0].handler;

    $._data(subm.get(0), 'events').click[0].handler = function(e){
      e.preventDefault();
      console.log('wait1');

      // if (isPressed){
      //   func(e);
      // }  else {
      $.ajax({
        type: "POST",
        url: g.url,
        dataType: "json",
        data: {data: $('#submission__answer__part__text__1').val()},
        success: function(msg){
          // console.log(msg)
          // if (!isPressed){
          if(msg.training){
            alert("Your emotional tone is out of normal range, please participate in traing!");
            $('#Iframe').attr('src', labs[msg.training]);
            $('#Iframe').show();
            $('#Iframe_button').show();
            show_mistakes($('#submission__answer__part__text__1'), $('#submission__answer__part__text__1').val(), msg.sentences)
          } else{
            func(e);
          }
        },
        done: function(data){
          // console.log(data);
        },
        error: function(data){
          if (data.responseText){
          // if (!isPressed){
            alert("Your emotional tone is out of normal range, please participate in traing!");
            $('#Iframe').attr('src', labs[data.responseText]);
            $('#Iframe').show();
            $('#Iframe_button').show();
          // }
        }else{
          func(e);
        }
        }});

      }
    // }
}

function iframe() {
  var html = '<iframe id="Iframe" src="" style="'+
    'position: fixed;'+
    'display: none;'+
    'z-index: 1000;'+
    'width: 1280px;'+
    'height: 600px;'+
    'transform: scale(0.7);"'+
'></iframe>'+
'<button id="Iframe_button" style="'+
    'position: fixed;'+
    'display: none;'+
    'top: 10px;'+
    'z-index: 1000;'+
    'right: 10px;'+
'">I am OK!</button>';

$('body').prepend(html);
$('#Iframe_button').click(function(){
  isPressed = true;
  $('#Iframe').hide();
  $('#Iframe_button').hide();
})
}

function init_2() {
  var subm = $('#peer-assessment--001__assessment__submit');
  var func = $._data(subm.get(0), 'events').click[0].handler;

  $._data(subm.get(0), 'events').click[0].handler = function(e){
    console.log('wait2');
    $.ajax({
      type: "POST",
      url: g.url,
      dataType: "json",
      data: {data: $('#assessment__rubric__question--feedback__value').val()
      + $('#assessment__rubric__question--0__feedback').val()},

      success: function(msg){
        if(msg.training){
          alert("Your emotional tone is out of normal range, please participate in traing!");
          $('#Iframe').attr('src', labs[msg.training]);
          $('#Iframe').show();
          $('#Iframe_button').show();
          show_mistakes($('#assessment__rubric__question--feedback__value'), $('#assessment__rubric__question--feedback__value').val(), msg.sentences)
          show_mistakes($('#assessment__rubric__question--0__feedback'), $('#assessment__rubric__question--0__feedback').val(), msg.sentences)
        } else{
          func(e);
        }
      },
      error: function(data){
      //   if (data.responseText){
      //     alert("Your emotional tone is out of normal range, please participate in traing!");
      //     $('#Iframe').attr('src', labs[data.responseText]);
      //     $('#Iframe').show();
      //     $('#Iframe_button').show();
      // }else{
      //   func(e);
      // }
      }
    });
  }
}

$(document).ready(init)
