function isValidEmail(address) {

  //regex generated from chatGPT 3.5 [https://chat.openai.com/share/f9379c89-8035-4318-a62b-d502eae0302b]
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!address.match(emailRegex)) {
    alert("Cannot add invalid email address to invite list!")
    return false;
  }

  return true;
}

let email_inv_list = []
function addToEmailList() {

  let email_input_element = document.getElementById("email_text_input")
  let email_value = email_input_element.value

  if (!isValidEmail(email_value)) {
    return;
  }

  //If previously empty, add description of column
  if (email_inv_list.length == 0) {
    let email_list_div = document.getElementById("invitees_div")
    email_list_div.innerHTML = "<h5 class=\"text-decoration-underline\">Herd Invite List</h5><div><ul class=\" list-group list-group-flush\" id=\"visible_email_list\"></ul></div>"
  }

  let email_display = document.getElementById("visible_email_list")
  let email_hidden_element = document.getElementById("email_invite_list")

  email_inv_list.push(email_value)
  // Create a list item element
  let listItem = document.createElement('li')
  listItem.textContent = email_value
  listItem.classList.add("list-group-item")
  // Append the list item to the list
  email_display.appendChild(listItem)

  email_input_element.value = ""
  email_hidden_element.value = email_inv_list.join()
}