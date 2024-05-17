
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

function albumCreateValidation(albumName) {
    if (albumName == "") {
        return false;
    }
    if (albumName.length > 20) {
        return false;
    }
    return true;
}

function closeAlbumForm() {
    document.getElementById("mainProfilePage").style.opacity = "100%";
    addingpostInAlbums.removeChild(addingpostInAlbums.firstElementChild);
    closeForm();
}


async function fetchAlubams() {
startLoader()
    let data = await fetch("/userProfile/fetchAlubams").then((res) =>
        res.json().then((data) => {
            // let albumsName = data.albums;
            closeLoader()
            const albumsCoverImage = data.albumsCoverImage;
            const multiplePostLength = Object.keys(albumsCoverImage).length;
            const albumsDiv = document.querySelector(".alubums");
            const div = document.createElement("div");
            div.setAttribute("class", "grid grid-cols-4 gap-16   ` alubumsPost");
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

async function albumClickc(name, id, user_id) {
    document.getElementById("mainProfilePage").style.opacity = "20%";
    const complateName = name.replace("_", " ");
    startLoader()
    let oneAlbumsPost = await fetch(
        `/userProfile/oneAlbumPost?album_name=${name.replace(
            "_",
            " "
        )}&&album_id=${id}&&user_id=${user_id}`
    );
    const posts = await oneAlbumsPost.json();
    closeLoader()
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
        <div  class=" relative   bg-slate-200 border-4 " style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column; margin:15px 0px"> 
        <div>
        <img class="absolute" src= "/assets/images/mul.jpeg"style="height: 20px; width: 20px;
        margin-left: 82px;z-index:2;top:10px;"> 
        </div>`

            if (data.isvideo[0] == 0) {
                appendHtml += `<img  class="relative w-full " style="height:100%; width:100%; object-fit: fill;"  id="${data.id}"  onclick="selectImageInAlbums(this)" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})"  src="/posts/${data.image[0]}">
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
            appendHtml += `   <div  class="relative   bg-slate-200 border-4 " style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column; margin:15px 0px">  `

            if (data.isvideo[0] == 0) {
                appendHtml += `<img  class="relative w-full " style="height:100%; width:100%; object-fit: fill;"  id="${data.id}"  onclick="selectImageInAlbums(this)" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})"  src="/posts/${data.image[0]}">
          </div>`
            } else {
                appendHtml += `
          <div >
        <img class="absolute" src= "/assets/images/vidio.png"style="height: 20px; width: 20px;margin-left: 83px;top:10px;z-index:2;"> 
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


async function otherPostShowInAlbums(albumId, albumName, user_id) {
    const albumIds = {
        albumId: albumId,
    };
    startLoader()
    const getOtherPost = await fetch("/userProfile/otherPostShowInAlbums", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(albumIds),
    });
    let otherPostsInAlbums = await getOtherPost.json();
    closeLoader()

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
          <div  class=" relative   bg-slate-200 border-4 " style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column; margin:15px 0px"> 
          <div>
          <img class="absolute" src= "/assets/images/mul.jpeg"style="height: 20px;width: 20px;margin-left: 84px;top:10px;z-index:2"> 
          </div>`
            if (data.isvideo[0] == 0) {
                appendHtml += ` <img  class="relative w-full " style="height:100%; width:100%; object-fit: fill;"  id="${data.id}"  onclick="selectImageInAlbums(this)"  ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})">
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
            appendHtml += `    <div  class="relative   bg-slate-200 border-4 " style="height: 168px;display: flex;justify-content: center;align-items: center;border: 1px solid black; flex-direction:column; margin:15px 0px">  `

            if (data.isvideo[0] == 0) {
                appendHtml += ` <img style="height:100%; width:100%; object-fit: fill;"  id="${data.id}"  onclick="selectImageInAlbums(this)" class="w-full" src="/posts/${data.image[0]}" ondblclick="postView(${data.user_id},${data.albumId},'albumPost',${data.profileId},${data.id})">
        </div>`}
            else {
                appendHtml += `
          <div >
          <img class="absolute" src= "/assets/images/vidio.png"style="height: 20px;width: 20px;margin-left: 84px;top:10px;z-index:2;"> 
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

function selectPostInAlbums() {
    unselectItem()
    document.querySelector(".postInAlbums").style.display = "none";
    document.querySelector(".addingpostInAlbums").style.display = "block";
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
startLoader()
    const sendId = await fetch("/userProfile/addPostInAlbums", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postIds),
    });
    const userId = await sendId.json();
    closeLoader()

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

    startLoader()
    let sendId = await fetch("/userProfile/removePostFromAlbums", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postIds),
    });
    closeLoader()
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
    startLoader()
    let data = await fetch("/userProfile/deleteAlbum", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(idName),
    });
    closeLoader()
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

function removeAlbumsPost() {
    const albumDivPost = document.querySelector(".alubumsPost");
    albumDivPost.remove();
}


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
startLoader()
        let albumUpdate = await fetch("/userProfile/updateAlbumName", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(albumDetails),
        });
        closeLoader()
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

