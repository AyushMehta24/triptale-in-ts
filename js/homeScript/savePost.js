let saveIcon = document.querySelectorAll(".save");
let saveFlag;
saveIcon.forEach((ele) => {
  ele.addEventListener("click", async () => {
    const postId = ele.parentElement.firstElementChild.id;
    console.log(ele.parentElement.firstElementChild.id);

    if (ele.src == window.location.origin + "/assets/images/save-icon.png") {
      ele.src = "/assets/images/save-fill-icon.png";
      saveFlag = 1;
    } else {
      ele.src = "/assets/images/save-icon.png";
      saveFlag = 0;
    }
    if (saveFlag == 1) {
      saveAlbumsAlert(postId);
    } else {
      deletePostInAlbumsFromhome(postId);
    }
  });
});

async function addPostInAlbumFromhome(Id, albumId) {
  let postId = [];
  postId.push(Id);
  const postIds = {
    ids: postId,
    albumsId: albumId,
  };
  const sendId = await fetch("/userProfile/addPostInAlbums", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postIds),
  });
  await sendId.json();

  if (sendId.status == 200) {
    Swal.fire({
      text: "add post successfully",
      icon: "success",
    });
  } else {
    Swal.fire({
      icon: "error",
      text: "Something went wrong! Post can not save",
    });
  }
}

async function deletePostInAlbumsFromhome(ids) {
  const postIds = {
    ids: ids,
  };
  const sendId = await fetch("/userProfile/removePostFromAlbumsFromHome", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postIds),
  });

  if (sendId.status == 200) {
    let data = await sendId.json();

    Swal.fire({
      text: "post remove successfully",
      icon: "success",
    });
  }
}

async function openForm(postId) {
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
    craateAlbum(albumName, postId);
  }
}

async function craateAlbum(albumName, postId) {
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
      saveAlbumsAlert(postId);
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

async function saveAlbumsAlert(postId) {
  const albumsName = await fetch("/userProfile/fetchAlubams");
  const albums = await albumsName.json();
  const name = albums.albums;
  let albumNames = [];
  let albumIds = [];
  let options = new Object();
  name.map((name) => {
    albumNames.push(name.albums_name);
    albumIds.push(name.id);
  });

  for (let i = 0; i < albumIds.length; i++) {
    options[albumIds[i]] = albumNames[i];
  }
  const { value: albumId } = await Swal.fire({
    title: "Select albums to save post",
    input: "select",
    inputOptions: {
      ALBUMS: options,
    },
    inputPlaceholder: "Select a albums",
    showCancelButton: true,
    html: `
    <button id="${postId}" class="absolute bottom-[28px] right-32 border border-black px-3 py-2 rounded bg-black text-white" onclick="openForm(this.id)">+</button>`,

    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value === "") {
          resolve("You need to select one albums :)");
        } else {
          resolve();
        }
      });
    },
  });
  let ele =
    document.getElementById(postId).nextElementSibling.nextElementSibling;
  console.log(
    document.getElementById(postId).nextElementSibling.nextElementSibling
  );
  if (albumId !== undefined && albumId !== "create new album") {
    addPostInAlbumFromhome(postId, albumId);
    ele.src = "/assets/images/save-fill-icon.png";
    saveFlag = 1;
  } else {
    console.log("inn");
    ele.src = "/assets/images/save-icon.png";
    saveFlag = 0;
  }
}
