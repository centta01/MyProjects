function validatePassword(f) {
  try {
    if (f.confirmPassword.value === f.passwordOne.value) {
      document.getElementById("passwordChecker").classList.add('d-none');
      return true;
    } else {
      document.getElementById("passwordChecker").classList.remove('d-none');
    }
  } catch (error) {
    console.error("An error occurred during password validation:", error);
  }
  return false;
}