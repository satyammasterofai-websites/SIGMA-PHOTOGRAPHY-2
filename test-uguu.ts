const form = new FormData();
form.append('files[]', new Blob(['hello world'], { type: 'text/plain' }), 'test.txt');

fetch('https://uguu.se/upload', {
  method: 'POST',
  body: form
}).then(res => res.json()).then(console.log).catch(console.error);
