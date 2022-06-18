//** Link **\\
const API_VERSION = 2, PORT = 8443;

function getApiURL(requestType) {
  return "https://api.cuodex.net:" + PORT + "/passx/v" + API_VERSION + "/" + requestType  ;
}

function sendApiRequest(requestType, method, data, success, error) {
  sendApiRequest(requestType, method, data, success, error, "");
}

function sendApiRequest(requestType, method, data, success, error, sesionId) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, getApiURL(requestType), true);
  xhr.setRequestHeader("Content-Type", "application/json");
  if(sessionId) {
    xhr.setRequestHeader("Authorization", "Bearer " + sessionId);
  }
  xhr.onload = function() {
    var response = JSON.parse(xhr.response), status = String(response.status);
    if(status.includes("201") || status.includes("200") || status.includes("202")) {
      success(response);
    }else {
      error(response);
    }
  };
  xhr.onerror = internalServerError;
  var data = JSON.stringify(data);
  xhr.setRequestHeader("Access-Control-Allow-Origin", "https://api.cuodex.net");
  xhr.setRequestHeader("Access-Control-Allow-Methods", "POST");
  xhr.setRequestHeader("Access-Control-Allow-Headers", "accept, content-type");
  xhr.setRequestHeader("Access-Control-Max-Age", "1728000");
  xhr.send(data);
}
function internalServerError() {
  //window.location.href= "https://cuodex.net/error/500";
}

function getPasswordTest(s) {
  return encrypt("encryptionTest", s);
}

//** Change Account Information **\\

function checksessionId() {
  sendApiRequest("auth/check-session", "POST", {"sessionId": sessionId}, function() {}, function() {
    password = ""
    toggleCenteredPopUp("invalidsession-popup");
    document.getElementById("invalidsession-popup-error").innerHTML = response.error;
  });
  setTimeout(checksessionId, 30* 1000);
}

function openChangePassword() {
  openCenteredPopUp("change-password");
  document.getElementById("change-password-input").value = "";
  document.getElementById("change-password-repeat-input").value = "";
  document.getElementById("change-password-old-input").value = "";
}

function changePassword() {
  closeCenteredPopUp("change-password");
  if(document.getElementById("change-password-input").value == document.getElementById("change-password-repeat-input").value) {
    sendApiRequest("account/change-password", "PATCH", {
      "passwordTest": password,
      "newPasswordTest": encrypt("encryptionTest", document.getElementById("change-password-input").value)
    }, function() {
      password = document.getElementById("change-password-input").value;
      document.cookie = username + "," + password.length;
      setNotificationPopUp("Password Changed", "You successfully changed your password");
    }, function(r) {
      setNotificationPopUp("Error", r.message);
    }, sessionId);
  }else {
    setNotificationPopUp("Error", "Your entered passwords don't match");
  }
}

function openChangeEmail() {
  openCenteredPopUp("change-email");
  document.getElementById("change-email-input").value = email;
}

function changeEmail() {
  closeCenteredPopUp("change-email");
  var newEmail = document.getElementById("change-email-input").value;
  if(newEmail != email) {
    sendApiRequest("account/information", "PUT", {
      "passwordTest": getPasswordTest(password),
      "data": {
        "email": newEmail
      }
    }, function() {
      setNotificationPopUp("Email Address Changed", "You successfully changed your email address from <b>" + email + "</b> to <b>" + newEmail + "</b>");
      email = newEmail;
    }, function(r) {
      setNotificationPopUp("Error", r.message);
    }, sessionId);
  }
}

//** Password List Communication **\\
var clickedPasswordElement;

var passwords = [];

var currentEditId = 0;

function saveEditPopUp() {
  var content = document.getElementById("edit-popup-content");
  sendApiRequest("entries/" + passwords[currentEditId][6], "PUT", {
    "entryService": encrypt(content.childNodes[1].value, password),
    "entryUrl": encrypt(content.childNodes[9].value, password),
    "entryDescription": encrypt(content.childNodes[17].value, password),
    "entryUsername": encrypt(content.childNodes[3].value, password),
    "entryEmail": encrypt(content.childNodes[6].value, password),
    "entryPassword": encrypt(content.childNodes[13].value, password)
  }, function() {
    closeEditPopUp();
    addContents();
  }, function(r) {
    setNotificationPopUp("Error", r.message);
  }, sessionId);
}

function openEditPopUp(id) {
  currentEditId = id;
  clickedPasswordElement = document.getElementById(id);
  var entryContent = passwords[id];
  var content = document.getElementById("edit-popup-content");
  document.getElementById("visibility-btn").src = "assets/icons/visible.png";
  document.getElementById("edit-password").type = "password";
  content.childNodes[1].value = entryContent[0];
  content.childNodes[3].value = entryContent[1];
  content.childNodes[6].value = entryContent[3];
  content.childNodes[9].value = entryContent[5];
  content.childNodes[13].value = entryContent[2];
  content.childNodes[17].value = entryContent[4];
  openCenteredPopUp("edit-popup");
}

function closeEditPopUp() {
  closeCenteredPopUp("edit-popup");
  var content = document.getElementById("edit-popup-content");
  content.childNodes[1].value = "";
  content.childNodes[3].value = "";
  content.childNodes[6].value = "";
  content.childNodes[9].value = "";
  content.childNodes[13].value = "";
}

function addPassword() {
  if(document.getElementById("add-password").value == document.getElementById("add-repeatpassword").value) {
    sendApiRequest("entries", "POST", {
      "entryService": encrypt(document.getElementById("add-title").value, password),
      "entryUrl": encrypt(document.getElementById("add-website").value, password),
      "entryDescription": encrypt(document.getElementById("add-description").value, password),
      "entryEmail": encrypt(document.getElementById("add-email").value, password),
      "entryUsername": encrypt(document.getElementById("add-username").value, password),
      "entryPassword": encrypt(document.getElementById("add-password").value, password)
    }, function() {
      toggleCenteredPopUp('add-popup');
      addContents();
    }, function(r) {
      setNotificationPopUp("Error", r.message);
    }, sessionId);

  }else {
    setNotificationPopUp("Error", "The entered passwords do not match");
  }
}

function deletePassword() {
  sendApiRequest("entries/" + passwords[clickedPasswordElement.id][6], "DELETE", {}, function() {
    addContents();
    closeCenteredPopUp("delete-popup");
  }, function(r) {
    setNotificationPopUp("Error", r.message);
  }, sessionId);
}

function addContents() {
  document.getElementById("accountinfo-name").innerHTML = username;
  sendApiRequest("entries", "GET", {}, function(response) {
    passwords = [];
    setTimeout(checksessionId, 1000*30);
    setTimeout(reloadContents, 1000*60);
    for(var index in response.data.entries) {
      var e = response.data.entries[index];
      passwords.push([cleanString(decrypt(e.title, password)), cleanString(decrypt(e.username, password)), decrypt(e.password, password), cleanString(decrypt(e.email, password)), cleanString(decrypt(e.description, password)), cleanString(decrypt(e.url, password)), e.id]);
    }
    reloadPasswords();
  }, function(response) {
    setNotificationPopUp("Error", response.message);
  }, sessionId);
}

function reloadPasswords() {
  var passwordTable = document.getElementById("passwordTable");
  if(passwords != "") {
    var searchContent = document.getElementById("search-bar").value;
    passwordTable.innerHTML = "<tr class='title'><th>Title</th><th>Username</th><th>Password</th><th>Email</th><th>URL</th><th>Description</th></tr>";
    for(var arrayIndex in passwords) {
      if(passwords[arrayIndex][0].toLowerCase().includes(searchContent.toLowerCase()) ||
         passwords[arrayIndex][1].toLowerCase().includes(searchContent.toLowerCase()) ||
         passwords[arrayIndex][3].toLowerCase().includes(searchContent.toLowerCase()) ||
         passwords[arrayIndex][4].toLowerCase().includes(searchContent.toLowerCase()) ||
         passwords[arrayIndex][5].toLowerCase().includes(searchContent.toLowerCase())) {
        var description = passwords[arrayIndex][4];
        if(description.length > 20) {
          description = description.slice(0, 20) + "...";
        }
        var title = passwords[arrayIndex][0];
        if(title.length > 13) {
          title = title.slice(0, 13) + "...";
        }
        passwordTable.innerHTML += "<tr id='" + arrayIndex + "' onclick='openEditPopUp(" + arrayIndex + ")'><th>" + title + "</th><th>" + passwords[arrayIndex][1] + "</th><th>" + displayPassword(passwords[arrayIndex][2]) + "</th><th>" + passwords[arrayIndex][3] + "</th><th>" + passwords[arrayIndex][5] + "</th><th>" + description + "</th></tr>";
      }
    }
    document.getElementById("emtyInfo").style.display = "none";
  }else {
    passwordTable.innerHTML = "";
    document.getElementById("emtyInfo").style.display = "block";
  }

}

function isOnPasswordElement(x, y) {
  var searchContent = document.getElementById("search-bar").value;
  var passwordTable = document.getElementById("passwordTable");
  for(var arrayIndex in passwords) {
    if(passwords[arrayIndex][0].toLowerCase().includes(searchContent.toLowerCase()) ||
       passwords[arrayIndex][1].toLowerCase().includes(searchContent.toLowerCase()) ||
       passwords[arrayIndex][3].toLowerCase().includes(searchContent.toLowerCase()) ||
       passwords[arrayIndex][4].toLowerCase().includes(searchContent.toLowerCase())) {
         var current = document.getElementById(arrayIndex);
         var wrapper = document.getElementById("passwordsWrapper");
         if(x >= wrapper.getBoundingClientRect().left && x <= wrapper.getBoundingClientRect().left + wrapper.offsetWidth && y >= wrapper.getBoundingClientRect().top && y <= wrapper.getBoundingClientRect().top + wrapper.offsetHeight) {
           if(x >= current.getBoundingClientRect().left && x <= current.getBoundingClientRect().left + current.offsetWidth && y >= current.getBoundingClientRect().top && y <= current.getBoundingClientRect().top + current.offsetHeight) {
             clickedPasswordElement = current;
             return true;
           }
         }
    }
  }
  return false;
}

reloadPasswords();


function copyUsername() {
  var content = clickedPasswordElement.childNodes[1].innerHTML;
  navigator.clipboard.writeText(content);
  setNotificationPopUp("Copied Username", "You successfully copied the Username: <b>" + content + "</b>");
  forceHideDropdownMenus();
}
function copyEmail() {
  var content = clickedPasswordElement.childNodes[3].innerHTML;
  navigator.clipboard.writeText(content);
  setNotificationPopUp("Copied Email", "You successfully copied the Email: <b>" + content + "</b>");
  forceHideDropdownMenus();
}
function copyURL() {
  var content = passwords[clickedPasswordElement.id][4].innerHTML;
  navigator.clipboard.writeText(content);
  setNotificationPopUp("Copied Website", "You successfully copied the URL: <b>" + content + "</b>");
  forceHideDropdownMenus();
}
function openURL() {
  var content = passwords[clickedPasswordElement.id][5];
  window.open(content, '_blank');
}
function copyPassword() {
  var content = passwords[clickedPasswordElement.id][2];
  navigator.clipboard.writeText(content);
  setNotificationPopUp("Copied Password", "You successfully copied your Password: <b>" + displayPassword(content) + "</b>");
  forceHideDropdownMenus();
}
function visiblePassword() {
  var els = document.getElementsByClassName("visibility-btn");
  for(var i = 0; i < els.length; i++)
  {
    if(els[i].src.includes("assets/icons/visible.png")) {
      els[i].src = "assets/icons/invisible.png";
      var inputs = document.getElementsByClassName("password-input");
      for(var y = 0; y < inputs.length; y++)
      {
        inputs[y].type = "text";
      }
    }else {
      els[i].src = "assets/icons/visible.png";
      var inputs = document.getElementsByClassName("password-input");
      for(var y = 0; y < inputs.length; y++)
      {
        inputs[y].type = "password";
      }
    }
  }
}
function visibleChangePasswordOld() {
  if(document.getElementById("visibility-btn-change-pswd-old").src.includes("assets/icons/visible.png")) {
    document.getElementById("visibility-btn-change-pswd-old").src = "assets/icons/invisible.png";
    document.getElementById("change-password-old-input").type = "text";
  }else {
    document.getElementById("visibility-btn-change-pswd-old").src = "assets/icons/visible.png";
    document.getElementById("change-password-old-input").type = "password";
  }
}
function visibleChangePasswordInput() {
  if(document.getElementById("visibility-btn-change-pswd").src.includes("assets/icons/visible.png")) {
    document.getElementById("visibility-btn-change-pswd").src = "assets/icons/invisible.png";
    document.getElementById("change-password-input").type = "text";
    document.getElementById("change-password-repeat-input").type = "text";
  }else {
    document.getElementById("visibility-btn-change-pswd").src = "assets/icons/visible.png";
    document.getElementById("change-password-input").type = "password";
    document.getElementById("change-password-repeat-input").type = "password";
  }
}


//** Login Communication **\\
var password, username, email, sessionId;

document.getElementById("login-password").addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    checkIfLoginErrorAnOpenCookie();
  }
});
document.getElementById("login-username").addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    checkIfLoginErrorAnOpenCookie();
  }
});

function logout() {
  document.cookie = "mty";
  location.reload(true);
}

var loginCount = 0;

var canLogin = true;
function loginAgain() {
  if(loginCount <= 15) {
    if(canLogin) {
      canLogin = false;
      var passwordEntry = "";
      for(var i = 0; i < document.getElementById("login-again-passwords").children.length; i++) {
        passwordEntry += document.getElementById("login-again-passwords").children[i].children[0].value;
      }
      var cookieUsername = document.cookie.split(",")[0], passwordTest = getPasswordTest(passwordEntry);
      sendApiRequest("auth/login", "POST", {
        "username": cookieUsername,
        "passwordTest": passwordTest
      }, function(response) {
        loginCount += 1;
        if(decrypt(passwordTest, passwordEntry) == "encryptionTest") {
          password = passwordEntry;
          username = cookieUsername;
          sessionId = response.data.sessionId;
          email = response.data.email;
          if(cookies) {
            document.cookie = username + "," + password.length;
          }
          for(var i = 0; i < document.getElementById("login-again-passwords").children.length; i++) {
            document.getElementById("login-again-passwords").children[i].style.animation = "5s login-again-entry-hide";
            document.getElementById("login-again-passwords").children[i].style.animationDelay = (i*0.05) + "s";
          }
          setTimeout(function() {
            document.getElementById("login-again-wrapper").classList.add("hidden");
            openMain();
            closeCookie();
            setTimeout(function() {
              canLogin = true;
              document.getElementById("login-again-wrapper").style.display = "none";
            }, 100);
          }, document.getElementById("login-again-passwords").children.length*0.05*1000);
          addContents();
        }
      }, function(response) {
        setNotificationPopUp("Error", response.message);
        for(var i = 0; i < document.getElementById("login-again-passwords").children.length; i++) {
          document.getElementById("login-again-passwords").children[i].children[0].value = "";
        }
        document.getElementById("login-again-passwords").children[0].children[0].focus();
        document.getElementById("login-again-passwords").children[0].style.marginLeft = "-30px";
        setTimeout(function() {
          document.getElementById("login-again-passwords").children[0].style.marginLeft = "0px";
          canLogin = true;
        }, 300);
      });
    }
  }else {
    setNotificationPopUp("Error", "You have sent to many login requests. Please reload the page!");
  }
}

function checkIfLoginErrorAnOpenCookie() {
  if(loginCount <= 15) {
    if(document.getElementById("login-username").value != "" && document.getElementById("login-password").value != "") {
      var passwordTest = getPasswordTest(document.getElementById("login-password").value);
      document.getElementById("register-loader").style.width = "30%";
      sendApiRequest("auth/login", "POST", {"username": document.getElementById("login-username").value, "passwordTest": passwordTest}, function(response) {
        loginCount += 1;
        if(decrypt(passwordTest, document.getElementById("login-password").value) == "encryptionTest") {
          openCookie();
        }else {
          document.getElementById("login-error").innerHTML = "You entered the wrong password";
        }
        document.getElementById("register-loader").style.width = "100%";
        setTimeout(function() {
          document.getElementById("register-loader").style.opacity = "0";
        }, 500);
        setTimeout(function() {
          document.getElementById("register-loader").style.width = "0";
          openLogin();
        }, 700);
        setTimeout(function() {
          document.getElementById("register-loader").style.opacity = "1";
        }, 1200);
      }, function(response) {
        document.getElementById("login-error").innerHTML = response.error || response.message;
        setTimeout(function() {
          document.getElementById("register-loader").style.width = "0";
        }, 300);
      });
    }else {
      document.getElementById("login-error").innerHTML = "Please fill in all fields";
    }
  }else {
    document.getElementById("login-error").innerHTML = "You have sent to many login requests. Please reload the page!";
  }
}

function login() {
  if(loginCount <= 15) {
    if(document.getElementById("login-username").value != "" && document.getElementById("login-password").value != "") {
      var passwordTest = getPasswordTest(document.getElementById("login-password").value);
      sendApiRequest("auth/login", "POST", {
        "username": document.getElementById("login-username").value,
        "passwordTest": passwordTest
      }, function(response) {
        if(decrypt(passwordTest, document.getElementById("login-password").value) == "encryptionTest") {
          document.getElementById("login-error").innerHTML = "";
          password = document.getElementById("login-password").value;
          username = document.getElementById("login-username").value;
          sessionId = response.data.sessionId;
          email = response.email;
          if(cookies) {
            document.cookie = username + "," + password.length;
          }
          addContents();
          openMain();
          closeCookie();
        }else {
          document.getElementById("login-error").innerHTML = "You entered the wrong password";
        }
      }, function(r) {
        document.getElementById("login-error").innerHTML = r.message;
      })

    }else {
      document.getElementById("login-error").innerHTML = "Please fill in all fields";
    }
  }else {
    document.getElementById("login-error").innerHTML = "You have sent to many login requests. Please reload the page!";
  }
}

document.getElementById("register-password").addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    register();
  }
});
document.getElementById("register-username").addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    register();
  }
});
document.getElementById("register-repeatpassword").addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    register();
  }
});
document.getElementById("register-email").addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    register();
  }
});

function containsUpperCase(str) {
  for (var i = 0; i < str.length; i++) {
    if(!/\d/.test(str.charAt(i))) {
      if(str.charAt(i) == str.charAt(i).toUpperCase()) {
        return true;
      }
    }
  }
  return false;
}

function containsLowerCase(str) {
  for (var i = 0; i < str.length; i++) {
    if(!(/\d/.test(str.charAt(i)))) {
      if(str.charAt(i) == str.charAt(i).toLowerCase()) {
        return true;
      }
    }

  }
  return false;
}

function register() {
  var passwdInput = document.getElementById("register-password").value;
  var errorObj = document.getElementById("register-error");
  if(document.getElementById("register-username").value != "" && document.getElementById("register-email").value != "" && passwdInput != "" && document.getElementById("register-repeatpassword").value != "") {
    if(passwdInput == document.getElementById("register-repeatpassword").value) {
      if(passwdInput.length > 9) {
        if(containsUpperCase(passwdInput) == true) {
          if(containsLowerCase(passwdInput) == true) {
            if(/\d/.test(passwdInput)) {
              document.getElementById("register-loader").style.width = "30%";
              sendApiRequest("auth/register", "POST", {"email": document.getElementById("register-email").value, "passwordTest": getPasswordTest(document.getElementById("register-password").value), "username": document.getElementById("register-username").value}, function(r) {
                errorObj.innerHTML = "";
                document.getElementById("login-error").innerHTML = "";
                document.getElementById("login-username").value = document.getElementById("register-username").value;
                document.getElementById("login-password").value = document.getElementById("register-password").value;
                document.getElementById("register-loader").style.width = "100%";
                setTimeout(function() {
                  document.getElementById("register-loader").style.opacity = "0";
                }, 500);
                setTimeout(function() {
                  document.getElementById("register-loader").style.width = "0";
                  openLogin();
                }, 700);
                setTimeout(function() {
                  document.getElementById("register-loader").style.opacity = "1";
                }, 1200);
              }, function(r) {
                errorObj.innerHTML = r.message;
                setTimeout(function() {
                  document.getElementById("register-loader").style.width = "0";
                }, 300);
              });
          }else {
            errorObj.innerHTML = "Your password must contain at least 1 number";
          }
        }else {
          errorObj.innerHTML = "Your password must contain at least 1 lowercase character";
        }

        }else {
          errorObj.innerHTML = "Your password must contain at least 1 uppercase character";
        }
      }else {
        errorObj.innerHTML = "Your password must be at least 10 characters long";
      }

    }else {
      errorObj.innerHTML = "Your entered passwords don't match";
    }
  }else {
    document.getElementById("register-error").innerHTML = "Please fill in all fields";
  }

}

var cookies = false;

function acceptCookies() {
  cookies = true;
  login();
}

function declineCookies() {
  cookies = false;
  login();
}
