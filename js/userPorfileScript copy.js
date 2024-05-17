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

function closeAlbumForm() {
  document.getElementById("mainProfilePage").style.opacity = "100%";
  addingpostInAlbums.removeChild(addingpostInAlbums.firstElementChild);
  closeForm();
}

function albumCreateValidation(albumName) {
  if (albumName == "") {
    return false;
  }
  if (albumName.length > 20) {
    return false;
  }
  return true;
}

async function craateAlbum(albumName) {
  const albumValidation = albumCreateValidation(albumName);
  if (albumValidation == true) {
    const response = {
      albumName: albumName,
    };
    const data = await fetch("/userProfile/createalubams", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    if (data.status == 200) {
      Swal.fire({
        title: "album create successfully",
        text: "You clicked the button!",
        icon: "success",
      });

      removeAlbumsPost();
      closeForm();
      fetchAlubams();
      fetchDetails();
    }
  } else {
    await Swal.fire({
      icon: "error",
      text: " max name size is 20 character",
    });
    openForm();
  }
}

function fetchAllPosts() {
  fetchPosts();
  fetchAlubams();
  fetchTagePost();
  fetchDetails();
  openPostmenu();
}

async function fetchDetails(req, res) {
  const details = await fetch("/userProfile/fetchDetails");
  const fetchDetail = await details.json();

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
  const tagPostFetch = await fetch("userProfile/fetchTagPosts");
  const tagAllPost = await tagPostFetch.json();
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
        <div  class="rounded-lg relative  p-3 bg-slate-200 border-4 " style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column; margin:15px 0px"> 
        <div>
        <img class="absolute" src= "/assets/images/mul.jpeg"style="height: 20px;
        width: 20px;
        margin-left: 67px;"> 
        </div>`

      if (data.isvideo[0] == 1) {
        appendHtml += `<video style="height: 100%;
width:100%; object-fit:fill;" onclick="postView(${data.user_id},${data.id},'userPost',${data.profileId},'novalue')" >
<source src="/posts/${data.image[0]}" type="video/mp4">
<source src="movie.ogg" type="video/ogg">
Your browser does not support the video tag.
</video>  </div>`
      } else {
        appendHtml += ` <img  class="relative w-full " style="height:100%; width:100%; object-fit: contain;"  onclick="postView(${data.user_id},${data.id},'tagPost',${data.profileId},'novalue')"  src="/posts/${data.image[0]}">
        </div>`
      }

    } else {
      appendHtml += `  <div  class="rounded-lg relative  p-3 bg-slate-200 border-4 my-3" style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black;flex-direction:column;margin:15px 0px "> `
      if (data.isvideo[0] == 0) {
        appendHtml += `   <img style="height:100%; width:100%; object-fit: contain;"  onclick="postView(${data.user_id},${data.id},'tagPost',${data.profileId},'novalue')" class="w-full" src="/posts/${data.image[0]}">
      </div>`} else {
        appendHtml += `  <div>
        <img class="absolute" src= "/assets/images/vidio.png"style="height: 20px;
        width: 20px;
        margin-left: 65px;
        z-index: 2;"> </div>
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

async function fetchPosts() {
  let post = await fetch("userProfile/fetchPosts").then((res) =>
    res.json().then((data) => {
      let multipalePost = data.multiplePost;
      let multiplePostLength = Object.keys(multipalePost).length;

      let allPostDiv = document.querySelector(".postImageas");
      const div = document.createElement("div");
      div.setAttribute("class", " postDiv");
      allPostDiv.appendChild(div);

      let appendHtml = ``;
      for (let i = multiplePostLength - 1; i >= 0; i--) {
        let multiPostKey = Object.keys(multipalePost)[i];
        let data = multipalePost[multiPostKey];

        if (data.image.length > 1) {
          appendHtml += `<div  class="rounded-lg relative  p-3 bg-slate-200 border-4" style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column ;margin:15px 0px" >
        <div class="flex absolute top-[15px] w-[146px] justify-between" style="top:16px">
       
        <img src= "/assets/images/3dots.png"style="height:20px;width: 20px;margin-right: 103;"  onload="openPostmenu()" class="menu cursor-pointer">   
          
          <img src= "/assets/images/mul.jpeg"style="height: 20px;width: 20px;"> 
         
          </div>`;
        } else {
          appendHtml += `<div  class="rounded-lg relative  p-3 bg-slate-200 border-4" style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column ;margin:15px 0px" >
          <div class="flex absolute top-[15px] w-[146px] justify-between" style="top:16px" > `
          if (data.isvideo.length == 1 && data.isvideo[0] == 1) {
            appendHtml += `
            <img src= "/assets/images/3dots.png"style="height:20px;width: 20px;margin-right: 103px;"  onload="openPostmenu()"class="menu cursor-pointer">
            <img src= "/assets/images/vidio.png" style="height: 20px;width: 20px;"> `
          }else{
            appendHtml +=`  <img src= "/assets/images/3dots.png"style="height:20px;width: 20px;margin-right: 123px;"  onload="openPostmenu()"class="menu cursor-pointer">`
          }

          appendHtml += `</div>`;
        }
        appendHtml += `<div class="ml-4 flex items-center hidden relative postMenu " style=" margin-right: 158px; " >
            
            <div class="absolute  z-10 left-0 w-48  rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">        
            <input type="button" onclick="closePostMenu()" value="x" class="absolute text-2xl top-[0px] cursor-pointer  right-[10px]">      
              <input type="button" onclick="deletePost(${data.id})" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-1" value="delete Post"/>
              <a href="/insight/${data.id}" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-2"> insight </a>
              <a href="/posts/update?id=${data.id}" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-3" >edit </a>
            </div></div>`

        if (data.isvideo[0] == 1) {
          appendHtml += ` <video style="height: 100%;
              width:100%; object-fit:fill;" onclick="postView(${data.user_id},${data.id},'userPost',${data.profileId},'novalue')" >
              <source src="/posts/${data.image[0]}" type="video/mp4">
              <source src="movie.ogg" type="video/ogg">
              Your browser does not support the video tag.
            </video> 
          </div>`
        } else {
          appendHtml += `<img style="height: 100%;
            width:100%; object-fit:fill;"  onclick="postView(${data.user_id},${data.id},'userPost',${data.profileId},'novalue')"  src="/posts/${data.image[0]}">
        </div>`
        }
        div.innerHTML = appendHtml;
      }
    })
  );
}
async function fetchAlubams() {
  let data = await fetch("/userProfile/fetchAlubams").then((res) =>
    res.json().then((data) => {
      // let albumsName = data.albums;
      const albumsCoverImage = data.albumsCoverImage;
      const multiplePostLength = Object.keys(albumsCoverImage).length;
      const albumsDiv = document.querySelector(".alubums");
      const div = document.createElement("div");
      div.setAttribute("class", "grid grid-cols-4 gap-4 alubumsPost");
      albumsDiv.appendChild(div);

      let appendHtml = ``;
      for (let i = 0; i < multiplePostLength; i++) {
        let multiPostKey = Object.keys(albumsCoverImage)[i];
        let data = albumsCoverImage[multiPostKey];
        let name = data.albums_name.replace(/\s+/g, "_");
        let coverImageLenght;
        if (data.post_id.length > 4) {
          coverImageLenght = 4;
        } else {
          coverImageLenght = data.post_id.length;
        }
        appendHtml += `<div style="margin:15px 0px" onclick=albumClickc('${name}','${data.id}','${data.user_id}')>
      <div class= "grid grid-cols-2 gap-0 albumsImagecovers">`;

        for (let i = 0; i < coverImageLenght; i++) {
          if (data.isvideo[i] == 0) {
            appendHtml += `<img class="w-full" style="height:90px; width:90px;border: 2px solid;" src="/posts/${data.post_id[i]}"  />`
          }
          else {
            appendHtml += `<video style="height:90px; width:90px;border: 2px solid;"  >
                                <source  src="/posts/${data.post_id[i]}"  type="video/mp4">
                                <source src="movie.ogg" type="video/ogg">
                                Your browser does not support the video tag.
                                </video>`
          }
        }
        let notImage = 4 - coverImageLenght;
        for (let i = 0; i < notImage; i++) {

          appendHtml += `<img class="w-full" style="height:90px; width:90px;border: 2px solid;" src="/assets/images/notImage.jpeg"   />`;
        }
        appendHtml += `</div> <p id="albumcoverName">${data.albums_name}</p> </div>`;
        div.innerHTML = appendHtml;
      }
      div.innerHTML += `<div class="flex-1 text-center px-4 py-2 m-2 " onclick="openForm()"> 
                      <img   class=" createAlubams" src="/assets/images/addAlbums.jpeg" />
                      </div> `;
    })
  );
}

function removeAlbumsPost() {
  const albumDivPost = document.querySelector(".alubumsPost");
  albumDivPost.remove();
}

function removePostDiv() {
  const postDivPost = document.querySelector(".postDiv");
  postDivPost.remove();
}
async function albumClickc(name, id, user_id) {
  document.getElementById("mainProfilePage").style.opacity = "20%";
  const complateName = name.replace("_", " ");
  let oneAlbumsPost = await fetch(
    `/userProfile/oneAlbumPost?album_name=${name.replace(
      "_",
      " "
    )}&&album_id=${id}&&user_id=${user_id}`
  );
  const posts = await oneAlbumsPost.json();
  btnInAlbum.innerHTML = ` <input type="button" name="addPost" class=" btn selectPostInAlbums" onclick="selectPostInAlbums()" value="Add Post">
        <input type="button" name="deletePost" class=" btn deletePostInAlbums" onclick="deletePostInAlbums(${id})" value="delete Post">
        <input type="button" name="deletePost" class=" btn deletePostInAlbums" onclick="deleteAlbum(${id},'${complateName}')" value="delete albums">`;

  const div = document.createElement("div");
  div.setAttribute("class", "grid grid-cols-3 gap-1");
  oneAlbumsPosts.appendChild(div);

  let multiplePostLength = Object.keys(posts).length;

  let appendHtml = ``;

  for (let i = 0; i < multiplePostLength; i++) {
    let multiPostKey = Object.keys(posts)[i];
    let data = posts[multiPostKey];

    if (data.image.length > 1) {
      appendHtml += `
      <div  class="rounded-lg relative  p-3 bg-slate-200 border-4 " style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column; margin:15px 0px"> 
      <div style="margin-bottom: 16px;">
      <img class="absolute" src= "/assets/images/mul.jpeg"style="height: 20px; width: 20px;
      margin-left: 82px;"> 
      </div>`

      if (data.isvideo[0] == 0) {
        appendHtml += `<img  class="relative w-full " style="height:100%; width:100%; object-fit: contain;"  id="${data.id}"  onclick="selectImageInAlbums(this)" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})"  src="/posts/${data.image[0]}">
        </div>`
      } else {
        appendHtml += ` <video id="${data.id}"  style="height: 100%;
        width:100%; object-fit:fill;" onclick="selectImageInAlbums(this)" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})" >
        <source src="/posts/${data.image[0]}" type="video/mp4">
        <source src="movie.ogg" type="video/ogg">
        Your browser does not support the video tag.
      </video> 
    </div>`
      }

    } else {
      appendHtml += `   <div  class="rounded-lg relative  p-3 bg-slate-200 border-4 " style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column; margin:15px 0px">  `

      if (data.isvideo[0] == 0) {
        appendHtml += `<img  class="relative w-full " style="height:100%; width:100%; object-fit: contain;"  id="${data.id}"  onclick="selectImageInAlbums(this)" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})"  src="/posts/${data.image[0]}">
        </div>`
      } else {
        appendHtml += `
        <div style="margin-bottom: 16px;">
      <img class="absolute" src= "/assets/images/vidio.png"style="height: 20px; width: 20px;margin-left: 103px;"> 
      </div>
         <video id="${data.id}"  style="height: 100%;
        width:100%; object-fit:fill;" onclick="selectImageInAlbums(this)" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})" >
        <source src="/posts/${data.image[0]}" type="video/mp4">
        <source src="movie.ogg" type="video/ogg">
        Your browser does not support the video tag.
      </video> 
    </div>`
      }

    }
    div.innerHTML = appendHtml;
  }

  document.getElementById("addPostInAlbums").style.display = "block";
  document.querySelector(".albumName").innerText = complateName;
  document.querySelector(
    ".editAlbums"
  ).innerHTML = ` <p onclick="editAlbumNAme(${id} ,'${complateName}')"
  class="text-slate-800 hover:text-blue-600 text-sm bg-white hover:bg-slate-100 border border-slate-200 rounded-l-lg font-medium px-4 py-2 inline-flex space-x-1 items-center h-5.7">
  <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
          stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
  </span>
  <span class="md:inline-block">Edit</span>
</p>`;

  otherPostShowInAlbums(id, name, user_id);
}

function selectPostInAlbums() {
  unselectItem()
  document.querySelector(".postInAlbums").style.display = "none";
  document.querySelector(".addingpostInAlbums").style.display = "block";
}

async function otherPostShowInAlbums(albumId, albumName, user_id) {
  const albumIds = {
    albumId: albumId,
  };
  const getOtherPost = await fetch("/userProfile/otherPostShowInAlbums", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(albumIds),
  });
  let otherPostsInAlbums = await getOtherPost.json();

  addingpostInAlbums.innerHTML = ` <div class="sticky top-0 z-10 flex gap-4 bg-white">
          <input type="button" name="addPostInAlbums" class=" btn finalAddInAlbums" onclick="addPostInAlbum('${albumName}',${albumId})" value="add">
          <input type="button" name="addPostInAlbums" class=" btn finalAddInAlbums" onclick="backToAlbum('${albumName}',${albumId},${user_id})" value="back"></div>`;

  const div = document.createElement("div");
  div.setAttribute("class", "grid grid-cols-3 gap-1");
  addingpostInAlbums.appendChild(div);

  let multiplePostLength = Object.keys(otherPostsInAlbums).length;

  let appendHtml = ``;

  for (let i = 0; i < multiplePostLength; i++) {
    let multiPostKey = Object.keys(otherPostsInAlbums)[i];
    let data = otherPostsInAlbums[multiPostKey];

    if (data.image.length > 1) {
      appendHtml += `
        <div  class="rounded-lg relative  p-3 bg-slate-200 border-4 " style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column; margin:15px 0px"> 
        <div style="margin-bottom: 16px;">
        <img class="absolute" src= "/assets/images/mul.jpeg"style="height: 20px;width: 20px;margin-left: 84px;"> 
        </div>`
      if (data.isvideo[0] == 0) {
        appendHtml += ` <img  class="relative w-full " style="height:100%; width:100%; object-fit: contain;"  id="${data.id}"  onclick="selectImageInAlbums(this)"  ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})">
          </div>`}
      else {

        appendHtml += `<video  id="${data.id}" style="height: 100%;
            width:100%; object-fit:fill;" onclick="selectImageInAlbums(this)" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})" >
            <source src="/posts/${data.image[0]}" type="video/mp4">
            <source src="movie.ogg" type="video/ogg">
            Your browser does not support the video tag.
          </video></div> `
      }
    } else {
      appendHtml += `    <div  class="rounded-lg relative  p-3 bg-slate-200 border-4 " style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column; margin:15px 0px">  `

      if (data.isvideo[0] == 0) {
        appendHtml += ` <img style="height:100%; width:100%; object-fit: contain;"  id="${data.id}"  onclick="selectImageInAlbums(this)" class="w-full" src="/posts/${data.image[0]}" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})">
      </div>`}
      else {
        appendHtml += `
        <div style="margin-bottom: 16px;">
        <img class="absolute" src= "/assets/images/vidio.png"style="height: 20px;width: 20px;margin-left: 84px;"> 
        </div>

        <video  id="${data.id}" style="height: 100%;
        width:100%; object-fit:fill;" onclick="selectImageInAlbums(this)" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})" >
        <source src="/posts/${data.image[0]}" type="video/mp4">
        <source src="movie.ogg" type="video/ogg">
        Your browser does not support the video tag.
      </video></div> `
      }
    }
    div.innerHTML = appendHtml;
  }
}
function backToAlbum(albumId, albumName, user_id) {
  removeAlbumsPost();
  closeForm();
  fetchAlubams();
  albumClickc(albumId, albumName, user_id);
}
function selectImageInAlbums(e) {
  e.classList.toggle("selected");
}

async function addPostInAlbum(albumName, albumId) {
  const posts = document.querySelectorAll(".selected");
  if (posts.length == 0) {
    sweetalertWrong("pleace select at least one post")
    return;
  }
  let ids = [];
  for (let i = 0; i < posts.length; i++) {
    let id = posts[i].getAttribute("id");
    ids.push(id);
  }

  const postIds = {
    ids: ids,
    albumsId: albumId,
    albumName: albumName,
  };

  const sendId = await fetch("/userProfile/addPostInAlbums", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postIds),
  });
  const userId = await sendId.json();

  if (sendId.status == 200) {
    Swal.fire({
      text: "add post successfully",
      icon: "success",
    });
    removeAlbumsPost();
    closeForm();
    fetchAlubams();
    albumClickc(albumName, albumId, userId);
  }
}

async function deletePostInAlbums(id) {
  const posts = document.querySelectorAll(".selected");

  if (posts.length == 0) {
    sweetalertWrong("pleace select at least one post")
    return;
  }
  let ids = [];

  for (let i = 0; i < posts.length; i++) {
    let id = posts[i].getAttribute("id");
    ids.push(id);
  }
  const postIds = {
    ids: ids,
    albumsId: id,
  };
  let sendId = await fetch("/userProfile/removePostFromAlbums", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postIds),
  });

  if (sendId.status == 200) {
    const data = await sendId.json();
    const userId = data.userId;
    const albumName = data.albums_name[0].albums_name;
    Swal.fire({
      text: "post remove successfully",
      icon: "success",
    });
    removeAlbumsPost();
    closeForm();
    fetchAlubams();
    albumClickc(albumName, id, userId);
  }
}
async function deleteAlbum(albumId, albumName) {
  const alert = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });
  const finalDelete = alert.isConfirmed;
  if (finalDelete == true) {
    const deleteAlbumConforms = await deleteAlbumConform(albumId, albumName);
    if (deleteAlbumConforms == true) {
      Swal.fire({
        title: "Deleted!",
        text: "Your file has been deleted.",
        icon: "success",
      });
    }
  }
}
async function deleteAlbumConform(albumId, albumName) {
  const idName = {
    albumId: albumId,
    albumName: albumName,
  };
  let data = await fetch("/userProfile/deleteAlbum", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(idName),
  });
  if (data.status == 200) {
    removeAlbumsPost();
    closeForm();
    fetchAlubams();
    fetchDetails();
    return true;
  } else {
    return false;
  }
}

async function deletePost(postId) {
  const finalPostPoupap = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });

  if (finalPostPoupap.isConfirmed == true) {
    let postIdDelete = {
      postId: postId,
    };

    let id = await fetch("/posts/delete", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postIdDelete),
    });

    await id.json();

    if (id.status == 200) {
      Swal.fire({
        title: "Deleted!",
        text: "Your file has been deleted.",
        icon: "success",
      });
      removePostDiv();
      fetchDetails();
      fetchPosts();
      removeAlbumsPost();
      fetchAlubams();
    } else {
      sweetalertWrong("Something went wrong!")
    }
  }
}

async function openPostmenu() {
  const threedot = document.querySelectorAll(".menu");
  threedot.forEach((element) => {
    element.addEventListener("click", () => {
      element.parentElement.nextElementSibling.style.display = "block";
    });
  });
}

function closePostMenu() {
  const menu = document.querySelectorAll(".postMenu");
  menu.forEach((element) => {
    element.children[0].addEventListener("click", () => {
      element.style.display = "none";
    });
  });
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

async function editAlbumNAme(albumId, albumName) {
  let oldAlbumName = document.querySelector(".albumName").innerText;
  const { value: newAlbumName } = await Swal.fire({
    title: "update album name",
    input: "text",
    inputLabel: "album name",
    inputPlaceholder: "Enter album name",
    showCancelButton: true,
    inputValue: oldAlbumName,
    preConfirm: (name) => {
      if (!name || name.trim() === "") {
        Swal.showValidationMessage("Please enter album name");
      }
      if (name.length > 20) {
        Swal.showValidationMessage("max name size is 20 character");
      }
    },
  });
  if (newAlbumName) {
    let albumDetails = {
      albumId: albumId,
      albumOldName: oldAlbumName,
      albumNewName: newAlbumName,
    };

    let albumUpdate = await fetch("/userProfile/updateAlbumName", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(albumDetails),
    });
    if (albumUpdate.status == 200) {
      Swal.fire({
        text: "album name update successfully",
        icon: "success",
      });
      document.querySelector(".albumName").innerText = newAlbumName;
      document.getElementById("albumcoverName").innerText = newAlbumName;
    } else {
      sweetalertWrong("album name not update ")
    }
  }
}

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
