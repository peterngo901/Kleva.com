$(function () {
    const form = $('#game-upload-form')

    form.on('submit', (event) => {
        event.preventDefault();

        const title = $('#title').val().toLowerCase()
        const description = $('#description').val().toLowerCase()
        const category = $('#category').val().toLowerCase()
        const file = $('#gameImage')[0].files[0]

        const formData = new FormData

        formData.append("file", file)

        let userData = {
            title: title,
            category: category,
            description: description
        }

        formData.append("data", JSON.stringify(userData))

        $.ajax({
            type: "post",
            url: "/game-upload",
            data: formData,
            contentType: false,
            processData: false
        }).then((result) => {
            console.log(result)
            return false
        })
    })
})