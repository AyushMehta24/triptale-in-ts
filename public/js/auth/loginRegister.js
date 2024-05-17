
if (location.pathname == "/register") {
  const submit_btn = document.querySelector("#submit-btn");
  const registerform = document.querySelector("#registerform");
  const password = document.querySelector("#password");
  const passwordElert = document.querySelector("#passwordElert");
  const email = document.querySelector("#email")
  const conpassword = document.querySelector("#conpassword")
  submit_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (emailValidation(email.value.trim())) {
      return  sweetAlertError("Enter Email in right format"); 
    }
    if (passwordValidate(password.value.trim()) != "") {
     return sweetAlertError(`password ${passwordValidate(password.value.trim())}`);
    }
    if (password.value != conpassword.value) {
      return sweetAlertError("ConfirmPassword Not Matched With Password");
    }
      let data = new URLSearchParams(new FormData(registerform));
      let responce = await fetch("/register", {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });
      responce = await responce.json();
      if (!responce.success) {
        sweetAlertError(responce.alert)
      } else {
        await Swal.fire({
          icon: "success",
          title: "You are Registered",
          text: responce.alert,
          showConfirmButton: false,
          footer: `<a href="${responce.activationLink}" target= "_blank">${responce.activationLink}</a>`,
        });
        location.pathname = "/login";
      }
  });
  password.addEventListener("keyup",(e)=>{
    passwordElert.innerText = passwordValidate(password.value.trim())
  });

  const showPassword1 = document.querySelector("#showPassword");
  showPassword1.addEventListener("click",(e)=>{
  e.preventDefault();
  showPassword(password,e.target)
});
const showConfirmPassword = document.querySelector("#showConfirmPassword");
showConfirmPassword.addEventListener("click",(e)=>{
  e.preventDefault();
 showPassword(conpassword,e.target)
});
}

function passwordValidate(pass){
    if (pass.length <6 || pass.length >12) {
      return "* must between 6 to 12 characters"
    }else if(!pass.match(/(?=.*[a-z])/)){
      return "* At least one lowercase letter"
    }else if(!pass.match(/(?=.*[A-Z])/)){
      return "* At least one uppercase letter"
    }else if(!pass.match(/(?=.*\d)/)){
      return "* At least one digit required"
    }
    return ""
}

if (location.pathname == "/login") {
  const submit_btn = document.querySelector("#submit-btn");
  const loginform = document.querySelector("#loginform");
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  submit_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (emailValidation(email.value.trim())) {
      return sweetAlertError("Enter Email in right format");
    }
    if (password.value.trim().length <=0) {
      return sweetAlertError("Enter Password ");
    }
    let data = new URLSearchParams(new FormData(loginform));
    let responce = await fetch("/login", {
      
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });
    responce = await responce.json();
    if (!responce.success) {
      sweetAlertError(responce.alert)
    } else {
      Swal.fire({
        icon: "success",
        title: "You are Logged In",
        text: responce.alert,
        showConfirmButton: false,
      });
      location.pathname = "/profile";
    }
  });
  const showPasswordLogin = document.querySelector("#showPassword");
showPasswordLogin.addEventListener("click",(e)=>{
  e.preventDefault();
  showPassword(password,e.target)
});
}

if (location.pathname == "/forgotpassword") {
  const submit_btn = document.querySelector("#submit-btn");
  const forgotform = document.querySelector("#forgotform");
  const email = document.querySelector("#email")
  submit_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (emailValidation(email.value.trim())) {
      return sweetAlertError("Enter Email in right format");
    }
    let data = new URLSearchParams(new FormData(forgotform));
    let responce = await fetch("/forgotpassword", {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });
    responce = await responce.json();
    if (!responce.success) {
      sweetAlertError(responce.alert)
    } else {
      await Swal.fire({
        icon: "success",
        title: "Check Your Gmail",
        text: responce.alert,
        showConfirmButton: false,
        footer: `<a href="${responce.forgotPassLink}" target= "_blank">${responce.forgotPassLink}</a>`,
      });
      location.pathname = "/login";
    }
  });
}

if (location.pathname == "/changepassword") {
  const submit_btn = document.querySelector("#submit-btn");
  const forgotform = document.querySelector("#forgotform");
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const conpassword = document.querySelector("#conpassword")
  const passwordElert = document.querySelector("#passwordElert");
  const searchParams = new URLSearchParams(window.location.search);
  email.value = searchParams.get("email");
  password.addEventListener("keyup",(e)=>{
    passwordElert.innerText = passwordValidate(password.value.trim())
  });
  submit_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (passwordValidate(password.value.trim()) != "") {
      sweetAlertError(`password ${passwordValidate(password.value.trim())}`)
    }
      let data = new URLSearchParams(new FormData(forgotform));
      let responce = await fetch("/changepassword", {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      });
      responce = await responce.json();
      if (!responce.success) {
        sweetAlertError(responce.alert)
        if (responce.redirect) {
          location.pathname = "/sessionexpired";
        }
      } else {
        await Swal.fire({
          icon: "success",
          title: "You Password Changed",
          text: responce.alert,
        });
        location.pathname = "/sessionexpired";
      }
  });
  const showPasswordLogin = document.querySelector("#showPassword");
  showPasswordLogin.addEventListener("click",(e)=>{
    e.preventDefault();
    showPassword(password,e.target)
  });
  const showConfirmPassword = document.querySelector("#showConfirmPassword");
  showConfirmPassword.addEventListener("click",(e)=>{
    e.preventDefault();
  showPassword(conpassword,e.target)
  });
}

function emailValidation (email){
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(email)) {
    return true
  }
}

function showPassword(password,img) {
  if (password.getAttribute("type") == "password") {
    img.setAttribute("src","/assets/loginlayout/eye-solid.svg");
    password.setAttribute("type","text")
  }else{
    img.setAttribute("src","/assets/loginlayout/eye-slash-solid.svg");
    password.setAttribute("type","password")
  }
}
  
function sweetAlertError(msg){
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: msg,
  });
}