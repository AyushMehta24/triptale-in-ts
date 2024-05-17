

function validate() {
  var validate = ["date", "title", "description", "location"];
  var display = ["Date", "Title", "Description", "Location"];
  for (var i = 0; i < validate.length; i++) {
    str = document.getElementById(validate[i]);
    if (str.value.trim() == "" || str.value.trim() == null) {
      document.getElementsByClassName("validate_of")[i].innerHTML =
        display[i] + " cannot be blank";
      return false;
    } else {
      document.getElementsByClassName("validate_of")[i].innerHTML = "";
    }
  }

  const sDate = document.getElementById("startDate").value;
  const eDate = document.getElementById("endDate").value;
  const sd = new Date(sDate).toLocaleDateString();
  const ed = new Date(eDate).toLocaleDateString();
  const startDate = new Date(sDate);
  const endDate = new Date(eDate);
  const eddate = endDate.setDate(endDate.getDate() + 1);

  const indate = document.getElementById("date").value;
  const indate1 = new Date(indate);
  const indate2 = indate1.toLocaleDateString();

  let repeatdate = document.getElementsByClassName("repeatdate");

  for (let i = 0; i < repeatdate.length; i++) {
    const incomingDate = repeatdate[i].value;

    const incomingDate1 = new Date(incomingDate);
    const fmonth = incomingDate1.getMonth() + 1;

    const indate3 = indate1.getMonth() + 1;

    const fianlDate =
      new Date(incomingDate).getDate() +
      "/" +
      fmonth +
      "/" +
      new Date(incomingDate).getFullYear();
    const indate4 =
      new Date(indate1).getDate() +
      "/" +
      indate3 +
      "/" +
      new Date(indate1).getFullYear();

    if (fianlDate == indate4) {
      document.getElementById(
        "dateerror"
      ).innerHTML = ` Entered Date is already added in Day by Day `;
      return false;
    } else {
      document.getElementById("dateerror").innerHTML = "";
    }
  }

  if (indate1 < startDate || indate1 > eddate) {
    document.getElementById(
      "dateerror"
    ).innerHTML = `Enter Date between ${sd} and ${ed}`;
    return false;
  } else {
    document.getElementById("dateerror").innerHTML = "";
  }

  const fileName = document.getElementById("dropzone-file");
  var selectedFile = document.getElementById("dropzone-file").files[0];
  var allowedTypes = ["image/jpeg", "image/png", "video/mp4", "video/webm"];

  if (!allowedTypes.includes(selectedFile.type)) {
    document.getElementById("fileerror").innerHTML =
      "Upload Photo or Video in Proper format";
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Upload Photo or Video in Proper format",
    });
    return false;
  } else {
    document.getElementById("fileerror").innerHTML = "";
  }

  const filesize = selectedFile.size;
  const file = Math.round(filesize / 1024);
  // The size of the file.
  if (file >= 51200) {
    document.getElementById("fileerror").innerHTML =
      "Upload Photo or Video less than 50 MB";
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Upload Photo or Video less than 50 MB",
    });
    return false;
  } else {
    document.getElementById("fileerror").innerHTML = "";
  }

  if (fileName.files.length > 20) {
    document.getElementById("fileerror").innerHTML =
      "You can add Maximun 20 Photos in one time";
    return false;
  }
}

const disableDate=document.querySelector('#date');

// console.log('disabledate',disableDate);
const sDate = document.getElementById("startDate").value;
const eDate = document.getElementById("endDate").value;

const startDate = new Date(sDate);
const endDate = new Date(eDate);
const startFirstDate=startDate.getDate();
const endFirstDate=endDate.getDate();
const Startmonth = startDate.getMonth() + 1;
const endMonth = endDate.getMonth()+ 1;


let newStartdate;
let newEndDate;
if(startFirstDate<=9){
  newStartdate="0"+startFirstDate;
}
else{
  newStartdate=startFirstDate;
}
if(endFirstDate<=9){
  newEndDate="0"+endFirstDate;
}
else{
  newEndDate=endFirstDate;
}

console.log(endMonth);

    let newStartMonth;
    if(Startmonth<=9){
      newStartMonth="0"+Startmonth;
    }
    else{
      newStartMonth=Startmonth;
    }

    let newEndMonth;

    if(endMonth<9){
      newEndMonth="0"+endMonth;
    }
    else{
      newEndMonth=endMonth;
    }

    // console.log('newmonth',newmonth);
    const startDateFinal =
    new Date(startDate).getFullYear()  +
      "-" +
      newStartMonth +
      "-" +
      newStartdate;


    const endDateFinal =
      new Date(endDate).getFullYear() +
      "-" +
      newEndMonth +
      "-" +
      newEndDate;

console.log(startDateFinal,endDateFinal);
disableDate.setAttribute("min",startDateFinal);
disableDate.setAttribute("max",endDateFinal);

let output = document.querySelector("output");
let postImages = document.querySelector(".images");
let imagesArray = [];
postImages.addEventListener("change", () => {
  imagesArray = [];
  const files = postImages.files;
  for (let i = 0; i < files.length; i++) {
    imagesArray.push(files[i]);
  }
  displayImages();
});

function displayImages() {
  let imageType = ["jpeg", "jpg", "png"];
  let videoType = ["mp4", "webm"];

  let images = "<div  class='flex flex-wrap'>";
  imagesArray.forEach((image, index) => {
    if (imageType.includes(image.name.split(".").pop())) {
      images += `<div class="image mx-2" style="margin: 0 auto;"><span onclick="deleteImage(${index})" class="cursor-pointer text-3xl">&times;</span>
         <img src="${URL.createObjectURL(
        image
      )}" class="bg-cover w-[12rem] h-[12rem]" alt="image">
        
      </div>`;
    }
    if (videoType.includes(image.name.split(".").pop())) {
      images += `<div class="image mx-2" style="margin: 0 auto;"><span onclick="deleteImage(${index})" class="cursor-pointer text-3xl">&times;</span>
        <video controls class="bg-cover w-[12rem] h-[12rem]">
          <source src="${URL.createObjectURL(image)}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      </div> `;
    }
  });
  images += "</div>";
  output.innerHTML = images;
}

function deleteImage(index) {
  imagesArray.splice(index, 1);
  postImages.value = "";

  const dataTransfer = new DataTransfer();
  imagesArray.forEach((item) => {
    dataTransfer.items.add(item);
  });
  postImages.files = dataTransfer.files;
  displayImages();
}
