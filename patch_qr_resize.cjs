const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ManageSettings.tsx', 'utf-8');

const oldHandleQRUpload = `  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPaymentQRBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };`;

const newHandleQRUpload = `  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Compress image before saving to avoid 1MB Firestore limit
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (ev) => {
        img.src = ev.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setPaymentQRBase64(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };`;

code = code.replace(oldHandleQRUpload, newHandleQRUpload);

fs.writeFileSync('src/pages/admin/ManageSettings.tsx', code);
console.log("Patched QR code upload with compression");
