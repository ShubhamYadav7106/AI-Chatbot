export const checkHeading = (str) => {
    return /\*\*(.*?)\*/.test(str); // Match substring with ** at start and * at end
};

export const replaceStar = (str) => {
    return str.replace(/\*/g, ''); // Remove all occurrences of *
};