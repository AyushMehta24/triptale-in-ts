async function getProfileImage() {
  let profileData = await fetch("/home/getprofileimage");

  profileData = await profileData.json();

  document.getElementById("profileImage").src =
    profileData.profile[0].profile_image;
  let notificationCount = document.getElementById("notification");

  if (localStorage.getItem("display") != null) {
    notificationCount.style.display = localStorage.getItem("display");
    document.getElementById('notification').innerHTML = localStorage.getItem("count")
  }
  if(localStorage.getItem("count")==0){
    localStorage.clear()
  }

  if(localStorage.getItem("count")==null){
    localStorage.setItem("count", 0);
  }
  let socket = io();
  socket.on(
    `notification-like-${profileData.profile[0].user_id}`,
    function (data) {
      let count=Number(localStorage.getItem("count")) + 1 
      localStorage.setItem("display", "");
      document.getElementById("notification").style.display = "";
      document.getElementById('notification').innerHTML = Number(localStorage.getItem("count")) + 1 
      localStorage.setItem("count", count);
    }
  );

  // socket.emit("end");
}

// window.addEventListener("load", () => {
//   setInterval(() => {
//     document.querySelector(".mainLoaderDiv").classList.add("hidden");
//     document
//       .querySelector(".mainLoaderDiv")
//       .nextElementSibling.classList.remove("blur-sm");
//   }, 700);
// });

getProfileImage();
