function save_options() {
  var url = document.getElementById('url').value;
  var hash = document.getElementById('hash').value;
  chrome.storage.sync.set({
    url: url,
    hash: hash
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    url: '',
    hash: ''
  }, function(items) {
    document.getElementById('url').value = items.url;
    document.getElementById('hash').value = items.hash;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);