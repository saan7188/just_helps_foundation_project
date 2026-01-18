export const validateDonor = (donor) => {
  const errors = {};

  if (!donor.name || donor.name.trim().length < 2) {
    errors.name = "Please enter your full name";
  }

  if (!donor.email || !/^\S+@\S+\.\S+$/.test(donor.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!donor.phone || donor.phone.length < 10) {
    errors.phone = "Please enter a valid phone number";
  }

  return errors;
};

export const validateAmount = (amount, min, max) => {
  if (amount < min) return "Amount is too low";
  if (amount > max) return "Amount exceeds allowed limit";
  return null;
};