function validateDate(f) {
  //Make sure that date provided is in the future
  const date_input = f.datePicker.value
  const time_input = f.timePicker.value
  const date_time_str = date_input + "T" + time_input
  const herd_name = f.herd_name.value


  if(herd_name === ""){
    alert("Cannot create an event with an empty herd!")
    return false
  }

  let test_date = new Date(date_time_str)
  let current_date = new Date()

  if (current_date > test_date) {
    alert("Attempt to create event in the past!\nMust provide a date/time in the future!")
    return false
  }

  return true
}