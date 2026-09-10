export const convertStatus = (status: string) => {
    console.log(status)
  switch (status) {
    case "pending":
      return "Need Verified";

    case "verified":
      return "Paid";

    case "request":
      return "Unpaid";
    default:
      return "Unpaid";
  }
};
