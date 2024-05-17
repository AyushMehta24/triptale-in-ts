function samevalue(val) {
    document.getElementById("search").value = val.replace("<strong>","").replace("</strong>","");

    document.getElementById("result").innerHTML = "";
}
function post(id, id2) {
    window.location.href = `/search/posts?user_id=${id}&post_id=${id2}`;
}

const peopleTag = document.getElementById("search");

function showResults(val) {
    res = document.getElementById("result");
    res.innerHTML = '';


    if (val == '') {
        return;
    }
    let list = '';
    let currentfocus = -1;
    fetch("/search/gethashtag", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ hashtagLike: peopleTag.value.trim() }),
    }).then(
        function (response) {
            return response.json();
        }).then(function (data) {
            for (i = 0; i < data.length; i++) {
                list += '<li onclick="samevalue(this.innerHTML)">'+`<strong>${peopleTag.value}</strong>`+data[i].substr(peopleTag.value.length,data[i].length) + '</li>';
            }
            res.innerHTML = '<ul>' + list + '</ul>';
        }).catch(function (err) {
            console.warn('Something went wrong.', err);
            return false;
        });

    fetch("/search/getlocation", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationLike: peopleTag.value.trim() }),
    }).then(
        function (response) {
            return response.json();
        }).then(function (data) {
            for (i = 0; i < data.length; i++) {
                list += '<li onclick="samevalue(this.innerHTML)">'+`<strong>${peopleTag.value}</strong>`+data[i].substr(peopleTag.value.length,data[i].length) + '</li>';
            }
            res.innerHTML = '<ul>' + list + '</ul>';
        }).catch(function (err) {
            console.warn('Something went wrong.', err);
            return false;
        });

    fetch("/search/getusernames", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userLike: peopleTag.value.trim() }),
    }).then(
        function (response) {
            return response.json();
        }).then(function (data) {
            for (i = 0; i < data.length; i++) {
                list += '<li onclick="samevalue(this.innerHTML)">'+`<strong>${peopleTag.value}</strong>`+data[i].substr(peopleTag.value.length,data[i].length) + '</li>';
            }
            res.innerHTML = '<ul>' + list + '</ul>';
        }).catch(function (err) {
            console.warn('Something went wrong.', err);
            return false;
        });


    this.addEventListener("keydown", function (e) {

        var x = document.getElementById("result");


        if (x) x = x.getElementsByTagName("li");


        if (e.keyCode == 40) {
            currentfocus++;
            addactive(x);
        }
        else if (e.keyCode == 38) {
            currentfocus--;
            addactive(x);
        }
        else if (e.keyCode == 13) {

            if (currentfocus >= 0) {
                if (x[currentfocus]) x[currentfocus].click();
            }
        }
    })

    function addactive(x) {

        if (!x) return false;

        removeactive(x);

        if (currentfocus > x.length - 1) currentfocus = 0;

        if (currentfocus <= -1) currentfocus = (x.length - 1);

        x[currentfocus].classList.add("result-active");
    }

    function removeactive(x) {

        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("result-active");
        }
    }

}
