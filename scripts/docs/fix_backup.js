/**
 * fix_backup.js - popravi okvarjen JSON backup (manjkajoč zaključni "]")
 * in ga dešifrira (AES-GCM, izpeljano iz gesla prek PBKDF2).
 *
 * TIP SKRIPTE: brskalniški bookmarklet / devtools console script.
 * Ni namenjen zagonu prek Node.js ali tega dashboarda - poganjaš ga tako,
 * da odpreš devtools konzolo v brskalniku (na strani, kjer imaš dostop do
 * `crypto.subtle` in file pickerja) in prilepiš celotno vsebino spodaj.
 *
 * GESLO: prej je bilo trdo kodirano v skripti ("saso-1982"). Zdaj je
 * zamenjano s PASSWORD placeholderjem - pred uporabo ga ročno zamenjaj s
 * pravim geslom. Nikoli ga ne commitaj v Git z dejansko vrednostjo.
 */

(async () => {
  // 1. File picker prek input elementa
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.click();

  const file = await new Promise(res => input.onchange = () => res(input.files[0]));
  console.log('File:', file.name, (file.size/1024/1024).toFixed(1)+'MB');

  const text = await file.text();
  const pkg = JSON.parse(text);
  console.log('Parsed OK, data length:', pkg.data?.length?.toLocaleString());

  // 2. Dešifriranje
  const password = "PASSWORD"; // <- pred uporabo zamenjaj s pravim geslom
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({name:'PBKDF2',salt:new Uint8Array(pkg.salt),iterations:100000,hash:'SHA-256'}, keyMaterial, {name:'AES-GCM',length:256}, false, ['decrypt']);

  const bin = atob(pkg.data);
  const cipherBytes = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) cipherBytes[i]=bin.charCodeAt(i);
  console.log('Decrypting...');

  const decrypted = await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(pkg.iv)}, key, cipherBytes);
  let json = new TextDecoder().decode(decrypted);
  console.log('Decrypted OK, length:', json.length.toLocaleString());
  console.log('Konec pred popravkom:', JSON.stringify(json.slice(-80)));

  // 3. Popravi manjkajoči ']'
  json = json.trimEnd().replace(/\n}$/, ']\n}');
  console.log('Konec po popravku:', JSON.stringify(json.slice(-80)));

  // 4. Validacija
  try {
    const parsed = JSON.parse(json);
    console.log('✓ JSON valid — dreams:', parsed.dreams?.length, 'interps:', parsed.interpretations?.length);
  } catch(e) {
    console.error('✗ JSON invalid:', e.message);
    return;
  }

  // 5. Download
  const blob = new Blob([json], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='fixed-backup.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('✓ fixed-backup.json downloaded');
})();
