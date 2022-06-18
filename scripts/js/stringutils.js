var possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.!?=@-_\/(){}[]:"

function cleanString(input) {
  var output = "";
  Array.from(input).forEach((e, i) => {
    Array.from(possibleChars).forEach((f, y) => {
      if(f == e) {
        output += e;
      }
    });
  });
  return output;
}

const random = (length = 8) => {
    return Math.random().toString(16).substr(2, length);
};
