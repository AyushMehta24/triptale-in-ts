      let post = document.querySelector(".posts");
      let postText = document.querySelector(".postText");
      let tagText = document.querySelector(".tagText");
      let tags = document.querySelector(".tags");
      let editProfile = document.querySelector(".editProfile");
      let save = document.querySelector(".save");
      let saveText = document.querySelector(".saveText");
      let alubums = document.querySelector(".alubums");
      let postImageas = document.querySelector(".postImageas");
      let createAlubams = document.querySelector(".createAlubams");
      let tagePosts = document.querySelector(".tagePosts");
      let addingpostInAlbums = document.querySelector(".addingpostInAlbums")
      let deleteAlbums = document.querySelector(".deleteAlbums");
      let profilePage = document.querySelector(".profilePage");
      let popupPost = document.querySelector("#popupPost");
      let container_popup_post = document.querySelector(".container-popup-post");
      let oneAlbumsPosts = document.querySelector(".oneAlbumsPosts")
      tagePosts.style.display = "none";



      post.addEventListener("click", (req, res) => {
        tagText.style.borderBottom = "none"
        postImageas.style.display = "grid";
        tagePosts.style.display = "none"
        postText.style.borderBottom = " thick solid #6D28D9 "
      })



      tags.addEventListener("click", (req, res) => {
        postText.style.borderBottom = "none";
        postImageas.style.display = "none";
        tagePosts.style.display = "grid"
        tagText.style.borderBottom = " thick solid #6D28D9 "
      })



      function openForm() {
        document.getElementById("myForm")
      }

      function closeForm() {

        let div = document.querySelectorAll(".selected");
        popupPost.style.display = "none";

        if (div.length != 0) {
          for (let i = 0; i < div.length; i++) {
            div[i].classList.replace("selected", "notselected")
          }
        }

      }

      function closePopupForm() {
        container_popup_post.removeChild(container_popup_post.firstElementChild);
        closeForm();

      }
      
      function showpost(id, id2, istage, profileId) {
        if (istage == "tagPost") {
          window.location.href = `/userProfile/posts?user_id=${id}&post_id=${id2}&tagPost='yes'&profileId=${profileId}`;
        } else {
          window.location.href = `/userProfile/posts?user_id=${id}&post_id=${id2}`;
        }
      }
      

     

      const userProfile = document.querySelector(".userProfile")

      userProfile.addEventListener("click", () => {
        const image = document.getElementById("profile").src;
        Swal.fire({
          html: `
          <img id="preview" style="border-radius:50% ;height:350px ;width:350px ; "  src="${image}">`,
          customClass: 'swal-wide',
          showConfirmButton: false
        });
      })


