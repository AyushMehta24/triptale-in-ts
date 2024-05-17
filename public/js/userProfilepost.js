
async function fetchPosts() {
    startLoader()
    let post = await fetch("userProfile/fetchPosts").then((res) =>
        res.json().then((data) => {
            closeLoader()
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
                    appendHtml += `<div  class=" relative   bg-slate-200 border-4" style="height: 212px;display: flex;justify-content: center;align-items: center;border: 3px solid black; flex-direction:column ;margin:15px 0px" >
          <div class="flex absolute top-[15px] w-[146px] justify-between" style="top:16px">
         
          <img src= "/assets/images/3dots.png"style="height:20px;width: 20px;margin-right: 176;"  onload="openPostmenu()" class="menu cursor-pointer">   
            
            <img src= "/assets/images/mul.jpeg"style="height: 20px;width: 20px;"> 
           
            </div>`;
                } else {
                    appendHtml += `<div  class=" relative   bg-slate-200 border-4" style="height: 212px;display: flex;justify-content: center;align-items: center;border: 3px solid black; flex-direction:column ;margin:15px 0px" >
            <div class="flex absolute top-[15px] w-[146px] justify-between" style="top:16px" > `
                    if (data.isvideo.length == 1 && data.isvideo[0] == 1) {
                        appendHtml += `
              <img src= "/assets/images/3dots.png"style="height:20px;width: 20px;margin-right: 176px;"  onload="openPostmenu()"class="menu cursor-pointer">
              <img src= "/assets/images/vidio.png" style="height: 20px;width: 20px;"> `
                    } else {
                        appendHtml += `  <img src= "/assets/images/3dots.png"style="height:20px;width: 20px;margin-right: 196px;"  onload="openPostmenu()"class="menu cursor-pointer">`
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
        startLoader()
        let id = await fetch("/posts/delete", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postIdDelete),
        });

        await id.json();
        closeLoader()

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

function removePostDiv() {
    const postDivPost = document.querySelector(".postDiv");
    postDivPost.remove();
}