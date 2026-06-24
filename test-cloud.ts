const form = new FormData();
form.append('file', new Blob(['hello world'], { type: 'text/plain' }), 'test.txt');
form.append('upload_preset', 'docs_upload_preset_tutorial');

fetch('https://api.cloudinary.com/v1_1/demo/auto/upload', {
  method: 'POST',
  body: form
}).then(res => res.json()).then(console.log).catch(console.error);
