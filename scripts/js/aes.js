const SALT = "WyuZFx5zOy65AsZRGLJcn8OFuGq5LvMI";

function decrypt(txt, skey) {
  var salt = encryptWSalt(SALT, skey, SALT);
  skey = (skey + salt).substring(0, 32);
  var key = CryptoJS.enc.Utf8.parse(skey);
  var iv = CryptoJS.enc.Utf8.parse(skey.substring(0, 16));
  return reverseUmlaute(CryptoJS.AES.decrypt(txt, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8));
}

function encrypt(txt, skey) {
  txt = replaceUmlaute(txt);
  var salt = encryptWSalt(SALT, skey, SALT);
  skey = (skey + salt).substring(0, 32);
  var key = CryptoJS.enc.Utf8.parse(skey);
  var iv = CryptoJS.enc.Utf8.parse(skey.substring(0, 16));
  return CryptoJS.AES.encrypt(txt, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  }).toString();
}

function encryptWSalt(txt, skey, salt) {
  skey = (skey + salt).substring(0, 32);
  var key = CryptoJS.enc.Utf8.parse(skey);
  var iv = CryptoJS.enc.Utf8.parse(skey.substring(0, 16));
  return CryptoJS.AES.encrypt(txt, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  }).toString();
}

const umlautMap = new Map();
umlautMap.set('\u00dc', '#ueBG#');
umlautMap.set('\u00c4', '#aeBG#');
umlautMap.set('\u00d6', '#oeBG#');
umlautMap.set('\u00fc', '#ueSL#');
umlautMap.set('\u00e4', '#aeSL#');
umlautMap.set('\u00f6', '#oeSL#');
umlautMap.set('\u00df', '#ssSL#');

function replaceUmlaute(str) {
  return str.replace(/ä|ö|ü|ß/gi, function(matched){
    return umlautMap.get(matched);
  });
}

function reverseUmlaute(str) {
  return str.replace(/#aeSL#|#oeSL#|#ueSL#|#ssSL#|#aeBG#|#oeBG#|#ueBG#/gi, function(matched){
    return getByValue(umlautMap, matched);
  });
}

function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue)
      return key;
  }
}
