function showresult(val){
    res = document.getElementById("result2");
    res.innerHTML = '';
  
  
    if (val == '') {
        return;
    }
    let list = '';
    fetch("/trips/getlocation", {
      method: "post",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ locationLike: val.trim() }),
  }).then(
  function (response) {
      return response.json();
  }).then(function (data) {
      for (i = 0; i < data.length; i++) {
          list += '<li onclick="samevalue(this.innerHTML)">' + data[i] + '</li>';
      }
      res.innerHTML = '<ul>' + list + '</ul>';
  
  
  
  
  }).catch(function (err) {
      console.warn('Something went wrong.', err);
      return false;
  }); 
  }
  
  function samevalue(val){
    document.getElementById("result2").innerHTML = "";
    document.getElementById("location").value = val;
  
  }