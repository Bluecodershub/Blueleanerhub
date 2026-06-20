export type RuntimeLanguageId =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'

export interface RuntimeLanguage {
  id: RuntimeLanguageId
  name: string
  shortName: string
  version: string
  extension: string
  monacoLanguage: string
  iconPath: string
  accentClass: string
  starterCode: string
}

const twoSumPython = `import sys

def two_sum(nums, target):
    seen = {}
    for index, value in enumerate(nums):
        need = target - value
        if need in seen:
            return [seen[need], index]
        seen[value] = index
    return []

def main():
    lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]
    if len(lines) < 2:
        print([])
        return

    nums = [int(part) for part in lines[0].replace(",", " ").split()]
    target = int(lines[1])
    print(two_sum(nums, target))

if __name__ == "__main__":
    main()
`

const twoSumJavaScript = `const fs = require("fs");

function twoSum(nums, target) {
  const seen = new Map();
  for (let index = 0; index < nums.length; index += 1) {
    const need = target - nums[index];
    if (seen.has(need)) return [seen.get(need), index];
    seen.set(nums[index], index);
  }
  return [];
}

const values = fs.readFileSync(0, "utf8").trim().split(/\\s+/).filter(Boolean).map(Number);
const target = values.pop();
const nums = values;
console.log(JSON.stringify(twoSum(nums, target)));
`

const twoSumTypeScript = `declare const require: any;

const fs = require("fs");

function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let index = 0; index < nums.length; index += 1) {
    const need = target - nums[index];
    if (seen.has(need)) return [seen.get(need) as number, index];
    seen.set(nums[index], index);
  }
  return [];
}

const values = fs.readFileSync(0, "utf8").trim().split(/\\s+/).filter(Boolean).map(Number);
const target = values.pop();
const nums = values;
console.log(JSON.stringify(twoSum(nums, target)));
`

const twoSumJava = `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class Main {
    private static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int index = 0; index < nums.length; index++) {
            int need = target - nums[index];
            if (seen.containsKey(need)) {
                return new int[] { seen.get(need), index };
            }
            seen.put(nums[index], index);
        }
        return new int[0];
    }

    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String numsLine = reader.readLine();
        String targetLine = reader.readLine();
        if (numsLine == null || targetLine == null) {
            System.out.println("[]");
            return;
        }

        String[] parts = numsLine.trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = Integer.parseInt(targetLine.trim());
        System.out.println(Arrays.toString(twoSum(nums, target)));
    }
}
`

const twoSumCpp = `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int index = 0; index < static_cast<int>(nums.size()); ++index) {
        int need = target - nums[index];
        if (seen.count(need)) return {seen[need], index};
        seen[nums[index]] = index;
    }
    return {};
}

int main() {
    string line;
    if (!getline(cin, line)) {
        cout << "[]\\n";
        return 0;
    }

    stringstream values(line);
    vector<int> nums;
    int value;
    while (values >> value) nums.push_back(value);

    int target;
    cin >> target;
    vector<int> answer = twoSum(nums, target);
    if (answer.empty()) cout << "[]\\n";
    else cout << "[" << answer[0] << ", " << answer[1] << "]\\n";
    return 0;
}
`

const twoSumC = `#include <stdio.h>

int main(void) {
    int nums[1000];
    int count = 0;
    int value;

    while (scanf("%d", &value) == 1) {
        nums[count++] = value;
    }

    if (count < 3) {
        printf("[]\\n");
        return 0;
    }

    int target = nums[count - 1];
    count -= 1;

    for (int i = 0; i < count; i++) {
        for (int j = i + 1; j < count; j++) {
            if (nums[i] + nums[j] == target) {
                printf("[%d, %d]\\n", i, j);
                return 0;
            }
        }
    }

    printf("[]\\n");
    return 0;
}
`

const twoSumCSharp = `using System;
using System.Collections.Generic;
using System.Linq;

public class MainClass {
    static int[] TwoSum(int[] nums, int target) {
        var seen = new Dictionary<int, int>();
        for (int index = 0; index < nums.Length; index++) {
            int need = target - nums[index];
            if (seen.ContainsKey(need)) return new[] { seen[need], index };
            seen[nums[index]] = index;
        }
        return Array.Empty<int>();
    }

    public static void Main() {
        string numsLine = Console.ReadLine() ?? "";
        string targetLine = Console.ReadLine() ?? "0";
        int[] nums = numsLine.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
        int target = int.Parse(targetLine);
        int[] answer = TwoSum(nums, target);
        Console.WriteLine(answer.Length == 0 ? "[]" : $"[{answer[0]}, {answer[1]}]");
    }
}
`

const twoSumGo = `package main

import (
    "bufio"
    "fmt"
    "os"
    "strconv"
    "strings"
)

func twoSum(nums []int, target int) []int {
    seen := map[int]int{}
    for index, value := range nums {
        need := target - value
        if previous, ok := seen[need]; ok {
            return []int{previous, index}
        }
        seen[value] = index
    }
    return []int{}
}

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    if !scanner.Scan() {
        fmt.Println("[]")
        return
    }
    parts := strings.Fields(scanner.Text())
    nums := make([]int, 0, len(parts))
    for _, part := range parts {
        value, _ := strconv.Atoi(part)
        nums = append(nums, value)
    }
    if !scanner.Scan() {
        fmt.Println("[]")
        return
    }
    target, _ := strconv.Atoi(strings.TrimSpace(scanner.Text()))
    answer := twoSum(nums, target)
    if len(answer) == 0 {
        fmt.Println("[]")
        return
    }
    fmt.Printf("[%d, %d]\\n", answer[0], answer[1])
}
`

const twoSumRust = `use std::collections::HashMap;
use std::io::{self, Read};

fn two_sum(nums: &[i32], target: i32) -> Vec<usize> {
    let mut seen: HashMap<i32, usize> = HashMap::new();
    for (index, value) in nums.iter().enumerate() {
        let need = target - value;
        if let Some(previous) = seen.get(&need) {
            return vec![*previous, index];
        }
        seen.insert(*value, index);
    }
    vec![]
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut values: Vec<i32> = input.split_whitespace().filter_map(|v| v.parse().ok()).collect();
    if values.len() < 3 {
        println!("[]");
        return;
    }
    let target = values.pop().unwrap();
    let answer = two_sum(&values, target);
    if answer.is_empty() {
        println!("[]");
    } else {
        println!("[{}, {}]", answer[0], answer[1]);
    }
}
`

const twoSumPhp = `<?php
$values = preg_split('/\\s+/', trim(stream_get_contents(STDIN)));
$numbers = array_map('intval', array_filter($values, 'strlen'));
if (count($numbers) < 3) {
    echo "[]\\n";
    exit;
}

$target = array_pop($numbers);
$seen = [];
foreach ($numbers as $index => $value) {
    $need = $target - $value;
    if (array_key_exists((string) $need, $seen)) {
        echo "[" . $seen[(string) $need] . ", " . $index . "]\\n";
        exit;
    }
    $seen[(string) $value] = $index;
}

echo "[]\\n";
`

const twoSumRuby = `input = STDIN.read.split.map(&:to_i)

if input.length < 3
  puts "[]"
  exit
end

target = input.pop
seen = {}

input.each_with_index do |value, index|
  need = target - value
  if seen.key?(need)
    puts "[#{seen[need]}, #{index}]"
    exit
  end
  seen[value] = index
end

puts "[]"
`

export const RUNTIME_LANGUAGES: RuntimeLanguage[] = [
  {
    id: 'python',
    name: 'Python 3',
    shortName: 'Py',
    version: '3.12',
    extension: '.py',
    monacoLanguage: 'python',
    iconPath: '/images/languages/python.svg',
    accentClass: 'from-[#3776AB] to-[#FFD43B]',
    starterCode: twoSumPython,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    shortName: 'JS',
    version: 'Node 20',
    extension: '.js',
    monacoLanguage: 'javascript',
    iconPath: '/images/languages/javascript.svg',
    accentClass: 'from-[#F7DF1E] to-[#BFA90B]',
    starterCode: twoSumJavaScript,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    shortName: 'TS',
    version: '5.x',
    extension: '.ts',
    monacoLanguage: 'typescript',
    iconPath: '/images/languages/typescript.svg',
    accentClass: 'from-[#3178C6] to-[#1E4F86]',
    starterCode: twoSumTypeScript,
  },
  {
    id: 'java',
    name: 'Java',
    shortName: 'Java',
    version: '21',
    extension: '.java',
    monacoLanguage: 'java',
    iconPath: '/images/languages/java.svg',
    accentClass: 'from-[#F89820] to-[#5382A1]',
    starterCode: twoSumJava,
  },
  {
    id: 'cpp',
    name: 'C++',
    shortName: 'C++',
    version: 'C++17',
    extension: '.cpp',
    monacoLanguage: 'cpp',
    iconPath: '/images/languages/cpp.svg',
    accentClass: 'from-[#0B4F9C] to-[#0D69C9]',
    starterCode: twoSumCpp,
  },
  {
    id: 'c',
    name: 'C',
    shortName: 'C',
    version: 'C17',
    extension: '.c',
    monacoLanguage: 'c',
    iconPath: '/images/languages/c.svg',
    accentClass: 'from-[#1F4E79] to-[#2F80C0]',
    starterCode: twoSumC,
  },
  {
    id: 'csharp',
    name: 'C#',
    shortName: 'C#',
    version: 'Mono',
    extension: '.cs',
    monacoLanguage: 'csharp',
    iconPath: '/images/languages/csharp.svg',
    accentClass: 'from-[#68217A] to-[#4B1D7A]',
    starterCode: twoSumCSharp,
  },
  {
    id: 'go',
    name: 'Go',
    shortName: 'Go',
    version: '1.22',
    extension: '.go',
    monacoLanguage: 'go',
    iconPath: '/images/languages/go.svg',
    accentClass: 'from-[#00ADD8] to-[#007D9C]',
    starterCode: twoSumGo,
  },
  {
    id: 'rust',
    name: 'Rust',
    shortName: 'Rs',
    version: '1.x',
    extension: '.rs',
    monacoLanguage: 'rust',
    iconPath: '/images/languages/rust.svg',
    accentClass: 'from-[#CE422B] to-[#7A2A1B]',
    starterCode: twoSumRust,
  },
  {
    id: 'php',
    name: 'PHP',
    shortName: 'PHP',
    version: '8.3',
    extension: '.php',
    monacoLanguage: 'php',
    iconPath: '/images/languages/php.svg',
    accentClass: 'from-[#777BB4] to-[#4F5B93]',
    starterCode: twoSumPhp,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    shortName: 'Rb',
    version: '3.3',
    extension: '.rb',
    monacoLanguage: 'ruby',
    iconPath: '/images/languages/ruby.svg',
    accentClass: 'from-[#CC342D] to-[#8E1B17]',
    starterCode: twoSumRuby,
  },
]

export const DEFAULT_RUNTIME_LANGUAGE = RUNTIME_LANGUAGES[0]

export function getRuntimeLanguage(language: string | undefined | null): RuntimeLanguage {
  if (!language) return DEFAULT_RUNTIME_LANGUAGE
  const normalized = language.toLowerCase().replace(/[^a-z0-9+#]/g, '')
  return (
    RUNTIME_LANGUAGES.find((item) => {
      const aliases = [
        item.id,
        item.name.toLowerCase().replace(/[^a-z0-9+#]/g, ''),
        item.monacoLanguage,
        item.shortName.toLowerCase().replace(/[^a-z0-9+#]/g, ''),
      ]
      return aliases.includes(normalized)
    }) ?? DEFAULT_RUNTIME_LANGUAGE
  )
}

export function getStarterCode(language: string | undefined | null): string {
  return getRuntimeLanguage(language).starterCode
}

export function getSupportedRuntimeLanguages(supported?: string[]): RuntimeLanguage[] {
  if (!supported?.length) return RUNTIME_LANGUAGES
  const supportedSet = new Set(supported.map((item) => item.toLowerCase()))
  return RUNTIME_LANGUAGES.filter((item) => supportedSet.has(item.id))
}
