export const convertStatus = (status: string) => {
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
