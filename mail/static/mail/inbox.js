

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //Fetch POST
  //Send emails using API
  document.querySelector('#compose-form').onsubmit = function(e){
    e.preventDefault();
    const rec = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    
    //Fetch POST emails
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: rec,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    });
    

  }


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#the-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  

}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#the-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><br>`;
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {

     
      emails.forEach(function(email){
        
        const element = document.createElement('div');
        if (email.read){
          element.style.backgroundColor = "#E5E5E5";
        }
        element.style.border = "1px solid black";
        element.style.position = "relative";
        element.innerHTML = `<span style="margin-right: 10px; color: blue; font-size: 20px">${email.sender}:</span><span>${email.subject}</span><span style = "position: absolute; right: 0; color: grey; font-size: 0.8rem; margin: 7px">${email.timestamp}</span>`;
        element.style.padding = "7px";
        element.addEventListener('click', function() {

        // This checks if there is already content in the div
        if (document.querySelector('#the-email').innerHTML.trim() != ""){
          document.querySelector('#the-email').innerHTML = "";

        }
        fetch('/emails/'+email.id, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        });
        const archiveButton = document.createElement('button');
        const replyBtn = document.createElement('button');
        
        archiveButton.innerHTML = "Archive";
        replyBtn.innerHTML = "Reply";
        const emaildiv = document.createElement('div');
        emaildiv.innerHTML += `<p><b>From: </b>${email.sender}</p>`
        emaildiv.innerHTML +=`<p><b>To: </b>${email.recipients}</p>`
        emaildiv.innerHTML += `<p><b>Subject: </b>${email.subject}</p>`
        emaildiv.innerHTML += `<p><b>Timestamp: </b>${email.timestamp}</p>`
        
        emaildiv.innerHTML += `<hr><p>${email.body}</p>`;
        // Add reply button and add eventlistener
        emaildiv.append(replyBtn);
        replyBtn.onclick = function(){
          //When replyBtn is clicked
          // Clear out composition fields
          compose_email();


          document.querySelector('#compose-recipients').value = email.sender;
          
          if (email.subject.includes("Re: ")){
            document.querySelector('#compose-subject').value = email.subject;
          }
          else{
            document.querySelector('#compose-subject').value = "Re: " + email.subject;

          }
        
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:: ` + email.body;
        }



        
        if (mailbox != "sent"){
          if (mailbox == "archive"){
            archiveButton.innerHTML = "Unarchive"
            emaildiv.append(archiveButton);
            archiveButton.onclick = function(){
             
              fetch('/emails/'+email.id, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
              }).then(()=>{load_mailbox('inbox')});
              
            }
          }
          else{
            emaildiv.append(archiveButton);
            archiveButton.onclick = function(e){
              e.preventDefault();
              fetch('/emails/'+email.id, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              }).then(()=>{load_mailbox('inbox')});
              
            }
          }
          
        }
        

        
        document.querySelector('#the-email').append(emaildiv);
        document.querySelector('#the-email').style.display = 'block';
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        console.log('This element has been clicked!');
      });
      document.querySelector('#emails-view').append(element);
      
    });

    // ... do something else with emails ...
  });
}