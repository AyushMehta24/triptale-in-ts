window.onload = fetchAllPosts;
const post = document.querySelector(".posts");
const postText = document.querySelector(".postText");
const tagText = document.querySelector(".tagText");
const tags = document.querySelector(".tags");
const editProfile = document.querySelector(".editProfile");
const save = document.querySelector(".save");
const saveText = document.querySelector(".saveText");
const alubums = document.querySelector(".alubums");
const postImageas = document.querySelector(".postImageas");
const createAlubams = document.querySelector(".createAlubams");
const tagePosts = document.querySelector(".tagePosts");
const addingpostInAlbums = document.querySelector(".addingpostInAlbums");
const deleteAlbums = document.querySelector(".deleteAlbums");
const profilePage = document.querySelector(".profilePage");
const loader = document.querySelector(".loader")
const popupPost = document.querySelector("#popupPost");
const container_popup_post = document.querySelector(".container-popup-post");
const oneAlbumsPosts = document.querySelector(".oneAlbumsPosts");
const userName = document.querySelector(".userName");
const postCount = document.querySelector(".postCount");
const tagPostCount = document.querySelector(".tagPostCount");
const albumCounts = document.querySelector(".albumCount");
const first_name = document.querySelector(".first_name");
const userBio = document.querySelector(".userBio");
const userProfile = document.querySelector(".userProfile");
const btnInAlbum = document.querySelector(".btnInAlbum");
const allPostDiv = document.querySelector(".homePageAddPostInALbums");
const addPostsFromHome = document.querySelector(".addPostsFromHome");
const editAlbumBtn = document.querySelector(".editAlbum");
alubums.style.display = "none";
tagePosts.style.display = "none";

editProfile.addEventListener("click", (req, res) => {
  window.location.href = "/getProfile";
});

postText.addEventListener("click", (req, res) => {
  tagText.style.borderBottom = "none";
  saveText.style.borderBottom = "none";
  alubums.style.display = "none";
  postImageas.style.display = "block";
  tagePosts.style.display = "none";
  postText.style.borderBottom = " thick solid #6D28D9 ";
});

saveText.addEventListener("click", (req, res) => {
  tagText.style.borderBottom = "none";
  postText.style.borderBottom = "none";
  postImageas.style.display = "none";
  tagePosts.style.display = "none";
  alubums.style.display = "block";
  saveText.style.borderBottom = " thick solid #6D28D9 ";
});

tagText.addEventListener("click", (req, res) => {
  postText.style.borderBottom = "none";
  saveText.style.borderBottom = "none";
  postImageas.style.display = "none";
  tagePosts.style.display = "block";
  alubums.style.display = "none";
  tagText.style.borderBottom = " thick solid #6D28D9 ";
});

async function openForm() {
  const { value: albumName } = await Swal.fire({
    title: "create album",
    input: "text",
    inputLabel: "album name",
    inputPlaceholder: "Enter album name",
    showCancelButton: true,
    preConfirm: (name) => {
      if (!name || name.trim() === "") {
        Swal.showValidationMessage("Please enter album name");
      }
    },
  });
  if (albumName) {
    craateAlbum(albumName);
  }
}

function closeForm() {
  document.getElementById("mainProfilePage").style.opacity = "100%";
  document.getElementById("myForm").style.display = "none";
  document.getElementById("addPostInAlbums").style.display = "none";
  document.querySelector(".postInAlbums").style.display = "block";
  document.querySelector(".addingpostInAlbums").style.display = "none";
  document.querySelector(".homePageAddPostInALbums").style.display = "none";
  // let div = document.querySelectorAll(".selected");
  popupPost.style.display = "none";
  let editAlbums = document.querySelector(".editAlbums");

  if (editAlbums.length != 0) {
    for (let i = 0; i < editAlbums.length; i++) {
      editAlbums.removeChild(editAlbums.lastElementChild);
    }
  }
  unselectItem()

  // if (div.length != 0) {
  //   for (let i = 0; i < div.length; i++) {
  //     div[i].classList.replace("selected", "notselected");
  //   }
  // }

  if (oneAlbumsPosts.childElementCount != 0) {
    oneAlbumsPosts.removeChild(oneAlbumsPosts.firstElementChild);
  }
  if (addPostsFromHome.childElementCount != 0) {
    addPostsFromHome.removeChild(addPostsFromHome.lastElementChild);
  }
}
function unselectItem() {
  let div = document.querySelectorAll(".selected");

  if (div.length != 0) {
    for (let i = 0; i < div.length; i++) {
      div[i].classList.replace("selected", "notselected");
    }
  }

}
function closePopupForm() {
  document.getElementById("mainProfilePage").style.opacity = "100%";
  container_popup_post.removeChild(container_popup_post.firstElementChild);
  document.body.lastElementChild.remove();
  closeForm();
}

function fetchAllPosts() {
  fetchPosts();
  fetchAlubams();
  fetchTagePost();
  fetchDetails();
  openPostmenu();
}

async function fetchDetails(req, res) {
  startLoader()
  const details = await fetch("/userProfile/fetchDetails");
  const fetchDetail = await details.json();
  closeLoader()
  const postcount = fetchDetail.postCount;
  const tagPostcount = fetchDetail.tagPostCount;
  const albumCount = fetchDetail.albumCount;
  const profileDetails = fetchDetail.profileDetails;

  userName.innerText = profileDetails[0].username;
  postCount.innerText = postcount[0].postcount;
  tagPostCount.innerText = tagPostcount[0].tagcount;
  albumCounts.innerText = albumCount[0].albumcount;
  first_name.innerText =
    profileDetails[0].first_name + " " + profileDetails[0].last_name;
  userBio.innerText = profileDetails[0].user_bio;
  userProfile.innerHTML = `<img style="max-width:max-content; border-radius:50% ;height:110px ;width:110px" id="profile" src="${profileDetails[0].profile_image}" alt=""/>`;
}

async function fetchTagePost() {
  startLoader()
  const tagPostFetch = await fetch("userProfile/fetchTagPosts");
  const tagAllPost = await tagPostFetch.json();
  closeLoader()
  const multipalePost = tagAllPost;


  const multiplePostLength = Object.keys(multipalePost).length;
  const tagPostDiv = document.querySelector(".tagePosts");
  const div = document.createElement("div");
  div.setAttribute("class", "grid grid-cols-3 gap-4");
  tagPostDiv.appendChild(div);
  let appendHtml = ``;

  for (let i = multiplePostLength - 1; i >= 0; i--) {
    let multiPostKey = Object.keys(multipalePost)[i];
    let data = multipalePost[multiPostKey];

    if (data.image.length > 1) {
      appendHtml += `
        <div  class=" relative   bg-slate-200 border-4 " style="height: 212px;display: flex;justify-content: center;align-items: center;border: 3px solid black; flex-direction:column; margin:15px 0px"> 
        <div>
        <img class="absolute" src= "/assets/images/mul.jpeg"style="height: 20px;
        width: 20px;
        margin-left: 102px;z-index:2;top:10px"> 
        </div>`

      if (data.isvideo[0] == 1) {
        appendHtml += `<video style="height: 100%;
width:100%; object-fit:fill;" onclick="postView(${data.user_id},${data.id},'userPost',${data.profileId},'novalue')" >
<source src="/posts/${data.image[0]}" type="video/mp4">
<source src="movie.ogg" type="video/ogg">
Your browser does not support the video tag.
</video>  </div>`
      } else {
        appendHtml += ` <img  class="relative w-full " style="height:100%; width:100%; object-fit: fill;"  onclick="postView(${data.user_id},${data.id},'tagPost',${data.profileId},'novalue')"  src="/posts/${data.image[0]}">
        </div>`
      }

    } else {
      appendHtml += `  <div  class=" relative   bg-slate-200 border-4 my-3" style="height: 212px;display: flex;justify-content: center;align-items: center;border: 3px solid black;flex-direction:column;margin:15px 0px "> `
      if (data.isvideo[0] == 0) {
        appendHtml += `   <img style="height:100%; width:100%; object-fit: fill;"  onclick="postView(${data.user_id},${data.id},'tagPost',${data.profileId},'novalue')" class="w-full" src="/posts/${data.image[0]}">
      </div>`} else {
        appendHtml += `  <div>
        <img class="absolute" src= "/assets/images/vidio.png"style="height: 20px;
        width: 20px;
        margin-left: 102px;
        top:10px;
        z-index: 2;"> 
        </div>
        <video style="height: 100%;
        width:100%; object-fit:fill;" onclick="postView(${data.user_id},${data.id},'userPost',${data.profileId},'novalue')" >
        <source src="/posts/${data.image[0]}" type="video/mp4">
        <source src="movie.ogg" type="video/ogg">
        Your browser does not support the video tag.
      </video> 
      </div>`
      }
    }
    div.innerHTML = appendHtml;
  }
}

userProfile.addEventListener("click", () => {
  const image = document.getElementById("profile").src;
  Swal.fire({
    html: `
    <img id="preview" style="border-radius:50% ;height:350px ;width:350px ; "  src="${image}">`,
    customClass: "swal-wide",
    showConfirmButton: false,
  });
});


function postView(userId, id, post, profileId, postId) {

  if (post == "userPost") {

    window.location.href = `/userProfile/posts?user_id=${userId}&post_id=${id}`
  } else if (post == "albumPost") {

    window.location.href = `/userProfile/posts?user_id=${userId}&albumId=${id}&albumPost='yes'&profileId=${profileId}&post_id=${postId}`
  }
  else {

    window.location.href = `/userProfile/posts?user_id=${userId}&post_id=${id}&tagPost='yes'&profileId=${profileId}`
  }
}


function sweetalertWrong(msg) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: msg,
  });
}

function startLoader() {
  profilePage.style.display = "none";
  loader.style.display = "grid";
}
function closeLoader() {
  profilePage.style.display = "block";
  loader.style.display = "none"
}