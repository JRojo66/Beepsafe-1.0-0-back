Swal.fire({
    title:"Enter your name",
    input:"text",
    text:"Enter your nickname",
    inputValidator: (value)=>{
        return !value && "A name is required...!!!"
    },
    allowOutsideClick:false
}).then(data => {
    let chatName = data.value;
    document.title = chatName;                  // Sets sleeve name to chatName

    let inputMessage = document.getElementById("message");
    let divMessages = document.getElementById("messages");
    inputMessage.focus();

    const socket = io();

    socket.emit("id", chatName);
    socket.on("New User", chatName=>{
        Swal.fire({
            text:`${chatName} has conected...!!!`,
            toast:true,
            position:"top-right"
        })
    })
    socket.on("previousMessages", messages=>{
        messages.forEach(m => {
            divMessages.innerHTML+=`<span class="message"><p><strong>${m.chatName}</strong> says <i>${m.message}</i></p></span>`
            divMessages.scrollTop = divMessages.scrollHeight;
        });
    })
    socket.on("userLogout",chatName=>{
        divMessages.innerHTML+=`<span class="message"><strong>${chatName}</strong> has left this chat ... :( </span>`
        divMessages.scrollTop = divMessages.scrollHeight;
    })
    inputMessage.addEventListener("keyup", e=>{
        e.preventDefault();
        if (e.code ==="Enter" && e.target.value.trim().length>0){
            socket.emit("message", chatName, e.target.value.trim())
            e.target.value = ""; 
            e.target.focus();
        }
    })
    socket.on("newMessage", (chatName, message)=>{
        divMessages.innerHTML+=`<span class="message"><p><strong>${chatName}</strong> says <i>${message}</i></p></span>`
        divMessages.scrollTop = divMessages.scrollHeight;
    })
})


