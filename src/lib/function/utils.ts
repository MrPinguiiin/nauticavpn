/**
 * Utility functions
 */

/**
 * Reverse a string
 * @param str String to reverse
 * @returns Reversed string
 */
export function reverse(str: string): string {
  return str.split("").reverse().join("");
}

/**
 * Shuffle array elements in place
 * @param array Array to shuffle
 */
export function shuffleArray<T>(array: T[]): void {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
} 