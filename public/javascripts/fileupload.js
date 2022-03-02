const form = document.querySelector("#file-form"),
    fileInput = document.querySelector(".file-input"),
    progressArea = document.querySelector(".progress-area"),
    uploadedArea = document.querySelector(".uploaded-area");

// form click event
form.addEventListener("click", () => {
    fileInput.click();
});

fileInput.onchange = ({ target }) => {
    let file = target.files[0];
    if (file) {
        let fileName = file.name;
        if (fileName.length >= 12) {
            let splitName = fileName.split('.');
            fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
        }
        uploadFile(fileName);
    }
}

// file upload function
function uploadFile(name) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload-file");
    xhr.upload.addEventListener("progress", ({ loaded, total }) => {
        let fileLoaded = Math.floor((loaded / total) * 100);
        let fileTotal = Math.floor(total / 1000);
        let fileSize;

        (fileTotal < 1024) ? fileSize = fileTotal + " KB": fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MB";
        console.log(fileLoaded);
        let progressHTML = `<li class="row-p">
        <i class="fas fa-file-alt mr-3"></i>
        <div class="content">
          <div class="details">
            <span class="name">${name} • Uploading</span>
            <span class="percent">${fileLoaded}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress" style="width: ${fileLoaded}%"></div>
          </div>
        </div>
      </li>`;

        uploadedArea.classList.add("onprogress");
        progressArea.innerHTML = progressHTML;
        if (loaded == total) {
            progressArea.innerHTML = "";
            let uploadedHTML = `<li class="row-p">
                            <div class="content upload">
                              <i class="fas fa-file-alt mr-3"></i>
                              <div class="details">
                                <span class="name">${name} • Uploaded</span>
                                <span class="size">${fileSize}</span>
                              </div>
                            </div>
                            <i class="fas fa-check"></i>
                          </li>`;
            uploadedArea.classList.remove("onprogress");
            uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);

            loadFiles()
        }
    });
    let data = new FormData(form);
    xhr.send(data);
}


function loadFiles() {

    let id = document.getElementById("files-pId").value;
    let table = document.getElementById("tBody");

    $.ajax({
        type: "POST",
        url: '/get-file',
        data: { pId: id },
        success: function(data) {

            let html = "";
            table.innerHTML = "";
            console.log(data);
            data.forEach(file => {

                html = html + `<tr class="container w-100">
                <td class="p-3">
                  <span class="filename ml-3"><i class="fas fa-file-alt mr-3"></i>${file.workfiles.filename}</span>
                  <span class="filedate ml-4">${file.workfiles.date}</span>
                </td>
                <td><a class="deleteBtn" href="/delete-file-user?id=${file.workfiles.id}"><i class="fas fa-trash-alt"></i></a></td>
              </tr>`

            });

            table.innerHTML = html;

        }
    });
}



function downloadFile(file, e) {

    e.preventDefault()

    pId = document.getElementById('pId').innerHTML

    location.href = `/download-projectfiles?file=${file}&id=${pId}`


}