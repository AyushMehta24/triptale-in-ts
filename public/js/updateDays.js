const searchParams = new URLSearchParams(window.location.search);
let updateDayForm = document.querySelector("#updatedayform");
let submit = document.querySelector("#submit");
let route = document.querySelector("#route").value;
submit.addEventListener("click", async (e) => {
  e.preventDefault();
  if (validation()) {
    let data = new URLSearchParams(new FormData(updateDayForm));
    let responce = await fetch(route, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });
    responce = await responce.json();
    if (!responce.error) {
      await Swal.fire({
        icon: "success",
        title: "Detail of Day Is Updated",
        text: responce.alert,
      });
      if (searchParams.get("tid") != null) {
        location.href = `/displayTrip/${searchParams.get("tid")}`;
      }
    } else {
      sweetAlertError("Something went wrong try again...")
    }
  }
 
});

function validation(){
  let valRequired = document.querySelectorAll(".val-required");
  const title = document.querySelector("#title");
  const description = document.querySelector("#description");
  const location = document.querySelector("#location")
  let isvalidate = true;
  for (let i = 0; i < valRequired.length; i++) {
    if (valRequired[i].value.trim() == "") {
      sweetAlertError("Required All Info...")
      isvalidate = false
      break;
    }
  }
  if (isvalidate && title.value.length > 60 ) {
    isvalidate = false;
    sweetAlertError("Title is Too long...")
  }
  if(isvalidate && description.value.length >400){
    isvalidate = false;
    sweetAlertError("Description is Too long...")
  }
  if (isvalidate && location.value.length >30) {
    isvalidate = false
    sweetAlertError("Location is Too long...")
  }
  return isvalidate;
}

function sweetAlertError(msg){
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: msg,
  });
}