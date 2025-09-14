const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codequest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  addProblems();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Function to add additional problems
async function addProblems() {
  try {
    // Find admin user for the author field
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('Admin user not found. Please run the main seeder first.');
      mongoose.connection.close();
      process.exit(1);
    }
    
    // Create array of new problems
    const newProblems = [
      // Easy problems
      {
        title: 'Palindrome Checker',
        description: 'Write a function that checks if a given string is a palindrome. A palindrome is a word, phrase, number, or other sequence of characters that reads the same forward and backward (ignoring spaces, punctuation, and capitalization).',
        difficulty: 'Easy',
        constraints: '- The input string will only contain ASCII characters.\n- The function should ignore case, spaces, and punctuation.\n- The function should return a boolean value.',
        inputFormat: 'A string to check.',
        outputFormat: 'A boolean value - true if the string is a palindrome, false otherwise.',
        sampleInput: '"A man, a plan, a canal: Panama"',
        sampleOutput: 'true',
        explanation: 'When ignoring case, spaces, and punctuation, "amanaplanacanalpanama" reads the same backward as forward, thus it\'s a palindrome.',
        hints: [
          'Consider using regular expressions to remove non-alphanumeric characters.',
          'Convert the string to lowercase to ignore case.',
          'Compare the cleaned string with its reverse.'
        ],
        testCases: [
          {
            input: 'A man, a plan, a canal: Panama',
            expected: true,
            explanation: 'Classic palindrome example, ignoring case, spaces, and punctuation.'
          },
          {
            input: 'race a car',
            expected: false,
            explanation: 'Not a palindrome even after ignoring spaces.'
          },
          {
            input: 'Was it a car or a cat I saw?',
            expected: true,
            explanation: 'Another palindrome example with punctuation and spaces.'
          },
          {
            input: '12321',
            expected: true,
            explanation: 'Numeric palindrome.',
            isHidden: true
          },
          {
            input: 'Never odd or even',
            expected: true,
            explanation: 'Palindrome with spaces and mixed case.',
            isHidden: true
          }
        ],
        tags: ['String', 'Two Pointers'],
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    // Your code here
    
    // Return true if the string is a palindrome
}

// Do not modify the code below
const output = isPalindrome(input);`,
          python: `def is_palindrome(s):
    # Your code here
    
    # Return True if the string is a palindrome
    
# Do not modify the code below
output = is_palindrome(input)`,
          java: `import java.util.*;

class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
        
        // Return true if the string is a palindrome
        return false;
    }
}

// Do not modify the code below
class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        output = solution.isPalindrome(input);
    }
}`,
          cpp: `#include <string>
#include <cctype>
#include <algorithm>

bool isPalindrome(std::string s) {
    // Your code here
    
    // Return true if the string is a palindrome
    return false;
}

// Do not modify the code below
int main() {
    output = isPalindrome(input);
    return 0;
}`
        },
        solutionCode: {
          javascript: `function isPalindrome(s) {
    // Remove non-alphanumeric characters and convert to lowercase
    const cleaned = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Check if the cleaned string equals its reverse
    return cleaned === cleaned.split('').reverse().join('');
}`,
          python: `def is_palindrome(s):
    # Remove non-alphanumeric characters and convert to lowercase
    import re
    cleaned = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    
    # Check if the cleaned string equals its reverse
    return cleaned == cleaned[::-1]`,
          java: `import java.util.*;

class Solution {
    public boolean isPalindrome(String s) {
        // Remove non-alphanumeric characters and convert to lowercase
        String cleaned = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        
        // Check if the cleaned string equals its reverse
        StringBuilder sb = new StringBuilder(cleaned);
        return cleaned.equals(sb.reverse().toString());
    }
}`,
          cpp: `#include <string>
#include <cctype>
#include <algorithm>

bool isPalindrome(std::string s) {
    std::string cleaned;
    
    // Remove non-alphanumeric characters and convert to lowercase
    for (char c : s) {
        if (std::isalnum(c)) {
            cleaned.push_back(std::tolower(c));
        }
    }
    
    // Check if the cleaned string equals its reverse
    std::string reversed = cleaned;
    std::reverse(reversed.begin(), reversed.end());
    
    return cleaned == reversed;
}`
        },
        author: adminUser._id
      },
      {
        title: 'Merge Sorted Arrays',
        description: 'Given two sorted arrays nums1 and nums2, merge nums2 into nums1 as one sorted array. The number of elements initialized in nums1 and nums2 are m and n respectively. You may assume that nums1 has a size equal to m + n such that it has enough space to hold additional elements from nums2.',
        difficulty: 'Easy',
        constraints: '- nums1.length == m + n\n- nums2.length == n\n- 0 <= m, n <= 200\n- 1 <= m + n <= 200\n- -10^9 <= nums1[i], nums2[j] <= 10^9',
        inputFormat: 'Two arrays (nums1 and nums2) and two integers (m and n) representing the number of elements in each array.',
        outputFormat: 'The modified nums1 array after merging nums2 into it.',
        sampleInput: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3',
        sampleOutput: '[1,2,2,3,5,6]',
        explanation: 'The arrays we are merging are [1,2,3] and [2,5,6]. The result of the merge is [1,2,2,3,5,6].',
        hints: [
          'Try working backwards from the end of nums1.',
          'Use two pointers to keep track of where you are in each array.',
          'Fill nums1 from the end to avoid overwriting elements you still need.'
        ],
        testCases: [
          {
            input: { nums1: [1,2,3,0,0,0], m: 3, nums2: [2,5,6], n: 3 },
            expected: [1,2,2,3,5,6],
            explanation: 'The arrays [1,2,3] and [2,5,6] merge to [1,2,2,3,5,6].'
          },
          {
            input: { nums1: [1], m: 1, nums2: [], n: 0 },
            expected: [1],
            explanation: 'No elements to merge from nums2.'
          },
          {
            input: { nums1: [0], m: 0, nums2: [1], n: 1 },
            expected: [1],
            explanation: 'The result is just nums2 since nums1 is empty.'
          },
          {
            input: { nums1: [4,5,6,0,0,0], m: 3, nums2: [1,2,3], n: 3 },
            expected: [1,2,3,4,5,6],
            explanation: 'Merging the arrays [4,5,6] and [1,2,3].',
            isHidden: true
          }
        ],
        tags: ['Array', 'Two Pointers', 'Sorting'],
        starterCode: {
          javascript: `/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1, m, nums2, n) {
    // Your code here
    
    // Merge nums2 into nums1 as one sorted array
}

// Do not modify the code below
merge(input.nums1, input.m, input.nums2, input.n);
output = input.nums1;`,
          python: `def merge(nums1, m, nums2, n):
    # Your code here
    
    # Merge nums2 into nums1 as one sorted array

# Do not modify the code below
merge(input["nums1"], input["m"], input["nums2"], input["n"])
output = input["nums1"]`
        },
        solutionCode: {
          javascript: `function merge(nums1, m, nums2, n) {
    let i = m - 1;
    let j = n - 1;
    let k = m + n - 1;
    
    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) {
            nums1[k--] = nums1[i--];
        } else {
            nums1[k--] = nums2[j--];
        }
    }
}`,
          python: `def merge(nums1, m, nums2, n):
    i, j, k = m - 1, n - 1, m + n - 1
    
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1`
        },
        author: adminUser._id
      },
      
      // Medium problems
      {
        title: 'Group Anagrams',
        description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
        difficulty: 'Medium',
        constraints: '- 1 <= strs.length <= 10^4\n- 0 <= strs[i].length <= 100\n- strs[i] consists of lowercase English letters.',
        inputFormat: 'An array of strings.',
        outputFormat: 'An array of arrays, where each inner array contains a group of anagrams.',
        sampleInput: '["eat","tea","tan","ate","nat","bat"]',
        sampleOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
        explanation: 'The input contains six strings. The strings "eat", "tea", and "ate" are anagrams of each other, so they are grouped together. Similarly, "tan" and "nat" are grouped. "bat" doesn\'t share anagrams with any other string, so it forms its own group.',
        hints: [
          'Two strings are anagrams if and only if they have the same characters with the same frequencies.',
          'Consider using a hash map to group anagrams, where the key is a representation of the sorted characters.',
          'For each string, sort it alphabetically to get a canonical form that will be the same for all anagrams.'
        ],
        testCases: [
          {
            input: ["eat","tea","tan","ate","nat","bat"],
            expected: [["bat"],["nat","tan"],["ate","eat","tea"]],
            explanation: 'Group the anagrams together.'
          },
          {
            input: [""],
            expected: [[""]],
            explanation: 'A single empty string forms its own group.'
          },
          {
            input: ["a"],
            expected: [["a"]],
            explanation: 'A single character string forms its own group.'
          },
          {
            input: ["bdddddddddd","bbbbbbbbbbc"],
            expected: [["bbbbbbbbbbc"],["bdddddddddd"]],
            explanation: 'Different frequencies of characters.',
            isHidden: true
          },
          {
            input: ["cab","tin","pew","duh","may","ill","buy","bar","max","doc"],
            expected: [["max"],["buy"],["doc"],["may"],["ill"],["duh"],["tin"],["bar"],["pew"],["cab"]],
            explanation: 'Multiple single groups when no anagrams exist.',
            isHidden: true
          }
        ],
        tags: ['Hash Table', 'String', 'Sorting'],
        starterCode: {
          javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
    // Your code here
    
    // Return the grouped anagrams
}

// Do not modify the code below
const output = groupAnagrams(input);`,
          python: `def group_anagrams(strs):
    # Your code here
    
    # Return the grouped anagrams
    
# Do not modify the code below
output = group_anagrams(input)`
        },
        solutionCode: {
          javascript: `function groupAnagrams(strs) {
    const map = new Map();
    
    for (const str of strs) {
        // Sort the string to get a canonical form
        const sorted = str.split('').sort().join('');
        
        if (!map.has(sorted)) {
            map.set(sorted, []);
        }
        
        map.get(sorted).push(str);
    }
    
    return Array.from(map.values());
}`,
          python: `def group_anagrams(strs):
    anagram_map = {}
    
    for s in strs:
        # Sort the string to get a canonical form
        sorted_s = ''.join(sorted(s))
        
        if sorted_s not in anagram_map:
            anagram_map[sorted_s] = []
            
        anagram_map[sorted_s].append(s)
    
    return list(anagram_map.values())`
        },
        author: adminUser._id
      },
      {
        title: 'Longest Palindromic Substring',
        description: 'Given a string s, return the longest palindromic substring in s. A palindrome is a string that reads the same backward as forward.',
        difficulty: 'Medium',
        constraints: '- 1 <= s.length <= 1000\n- s consist of only digits and English letters.',
        inputFormat: 'A string s.',
        outputFormat: 'The longest palindromic substring of s.',
        sampleInput: '"babad"',
        sampleOutput: '"bab"',
        explanation: 'There are two palindromic substrings with the maximum length in "babad", which are "bab" and "aba". Either one is acceptable as the answer.',
        hints: [
          'Consider expanding around centers for each possible palindrome.',
          'Each character can be a center for an odd-length palindrome.',
          'Each pair of adjacent characters can be centers for an even-length palindrome.',
          'Alternatively, you can use dynamic programming by defining DP[i][j] as whether s[i...j] is a palindrome.'
        ],
        testCases: [
          {
            input: "babad",
            expected: "bab",
            explanation: '"bab" is one of the longest palindromic substrings in "babad".'
          },
          {
            input: "cbbd",
            expected: "bb",
            explanation: '"bb" is the longest palindromic substring in "cbbd".'
          },
          {
            input: "a",
            expected: "a",
            explanation: 'A single character is always a palindrome.'
          },
          {
            input: "ac",
            expected: "a",
            explanation: 'When there are no palindromes longer than 1 character, return any single character.',
            isHidden: true
          },
          {
            input: "racecar",
            expected: "racecar",
            explanation: 'The entire string is a palindrome.',
            isHidden: true
          }
        ],
        tags: ['String', 'Dynamic Programming'],
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {string}
 */
function longestPalindrome(s) {
    // Your code here
    
    // Return the longest palindromic substring
}

// Do not modify the code below
const output = longestPalindrome(input);`,
          python: `def longest_palindrome(s):
    # Your code here
    
    # Return the longest palindromic substring
    
# Do not modify the code below
output = longest_palindrome(input)`
        },
        solutionCode: {
          javascript: `function longestPalindrome(s) {
    if (!s || s.length <= 1) {
        return s;
    }
    
    let start = 0;
    let maxLength = 1;
    
    function expandAroundCenter(left, right) {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            const currentLength = right - left + 1;
            if (currentLength > maxLength) {
                maxLength = currentLength;
                start = left;
            }
            left--;
            right++;
        }
    }
    
    for (let i = 0; i < s.length; i++) {
        // Expand for odd length palindromes
        expandAroundCenter(i, i);
        // Expand for even length palindromes
        expandAroundCenter(i, i + 1);
    }
    
    return s.substring(start, start + maxLength);
}`,
          python: `def longest_palindrome(s):
    if not s or len(s) <= 1:
        return s
        
    start = 0
    max_length = 1
    
    def expand_around_center(left, right):
        nonlocal start, max_length
        while left >= 0 and right < len(s) and s[left] == s[right]:
            current_length = right - left + 1
            if current_length > max_length:
                max_length = current_length
                start = left
            left -= 1
            right += 1
    
    for i in range(len(s)):
        # Expand for odd length palindromes
        expand_around_center(i, i)
        # Expand for even length palindromes
        expand_around_center(i, i + 1)
    
    return s[start:start + max_length]`
        },
        author: adminUser._id
      },
      
      // Hard problems
      {
        title: 'Median of Two Sorted Arrays',
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, find the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).',
        difficulty: 'Hard',
        constraints: '- nums1.length == m\n- nums2.length == n\n- 0 <= m <= 1000\n- 0 <= n <= 1000\n- 1 <= m + n <= 2000\n- -10^6 <= nums1[i], nums2[i] <= 10^6',
        inputFormat: 'Two sorted arrays of integers.',
        outputFormat: 'The median of the combined sorted array (as a floating-point number).',
        sampleInput: 'nums1 = [1,3], nums2 = [2]',
        sampleOutput: '2.0',
        explanation: 'The merged array is [1,2,3], and the median is 2.0.',
        hints: [
          'A brute force approach would be to merge the arrays and find the median, but that would be O(m+n) time complexity.',
          'To achieve O(log(m+n)) time complexity, you need to use a binary search approach.',
          'The problem can be reduced to finding the kth smallest element in the merged array.',
          'Consider dividing both arrays into two parts such that the left parts combined have exactly (m+n+1)/2 elements.'
        ],
        testCases: [
          {
            input: { nums1: [1,3], nums2: [2] },
            expected: 2.0,
            explanation: 'The merged array is [1,2,3], and the median is 2.0.'
          },
          {
            input: { nums1: [1,2], nums2: [3,4] },
            expected: 2.5,
            explanation: 'The merged array is [1,2,3,4], and the median is (2 + 3) / 2 = 2.5.'
          },
          {
            input: { nums1: [0,0], nums2: [0,0] },
            expected: 0.0,
            explanation: 'The merged array is [0,0,0,0], and the median is 0.0.'
          },
          {
            input: { nums1: [], nums2: [1] },
            expected: 1.0,
            explanation: 'The merged array is [1], and the median is 1.0.',
            isHidden: true
          },
          {
            input: { nums1: [2], nums2: [] },
            expected: 2.0,
            explanation: 'The merged array is [2], and the median is 2.0.',
            isHidden: true
          }
        ],
        tags: ['Array', 'Binary Search', 'Divide and Conquer'],
        starterCode: {
          javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
    // Your code here
    
    // Return the median of the two sorted arrays
}

// Do not modify the code below
const output = findMedianSortedArrays(input.nums1, input.nums2);`,
          python: `def find_median_sorted_arrays(nums1, nums2):
    # Your code here
    
    # Return the median of the two sorted arrays
    
# Do not modify the code below
output = find_median_sorted_arrays(input["nums1"], input["nums2"])`
        },
        solutionCode: {
          javascript: `function findMedianSortedArrays(nums1, nums2) {
    // Ensure nums1 is the shorter array to simplify the algorithm
    if (nums1.length > nums2.length) {
        [nums1, nums2] = [nums2, nums1];
    }
    
    const m = nums1.length;
    const n = nums2.length;
    const totalLength = m + n;
    const halfLength = Math.floor((totalLength + 1) / 2);
    
    let low = 0;
    let high = m;
    
    while (low <= high) {
        const partitionX = Math.floor((low + high) / 2);
        const partitionY = halfLength - partitionX;
        
        // Calculate the elements at the partition points
        const maxX = partitionX === 0 ? Number.NEGATIVE_INFINITY : nums1[partitionX - 1];
        const maxY = partitionY === 0 ? Number.NEGATIVE_INFINITY : nums2[partitionY - 1];
        const minX = partitionX === m ? Number.POSITIVE_INFINITY : nums1[partitionX];
        const minY = partitionY === n ? Number.POSITIVE_INFINITY : nums2[partitionY];
        
        if (maxX <= minY && maxY <= minX) {
            // We have the correct partition
            
            // If the total length is odd
            if (totalLength % 2 === 1) {
                return Math.max(maxX, maxY);
            }
            
            // If the total length is even
            return (Math.max(maxX, maxY) + Math.min(minX, minY)) / 2;
        } else if (maxX > minY) {
            // We need to move the partition in nums1 to the left
            high = partitionX - 1;
        } else {
            // We need to move the partition in nums1 to the right
            low = partitionX + 1;
        }
    }
    
    // If we reach here, the input arrays are not sorted
    throw new Error("Input arrays are not sorted");
}`,
          python: `def find_median_sorted_arrays(nums1, nums2):
    # Ensure nums1 is the shorter array to simplify the algorithm
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    
    m, n = len(nums1), len(nums2)
    total_length = m + n
    half_length = (total_length + 1) // 2
    
    low, high = 0, m
    
    while low <= high:
        partition_x = (low + high) // 2
        partition_y = half_length - partition_x
        
        # Calculate the elements at the partition points
        max_x = float('-inf') if partition_x == 0 else nums1[partition_x - 1]
        max_y = float('-inf') if partition_y == 0 else nums2[partition_y - 1]
        min_x = float('inf') if partition_x == m else nums1[partition_x]
        min_y = float('inf') if partition_y == n else nums2[partition_y]
        
        if max_x <= min_y and max_y <= min_x:
            # We have the correct partition
            
            # If the total length is odd
            if total_length % 2 == 1:
                return max(max_x, max_y)
            
            # If the total length is even
            return (max(max_x, max_y) + min(min_x, min_y)) / 2
        elif max_x > min_y:
            # We need to move the partition in nums1 to the left
            high = partition_x - 1
        else:
            # We need to move the partition in nums1 to the right
            low = partition_x + 1
    
    # If we reach here, the input arrays are not sorted
    raise ValueError("Input arrays are not sorted")`
        },
        author: adminUser._id
      },
      {
        title: 'Trapping Rain Water',
        description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        difficulty: 'Hard',
        constraints: '- n == height.length\n- 1 <= n <= 2 * 10^4\n- 0 <= height[i] <= 10^5',
        inputFormat: 'An array of non-negative integers representing heights of bars.',
        outputFormat: 'A single integer representing the amount of water that can be trapped.',
        sampleInput: '[0,1,0,2,1,0,1,3,2,1,2,1]',
        sampleOutput: '6',
        explanation: 'The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.',
        hints: [
          'Water at any position depends on the maximum height bars to its left and right.',
          'You can use two arrays to store the maximum height to the left and right of each position.',
          'Alternatively, you can use a two-pointer approach to solve this problem in O(n) time with O(1) space.',
          'Consider that water trapped at position i is equal to min(maxLeft, maxRight) - height[i].'
        ],
        testCases: [
          {
            input: [0,1,0,2,1,0,1,3,2,1,2,1],
            expected: 6,
            explanation: 'The elevation map traps 6 units of water as shown in the example.'
          },
          {
            input: [4,2,0,3,2,5],
            expected: 9,
            explanation: 'The elevation map traps 9 units of water.'
          },
          {
            input: [0,0,0,0],
            expected: 0,
            explanation: 'No water can be trapped with a flat elevation map.'
          },
          {
            input: [5,4,1,2],
            expected: 1,
            explanation: 'Only 1 unit can be trapped between heights 1 and 2.',
            isHidden: true
          },
          {
            input: [5,2,1,2,1,5],
            expected: 14,
            explanation: 'Symmetric case with high walls on both sides.',
            isHidden: true
          }
        ],
        tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
        starterCode: {
          javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
    // Your code here
    
    // Return the amount of water that can be trapped
}

// Do not modify the code below
const output = trap(input);`,
          python: `def trap(height):
    # Your code here
    
    # Return the amount of water that can be trapped
    
# Do not modify the code below
output = trap(input)`
        },
        solutionCode: {
          javascript: `function trap(height) {
    if (height.length <= 2) return 0;
    
    let left = 0;
    let right = height.length - 1;
    let leftMax = height[left];
    let rightMax = height[right];
    let water = 0;
    
    while (left < right) {
        if (leftMax < rightMax) {
            left++;
            leftMax = Math.max(leftMax, height[left]);
            water += leftMax - height[left];
        } else {
            right--;
            rightMax = Math.max(rightMax, height[right]);
            water += rightMax - height[right];
        }
    }
    
    return water;
}`,
          python: `def trap(height):
    if len(height) <= 2:
        return 0
    
    left, right = 0, len(height) - 1
    left_max, right_max = height[left], height[right]
    water = 0
    
    while left < right:
        if left_max < right_max:
            left += 1
            left_max = max(left_max, height[left])
            water += left_max - height[left]
        else:
            right -= 1
            right_max = max(right_max, height[right])
            water += right_max - height[right]
    
    return water`
        },
        author: adminUser._id
      }
    ];
    
    // Save each problem to the database
    for (const problemData of newProblems) {
      // Check if the problem already exists
      const existingProblem = await Problem.findOne({ title: problemData.title });
      
      if (!existingProblem) {
        const problem = new Problem(problemData);
        await problem.save();
        console.log(`Problem "${problemData.title}" created.`);
      } else {
        console.log(`Problem "${problemData.title}" already exists, skipping.`);
      }
    }
    
    console.log(`Added ${newProblems.length} new problems!`);
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error adding problems:', error);
    mongoose.connection.close();
    process.exit(1);
  }
} 