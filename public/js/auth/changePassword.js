
  const submit_btn = document.querySelector("#submit-btn");
  const forgotform = document.querySelector("#forgotform");
  const password = document.querySelector("#password");
  const passwordElert = document.querySelector("#passwordElert");
  const requiredInputs = document.querySelectorAll(".required")
  const confirmPassword = document.getElementsByName("conform_password");
  const currentPassword = document.querySelector("#CurrentPassword")
  password.addEventListener("keyup",(e)=>{
    passwordElert.innerText = passwordValidate(password.value.trim(),false)
  });

  submit_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (passwordValidate(password.value.trim()) != "") {
      sweetAlertError(`password ${passwordValidate(password.value.trim())}`)
    }else{
    let data = new URLSearchParams(new FormData(forgotform));
    let responce = await fetch("/resetpassword", {
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
        title: "You Password Changed",
        text: responce.alert,
      });
      location.pathname = "/userProfile";
    }
  }
  });

  function passwordValidate(pass,flag=true){
    let isvalidate = true;
    if (isvalidate && flag) {
      requiredInputs.forEach(item=>{
      if (item.value.trim().length<=0) {
        isvalidate = false
        return "Enter All Detail"
      }
    })
    }
    if (isvalidate) {
      if (pass.length <6 || pass.length >12) {
      return "* must between 6 to 12 characters"
    }else if(!pass.match(/(?=.*[a-z])/)){
      return "* At least one lowercase letter"
    }else if(!pass.match(/(?=.*[A-Z])/)){
      return "* At least one uppercase letter"
    }else if(!pass.match(/(?=.*\d)/)){
      return "* At least one digit required"
    }
    }

    if (isvalidate && flag) {
      if (pass != confirmPassword[0].value) {
        isvalidate = false
        return "Confirm Password not matched"
      }
    }
    return ""
}


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
const showCurrentPassword = document.querySelector("#showCurrentPassword");
showCurrentPassword.addEventListener("click",(e)=>{
  e.preventDefault();
 showPassword(currentPassword,e.target)
});

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
