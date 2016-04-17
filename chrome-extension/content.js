var g = {
  url: "",
  init_1: false,
  init_2: false,
  interval: false
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
  console.log(window.$.fn.jquery);
  console.log('init');
  if (!g.interval){
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

function init_1() {
    var subm = $('#step--response__submit');
    console.log($('#step--response__submit').get(0));
    console.log($._data($('#step--response__submit').get(0), 'events'));
    var func = $._data(subm.get(0), 'events').click[0];

    $._data(subm.get(0), 'events').click[0] = function(e){
      console.log('wait1');
      ajax({
        type: "POST",
        url: g.url,
        dataType: "json",
        data: $('#submission__answer__part__text__1').text()},

        function(msg){
          if (msg.success){
            func1(e);
          } else {
            alert('Change your text');
          }
        },
        function(){
          alert('server-error');
        });
    }
}

function init_2() {
  var subm = $('#peer-assessment--001__assessment__submit');
  var func = $._data(subm.get(0), 'events').click[0];

  $._data(subm.get(0), 'events').click[0] = function(e){
    console.log('wait2');
    ajax({
      type: "POST",
      url: g.url,
      dataType: "json",
      data: $('#assessment__rubric__question--feedback__value').text() + $('#assessment__rubric__question--0__feedback').text()},

      function(msg){
        if (msg.success){
          func(e);
        } else {
          alert('Change your text');
        }
      },
      function(){
        alert('server-error');
      }
    );
  }
}

var ij = false;

function injectScript(file, node) {
  if(!ij){
    ij = true;
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
  }
}

chrome.runtime.onMessage.addListener(function(request) {
    switch (request.func) {
        case 'init': injectScript( chrome.extension.getURL('/inject.js'), 'body'); break;
    }
});
