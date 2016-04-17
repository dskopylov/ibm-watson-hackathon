chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request['func'] == 'ajax') {
        var params = request['params'];
        params.success = function(data){
            sendResponse({"success": true,
                          "data": data});
        };
        params.error = function(){
            sendResponse({"success": false});
        };
        $.ajax(params);
        return true;
    }
});

function init(tab_id){
    chrome.tabs.sendMessage(tab_id, {'func': 'init'});
}

chrome.tabs.onActivated.addListener(init);
chrome.tabs.onUpdated.addListener(init);
chrome.tabs.onCreated.addListener(init);
