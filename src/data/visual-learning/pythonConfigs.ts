import type { VisualConfig, AnimStep } from '../../components/visual-learning/types';

/* ─────────────── helpers ─────────────── */

function mkStep(
  id: string,
  label: string,
  dataState: Record<string, unknown>,
): AnimStep {
  return { id, label, highlights: [], dataState };
}

/* ═══════════════════════════════════════
   Config 1 — Two Sum (lc-1)
   ═══════════════════════════════════════ */

const TWO_SUM_CODE = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`;

const twoSum: VisualConfig = {
  questionId: 'lc-1',
  template: 'array-to-dict',
  title: 'Two Sum',
  subtitle: 'Build a HashMap for O(1) lookups',
  category: 'python',
  thinking: {
    logic: 'Find two numbers in a list that add up to a target. Return their indices.',
    decomposition: 'For each number, check if the complement (target - num) was seen before. If yes → done. If no → remember this number.',
    translation: 'Dict as memory (seen[num] = index). One pass through the list. enumerate() for index + value.',
    edgeCases: 'Empty list → return []. Only one element → return []. Multiple valid pairs → return first found. Negative numbers → works fine, complement math still applies.',
    tradeOffs: 'Dict gives O(1) lookup per element → O(n) total. Brute force (two loops) would be O(n²). Space vs time: we use extra memory (the dict) to avoid slow nested loops.',
  },
  pseudoCode: `1. Create empty dict "seen"
2. For each number in the list:
   a. Calculate diff = target - current number
   b. If diff is already in "seen" → found the pair! Return indices
   c. Otherwise, store current number → its index in "seen"
3. If no pair found, return empty`,
  solutionCode: TWO_SUM_CODE,
  inputs: [
    { key: 'array', label: 'nums', type: 'array', defaultValue: [2, 7, 11, 15], editable: true },
    { key: 'target', label: 'target', type: 'number', defaultValue: 9, editable: true },
  ],
  generateSteps: (inputs) => {
    const nums = inputs.array as number[];
    const target = inputs.target as number;
    const steps: AnimStep[] = [];
    const seen: Record<string, number> = {};
    const processed: number[] = [];

    // Step 0 — function entry
    steps.push(mkStep('start', 'Call two_sum with nums and target', {
      code: TWO_SUM_CODE, activeLine: 0,
      array: nums, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['nums', 'target'],
      nums, target, changedVars: ['nums', 'target'],
    }));

    // Step 1 — init seen
    steps.push(mkStep('init-seen', 'Initialize empty dictionary', {
      code: TWO_SUM_CODE, activeLine: 1,
      array: nums, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['nums', 'target', 'seen'],
      nums, target, seen: {}, changedVars: ['seen'],
    }));

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const diff = target - num;
      const found = String(diff) in seen;

      // Loop iteration — for line
      steps.push(mkStep(`loop-${i}`, `Loop: i=${i}, num=${num}`, {
        code: TWO_SUM_CODE, activeLine: 2,
        array: nums, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['nums', 'target', 'seen', 'i', 'num'],
        nums, target, seen: { ...seen }, i, num, changedVars: ['i', 'num'],
      }));

      // Compute diff
      steps.push(mkStep(`diff-${i}`, `Compute diff = ${target} - ${num} = ${diff}`, {
        code: TWO_SUM_CODE, activeLine: 3,
        array: nums, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['nums', 'target', 'seen', 'i', 'num', 'diff'],
        nums, target, seen: { ...seen }, i, num, diff,
        changedVars: ['diff'],
        annotation: `diff = target - num = ${target} - ${num} = ${diff}`,
      }));

      if (found) {
        const j = seen[String(diff)];
        // Check — found!
        steps.push(mkStep(`found-${i}`, `${diff} IS in seen at index ${j} — match!`, {
          code: TWO_SUM_CODE, activeLine: 4,
          array: nums, currentIndex: i, processedIndices: [...processed],
          matchIndices: [j, i], foundMatch: true,
          visibleVars: ['nums', 'target', 'seen', 'i', 'num', 'diff'],
          nums, target, seen: { ...seen }, i, num, diff,
          changedVars: [],
          annotation: `✅ ${diff} found in seen! seen[${diff}] = ${j}`,
        }));

        // Return
        steps.push(mkStep(`return-${i}`, `Return [${j}, ${i}]`, {
          code: TWO_SUM_CODE, activeLine: 5,
          array: nums, currentIndex: i, processedIndices: [...processed],
          matchIndices: [j, i], foundMatch: true,
          visibleVars: ['nums', 'target', 'seen', 'i', 'num', 'diff'],
          nums, target, seen: { ...seen }, i, num, diff,
          result: [j, i], changedVars: [],
          annotation: `Return indices [${j}, ${i}] — nums[${j}]=${nums[j]} + nums[${i}]=${nums[i]} = ${target}`,
        }));
        return steps;
      }

      // Check — not found, add to seen
      seen[String(num)] = i;
      processed.push(i);

      steps.push(mkStep(`add-${i}`, `${diff} not in seen → add seen[${num}] = ${i}`, {
        code: TWO_SUM_CODE, activeLine: 6,
        array: nums, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['nums', 'target', 'seen', 'i', 'num', 'diff'],
        nums, target, seen: { ...seen }, i, num, diff,
        changedVars: ['seen'],
        annotation: `❌ ${diff} not in seen → store seen[${num}] = ${i}`,
      }));
    }

    // No match
    steps.push(mkStep('no-match', 'No two numbers sum to target', {
      code: TWO_SUM_CODE, activeLine: 7,
      array: nums, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
      visibleVars: ['nums', 'target', 'seen'],
      nums, target, seen: { ...seen },
      result: [], changedVars: [],
    }));

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 2 — Contains Duplicate (lc-3)
   ═══════════════════════════════════════ */

const CONTAINS_DUP_CODE = `def contains_duplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False`;

const containsDuplicate: VisualConfig = {
  questionId: 'lc-3',
  template: 'array-to-set',
  title: 'Contains Duplicate',
  subtitle: 'Use a Set for O(1) membership checks',
  category: 'python',
  thinking: {
    logic: 'Check if any number appears more than once in the list.',
    decomposition: 'Track what we\'ve seen. For each number: already seen → duplicate. Not seen → add it.',
    translation: 'Set for O(1) lookup. One loop. Return True/False.',
    edgeCases: 'Empty list → False. Single element → False. All same elements → True on second item.',
    tradeOffs: 'Set gives O(1) membership check. Alternative: sort first O(n log n) then check neighbors — no extra space but slower. We trade space for speed.',
  },
  pseudoCode: `1. Create empty set "seen"
2. For each number in the list:
   a. If number is already in "seen" → duplicate found! Return True
   b. Otherwise, add number to "seen"
3. Finished loop with no duplicate → Return False`,
  solutionCode: CONTAINS_DUP_CODE,
  inputs: [
    { key: 'array', label: 'nums', type: 'array', defaultValue: [1, 2, 3, 1], editable: true },
  ],
  generateSteps: (inputs) => {
    const nums = inputs.array as number[];
    const steps: AnimStep[] = [];
    const seen = new Set<number>();
    const processed: number[] = [];

    steps.push(mkStep('start', 'Initialize empty set', {
      code: CONTAINS_DUP_CODE, activeLine: 1,
      array: nums, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['nums', 'seen'], nums, seen: [] as number[], changedVars: ['seen'],
    }));

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const isDup = seen.has(num);

      // Loop
      steps.push(mkStep(`loop-${i}`, `Check num=${num}`, {
        code: CONTAINS_DUP_CODE, activeLine: 2,
        array: nums, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['nums', 'seen', 'num'], nums, num, seen: [...seen], changedVars: ['num'],
      }));

      if (isDup) {
        steps.push(mkStep(`found-${i}`, `${num} IS in seen — duplicate!`, {
          code: CONTAINS_DUP_CODE, activeLine: 3,
          array: nums, currentIndex: i, processedIndices: [...processed],
          matchIndices: [i, nums.indexOf(num)], foundMatch: true,
          visibleVars: ['nums', 'seen', 'num'], nums, num, seen: [...seen],
          changedVars: [],
          annotation: `✅ ${num} already in seen!`,
        }));
        steps.push(mkStep(`return-${i}`, 'Return True', {
          code: CONTAINS_DUP_CODE, activeLine: 4,
          array: nums, currentIndex: i, processedIndices: [...processed],
          matchIndices: [i, nums.indexOf(num)], foundMatch: true,
          visibleVars: ['nums', 'seen', 'num'], nums, num, seen: [...seen],
          result: true, changedVars: [],
        }));
        return steps;
      }

      seen.add(num);
      processed.push(i);

      steps.push(mkStep(`add-${i}`, `${num} not in seen → add it`, {
        code: CONTAINS_DUP_CODE, activeLine: 5,
        array: nums, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['nums', 'seen', 'num'], nums, num, seen: [...seen],
        changedVars: ['seen'],
        annotation: `❌ ${num} not in seen → seen.add(${num})`,
      }));
    }

    steps.push(mkStep('no-dup', 'No duplicates found', {
      code: CONTAINS_DUP_CODE, activeLine: 6,
      array: nums, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
      visibleVars: ['nums', 'seen'], nums, seen: [...seen],
      result: false, changedVars: [],
    }));

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 3 — Valid Anagram (lc-2)
   ═══════════════════════════════════════ */

const ANAGRAM_CODE = `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
        if count[c] < 0:
            return False
    return True`;

const validAnagram: VisualConfig = {
  questionId: 'lc-2',
  template: 'array-to-dict',
  title: 'Valid Anagram',
  subtitle: 'Count character frequencies with a HashMap',
  category: 'python',
  thinking: {
    logic: 'Check if two strings use the exact same characters the same number of times.',
    decomposition: 'Count chars in string s (+1 each). Count chars in string t (-1 each). If any count goes negative → not anagram.',
    translation: 'Dict as counter. Two loops (one per string). Early return on negative.',
    edgeCases: 'Empty strings → True (both empty). Different lengths → immediately False (early return saves time). Same string → True.',
    tradeOffs: 'Counter dict is O(n). Alternative: sort both strings and compare O(n log n). Counter approach is faster and lets us exit early on mismatch.',
  },
  pseudoCode: `1. If lengths differ → not anagram, Return False
2. Create empty dict "count"
3. For each char in string s: increment count[char]
4. For each char in string t: decrement count[char]
   - If any count goes below 0 → Return False
5. All counts balanced → Return True`,
  solutionCode: ANAGRAM_CODE,
  inputs: [
    { key: 'array', label: 's', type: 'string', defaultValue: 'anagram', editable: true },
    { key: 'target', label: 't', type: 'string', defaultValue: 'nagaram', editable: true },
  ],
  generateSteps: (inputs) => {
    const s = String(inputs.array);
    const t = String(inputs.target);
    const steps: AnimStep[] = [];
    const count: Record<string, number> = {};

    const sArr = s.split('');
    const tArr = t.split('');

    // Length check
    steps.push(mkStep('len-check', `Check lengths: len("${s}")=${s.length}, len("${t}")=${t.length}`, {
      code: ANAGRAM_CODE, activeLine: 1,
      array: sArr, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['s', 't'], s, t, changedVars: ['s', 't'],
      annotation: s.length === t.length ? `✅ Same length (${s.length})` : `❌ Different lengths!`,
    }));

    if (s.length !== t.length) {
      steps.push(mkStep('len-fail', 'Different lengths → not anagram', {
        code: ANAGRAM_CODE, activeLine: 2,
        array: sArr, currentIndex: -1, processedIndices: [], matchIndices: [],
        visibleVars: ['s', 't'], s, t, result: false, changedVars: [],
      }));
      return steps;
    }

    // Init count
    steps.push(mkStep('init', 'Initialize count dict', {
      code: ANAGRAM_CODE, activeLine: 3,
      array: sArr, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['s', 't', 'count'], s, t, count: {}, changedVars: ['count'],
    }));

    // Count s chars (summarize — show every 2 chars)
    const processed: number[] = [];
    for (let i = 0; i < sArr.length; i++) {
      const c = sArr[i];
      count[c] = (count[c] || 0) + 1;
      processed.push(i);

      if (i % 2 === 0 || i === sArr.length - 1) {
        steps.push(mkStep(`count-s-${i}`, `Count '${c}' in s: count['${c}'] = ${count[c]}`, {
          code: ANAGRAM_CODE, activeLine: 5,
          array: sArr, currentIndex: i, processedIndices: [...processed], matchIndices: [],
          visibleVars: ['s', 't', 'count', 'c'], s, t, count: { ...count }, c,
          changedVars: ['count', 'c'],
        }));
      }
    }

    // Subtract t chars
    const processed2: number[] = [];
    for (let i = 0; i < tArr.length; i++) {
      const c = tArr[i];
      count[c] = (count[c] || 0) - 1;
      processed2.push(i);

      if (count[c] < 0) {
        steps.push(mkStep(`sub-t-${i}`, `Subtract '${c}' in t: count['${c}'] = ${count[c]} < 0!`, {
          code: ANAGRAM_CODE, activeLine: 8,
          array: tArr, currentIndex: i, processedIndices: [...processed2], matchIndices: [],
          visibleVars: ['s', 't', 'count', 'c'], s, t, count: { ...count }, c,
          changedVars: ['count'], foundMatch: true,
          annotation: `❌ count['${c}'] went negative — not an anagram`,
        }));
        steps.push(mkStep('fail', 'Return False', {
          code: ANAGRAM_CODE, activeLine: 9,
          array: tArr, currentIndex: i, processedIndices: [...processed2], matchIndices: [],
          visibleVars: ['s', 't', 'count'], s, t, count: { ...count },
          result: false, changedVars: [],
        }));
        return steps;
      }

      if (i % 2 === 0 || i === tArr.length - 1) {
        steps.push(mkStep(`sub-t-${i}`, `Subtract '${c}' in t: count['${c}'] = ${count[c]}`, {
          code: ANAGRAM_CODE, activeLine: 7,
          array: tArr, currentIndex: i, processedIndices: [...processed2], matchIndices: [],
          visibleVars: ['s', 't', 'count', 'c'], s, t, count: { ...count }, c,
          changedVars: ['count', 'c'],
        }));
      }
    }

    // Success
    steps.push(mkStep('success', 'All counts are 0 → valid anagram!', {
      code: ANAGRAM_CODE, activeLine: 10,
      array: tArr, currentIndex: -1, processedIndices: [...processed2], matchIndices: [],
      visibleVars: ['s', 't', 'count'], s, t, count: { ...count },
      result: true, changedVars: [],
      annotation: '✅ All character counts balanced to zero',
    }));

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 4 — Group Anagrams (lc-8)
   ═══════════════════════════════════════ */

const GROUP_ANAGRAMS_CODE = `def group_anagrams(strs):
    groups = {}
    for s in strs:
        key = ''.join(sorted(s))
        if key not in groups:
            groups[key] = []
        groups[key].append(s)
    return list(groups.values())`;

const groupAnagrams: VisualConfig = {
  questionId: 'lc-8',
  template: 'array-grouping',
  title: 'Group Anagrams',
  subtitle: 'Sort keys to group equivalent strings',
  category: 'python',
  thinking: {
    logic: 'Group strings that are anagrams of each other together.',
    decomposition: 'Anagrams have the same letters sorted. Sort each string → use as key → group strings with same key.',
    translation: 'Dict of lists. Key = sorted letters. sorted() + join(). Append original string to its group.',
    edgeCases: 'Empty list → return []. Single string → one group with one item. Empty string "" → valid, sorts to "" as key.',
    tradeOffs: 'Sorted string as key is O(k log k) per word. Alternative: use character count tuple as key — O(k) per word but harder to implement. Sorted is cleaner for interview.',
  },
  pseudoCode: `1. Create empty dict "groups"
2. For each string in the list:
   a. Sort its letters to make a key (e.g. "eat" → "aet")
   b. If key not in groups → create empty list
   c. Append the original string to groups[key]
3. Return all the groups as a list of lists`,
  solutionCode: GROUP_ANAGRAMS_CODE,
  inputs: [
    { key: 'array', label: 'strs', type: 'array', defaultValue: ['eat','tea','tan','ate','nat','bat'], editable: true },
  ],
  generateSteps: (inputs) => {
    const strs = inputs.array as string[];
    const steps: AnimStep[] = [];
    const groups: Record<string, string[]> = {};
    const processed: number[] = [];

    steps.push(mkStep('start', 'Initialize empty groups dict', {
      code: GROUP_ANAGRAMS_CODE, activeLine: 1,
      array: strs, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['strs', 'groups'], strs, groups: {},
      changedVars: ['groups'],
    }));

    for (let i = 0; i < strs.length; i++) {
      const s = strs[i];
      const key = s.split('').sort().join('');

      // Compute key
      steps.push(mkStep(`key-${i}`, `sorted("${s}") → "${key}"`, {
        code: GROUP_ANAGRAMS_CODE, activeLine: 3,
        array: strs, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['strs', 'groups', 's', 'key'], strs, groups: JSON.parse(JSON.stringify(groups)), s, key,
        changedVars: ['s', 'key'],
        annotation: `Sort letters of "${s}" → "${key}"`,
      }));

      // Add to group
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
      processed.push(i);

      steps.push(mkStep(`group-${i}`, `Add "${s}" to groups["${key}"]`, {
        code: GROUP_ANAGRAMS_CODE, activeLine: 6,
        array: strs, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['strs', 'groups', 's', 'key'], strs, groups: JSON.parse(JSON.stringify(groups)), s, key,
        changedVars: ['groups'],
      }));
    }

    // Return
    const result = Object.values(groups);
    steps.push(mkStep('return', `Return ${result.length} groups`, {
      code: GROUP_ANAGRAMS_CODE, activeLine: 7,
      array: strs, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
      visibleVars: ['strs', 'groups'], strs, groups: JSON.parse(JSON.stringify(groups)),
      result, changedVars: [],
    }));

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 5 — Top K Frequent (lc-23)
   ═══════════════════════════════════════ */

const TOP_K_CODE = `def top_k_frequent(nums, k):
    count = {}
    for num in nums:
        count[num] = count.get(num, 0) + 1
    sorted_keys = sorted(count.keys(),
        key=lambda x: count[x], reverse=True)
    return sorted_keys[:k]`;

const topKFrequent: VisualConfig = {
  questionId: 'lc-23',
  template: 'array-to-dict',
  title: 'Top K Frequent Elements',
  subtitle: 'Count frequencies, then sort',
  category: 'python',
  thinking: {
    logic: 'Find the k numbers that appear most often in the list.',
    decomposition: 'Count how many times each number appears. Sort by count descending. Take first k.',
    translation: 'Dict as counter (+= 1). sorted() with key=lambda. Slice [:k].',
    edgeCases: 'k = 0 → return []. k equals list length → return all unique elements. All elements same → return that one element.',
    tradeOffs: 'Count + sort is O(n log n). Optimal: heap O(n log k). For interview, sort approach is simpler and fast enough. Mention heap if asked for optimization.',
  },
  pseudoCode: `1. Create empty dict "count"
2. For each number: increment count[number]
3. Sort the keys by their count (highest first)
4. Return the first k keys`,
  solutionCode: TOP_K_CODE,
  inputs: [
    { key: 'array', label: 'nums', type: 'array', defaultValue: [1,1,1,2,2,3], editable: true },
    { key: 'target', label: 'k', type: 'number', defaultValue: 2, editable: true },
  ],
  generateSteps: (inputs) => {
    const nums = inputs.array as number[];
    const k = inputs.target as number;
    const steps: AnimStep[] = [];
    const count: Record<string, number> = {};
    const processed: number[] = [];

    steps.push(mkStep('start', 'Initialize empty count dict', {
      code: TOP_K_CODE, activeLine: 1,
      array: nums, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['nums', 'k', 'count'], nums, k, count: {},
      changedVars: ['count'],
    }));

    // Count phase
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      count[String(num)] = (count[String(num)] || 0) + 1;
      processed.push(i);

      // Show every element or when count changes meaningfully
      steps.push(mkStep(`count-${i}`, `count[${num}] = ${count[String(num)]}`, {
        code: TOP_K_CODE, activeLine: 3,
        array: nums, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['nums', 'k', 'count', 'num'], nums, k, count: { ...count }, num,
        changedVars: ['count', 'num'],
      }));
    }

    // Sort phase
    const sorted = Object.keys(count).sort((a, b) => count[b] - count[a]);
    steps.push(mkStep('sort', `Sort by frequency: [${sorted.join(', ')}]`, {
      code: TOP_K_CODE, activeLine: 4,
      array: nums, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
      visibleVars: ['nums', 'k', 'count', 'sorted_keys'], nums, k, count: { ...count },
      sorted_keys: sorted.map(Number),
      changedVars: ['sorted_keys'],
      annotation: `Sorted by count descending: ${sorted.map(s => `${s}(×${count[s]})`).join(', ')}`,
    }));

    // Take k
    const result = sorted.slice(0, k).map(Number);
    steps.push(mkStep('return', `Return top ${k}: [${result.join(', ')}]`, {
      code: TOP_K_CODE, activeLine: 6,
      array: nums, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
      visibleVars: ['nums', 'k', 'count', 'sorted_keys'], nums, k, count: { ...count },
      sorted_keys: sorted.map(Number),
      result, changedVars: [],
      annotation: `Take first ${k} from sorted: [${result.join(', ')}]`,
    }));

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 6 — Group Names by Department
   ═══════════════════════════════════════ */

const GROUP_BY_DEPT_CODE = `def group_by_department(employees):
    result = {}
    for emp in employees:
        dept = emp["department"]
        name = emp["name"]
        if dept not in result:
            result[dept] = []
        result[dept].append(name)
    return result`;

const DEFAULT_EMPLOYEES = [
  { name: 'Alice', department: 'Engineering', salary: 95000 },
  { name: 'Bob', department: 'Marketing', salary: 72000 },
  { name: 'Charlie', department: 'Engineering', salary: 110000 },
  { name: 'Diana', department: 'Marketing', salary: 68000 },
  { name: 'Eve', department: 'Engineering', salary: 102000 },
  { name: 'Frank', department: 'Sales', salary: 85000 },
];

interface Employee { name: string; department: string; salary: number }

const groupByDepartment: VisualConfig = {
  questionId: 'py-groupdept',
  template: 'array-grouping',
  title: 'Group Names by Department',
  subtitle: 'Build a dict of lists from object data',
  category: 'python',
  thinking: {
    logic: 'Group employee names by their department.',
    decomposition: 'For each employee: get dept and name. If dept is new → create list. Append name to dept list.',
    translation: 'Dict of lists. if key not in dict → create []. .append() to add.',
    edgeCases: 'Empty list → return {}. One employee → one department with one name. Employee with department not seen before → creates new key.',
    tradeOffs: 'Dict of lists is the natural structure. Alternative: defaultdict(list) skips the "if key not in" check — cleaner but requires import. Both are O(n).',
  },
  pseudoCode: `1. Create empty dict "result"
2. For each employee:
   a. Get their department and name
   b. If department not in result → create empty list
   c. Append name to result[department]
3. Return result`,
  solutionCode: GROUP_BY_DEPT_CODE,
  inputs: [
    {
      key: 'array',
      label: 'employees',
      type: 'array',
      defaultValue: DEFAULT_EMPLOYEES,
      editable: true,
    },
  ],
  generateSteps: (inputs) => {
    const employees = inputs.array as Employee[];
    const steps: AnimStep[] = [];
    const result: Record<string, string[]> = {};
    const processed: number[] = [];

    // Display names for the array visualization
    const names = employees.map(e => e.name);

    // Step 0 — function entry
    steps.push(mkStep('start', 'Call group_by_department(employees)', {
      code: GROUP_BY_DEPT_CODE, activeLine: 0,
      array: names, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['employees'],
      employees: employees.map(e => `${e.name} (${e.department})`),
      changedVars: ['employees'],
    }));

    // Step 1 — init result
    steps.push(mkStep('init', 'Initialize empty result dict', {
      code: GROUP_BY_DEPT_CODE, activeLine: 1,
      array: names, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['employees', 'result'],
      employees: employees.map(e => `${e.name} (${e.department})`),
      result: {}, changedVars: ['result'],
    }));

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const dept = emp.department;
      const name = emp.name;

      // Extract dept and name
      steps.push(mkStep(`extract-${i}`, `emp = ${name}: dept="${dept}", name="${name}"`, {
        code: GROUP_BY_DEPT_CODE, activeLine: 3,
        array: names, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['employees', 'result', 'emp', 'dept', 'name'],
        employees: employees.map(e => `${e.name} (${e.department})`),
        result: JSON.parse(JSON.stringify(result)),
        emp: `{name: "${name}", department: "${dept}"}`,
        dept, name,
        changedVars: ['emp', 'dept', 'name'],
        annotation: `Processing employee: ${name} from ${dept}`,
      }));

      // Check if dept key exists & add
      const isNewKey = !(dept in result);
      if (isNewKey) {
        result[dept] = [];
        steps.push(mkStep(`newkey-${i}`, `"${dept}" not in result → create empty list`, {
          code: GROUP_BY_DEPT_CODE, activeLine: 5,
          array: names, currentIndex: i, processedIndices: [...processed], matchIndices: [],
          visibleVars: ['employees', 'result', 'emp', 'dept', 'name'],
          employees: employees.map(e => `${e.name} (${e.department})`),
          result: JSON.parse(JSON.stringify(result)),
          emp: `{name: "${name}", department: "${dept}"}`,
          dept, name,
          changedVars: ['result'],
          annotation: `🆕 New department key: "${dept}"`,
        }));
      }

      // Append name to dept list
      result[dept].push(name);
      processed.push(i);

      steps.push(mkStep(`append-${i}`, `result["${dept}"].append("${name}") → [${result[dept].map(n => `"${n}"`).join(', ')}]`, {
        code: GROUP_BY_DEPT_CODE, activeLine: 7,
        array: names, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['employees', 'result', 'emp', 'dept', 'name'],
        employees: employees.map(e => `${e.name} (${e.department})`),
        result: JSON.parse(JSON.stringify(result)),
        emp: `{name: "${name}", department: "${dept}"}`,
        dept, name,
        changedVars: ['result'],
        annotation: `Added "${name}" to ${dept} group`,
      }));
    }

    // Return
    steps.push(mkStep('return', `Return dict with ${Object.keys(result).length} departments`, {
      code: GROUP_BY_DEPT_CODE, activeLine: 8,
      array: names, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
      visibleVars: ['employees', 'result'],
      employees: employees.map(e => `${e.name} (${e.department})`),
      result: JSON.parse(JSON.stringify(result)),
      changedVars: [],
      annotation: `✅ Grouped ${employees.length} employees into ${Object.keys(result).length} departments`,
    }));

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 7 — Highest Paid per Department
   ═══════════════════════════════════════ */

const HIGHEST_PAID_CODE = `def highest_paid_per_dept(employees):
    top_name = {}
    top_salary = {}
    for emp in employees:
        dept = emp["department"]
        if dept not in top_salary or emp["salary"] > top_salary[dept]:
            top_name[dept] = emp["name"]
            top_salary[dept] = emp["salary"]
    return top_name`;

const highestPaidPerDept: VisualConfig = {
  questionId: 'py-highpaid',
  template: 'array-to-dict',
  title: 'Highest Paid per Department',
  subtitle: 'Two-dict tracker: compare and replace the best',
  category: 'python',
  thinking: {
    logic: 'Find the highest-paid employee name in each department.',
    decomposition: 'Track the best name AND salary per dept. For each employee: new dept → store. Higher salary → replace. Lower → skip.',
    translation: 'Two dicts (top_name, top_salary). top_salary is the gatekeeper — only CHECK it. Update both together. Return top_name.',
    edgeCases: 'Empty list → return {}. One employee → they win by default. Two employees same salary in same dept → first one seen wins (or last, depending on > vs >=).',
    tradeOffs: 'Two dicts is O(n) one-pass. Alternative: group by dept first, then max() each group — two passes, cleaner but slower. Two-dict is more efficient and shows interviewer you can optimize.',
  },
  pseudoCode: `1. Create two empty dicts: "top_name" and "top_salary"
2. For each employee:
   a. Get their department
   b. If dept not seen yet OR salary beats current best:
      - Store their name in top_name[dept]
      - Store their salary in top_salary[dept]
3. Return top_name`,
  solutionCode: HIGHEST_PAID_CODE,
  inputs: [
    {
      key: 'array',
      label: 'employees',
      type: 'array',
      defaultValue: DEFAULT_EMPLOYEES,
      editable: true,
    },
  ],
  generateSteps: (inputs) => {
    const employees = inputs.array as Employee[];
    const steps: AnimStep[] = [];
    const topName: Record<string, string> = {};
    const topSalary: Record<string, number> = {};
    const processed: number[] = [];

    const names = employees.map(e => e.name);
    const empInfo = (e: Employee) => `${e.name} (${e.department}, $${e.salary})`;

    // Step 0 — function entry
    steps.push(mkStep('start', 'Call highest_paid_per_dept(employees)', {
      code: HIGHEST_PAID_CODE, activeLine: 0,
      array: names, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['employees'],
      employees: employees.map(empInfo),
      changedVars: ['employees'],
    }));

    // Step 1 — init dicts (lines 1-2)
    steps.push(mkStep('init', 'Create two empty dicts — top_name (the answer) and top_salary (the gatekeeper)', {
      code: HIGHEST_PAID_CODE, activeLine: 2,
      array: names, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['employees', 'top_name', 'top_salary'],
      employees: employees.map(empInfo),
      top_name: {}, top_salary: {},
      changedVars: ['top_name', 'top_salary'],
      annotation: 'top_name = what we return. top_salary = what we CHECK against. Never check top_name.',
    }));

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const dept = emp.department;
      const isNew = !(dept in topSalary);
      const beatsCurrent = !isNew && emp.salary > topSalary[dept];

      // Step A — show current employee (line 4: dept = emp["department"])
      steps.push(mkStep(`loop-${i}`, `Pick up employee: ${emp.name} → dept="${dept}", salary=$${emp.salary}`, {
        code: HIGHEST_PAID_CODE, activeLine: 4,
        array: names, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['employees', 'top_name', 'top_salary', 'emp', 'dept'],
        employees: employees.map(empInfo),
        top_name: { ...topName }, top_salary: { ...topSalary },
        emp: `{name: "${emp.name}", dept: "${dept}", salary: ${emp.salary}}`,
        dept,
        changedVars: ['emp', 'dept'],
        annotation: `👀 Now processing: ${emp.name} from ${dept} earning $${emp.salary}`,
      }));

      if (isNew) {
        // Step B — CHECK: is dept in top_salary?
        steps.push(mkStep(`check-${i}`, `CHECK top_salary: is "${dept}" in there? → NO, new department`, {
          code: HIGHEST_PAID_CODE, activeLine: 5,
          array: names, currentIndex: i, processedIndices: [...processed], matchIndices: [],
          visibleVars: ['employees', 'top_name', 'top_salary', 'emp', 'dept'],
          employees: employees.map(empInfo),
          top_name: { ...topName }, top_salary: { ...topSalary },
          emp: `{name: "${emp.name}", dept: "${dept}", salary: ${emp.salary}}`,
          dept,
          changedVars: ['top_salary'],
          annotation: `🔍 CHECK top_salary for "${dept}" → not found! First time seeing this dept.`,
        }));

        // Step C — WRITE to both dicts
        topName[dept] = emp.name;
        topSalary[dept] = emp.salary;
        processed.push(i);

        steps.push(mkStep(`write-${i}`, `WRITE → top_name["${dept}"] = "${emp.name}", top_salary["${dept}"] = $${emp.salary}`, {
          code: HIGHEST_PAID_CODE, activeLine: 6,
          array: names, currentIndex: i, processedIndices: [...processed], matchIndices: [],
          visibleVars: ['employees', 'top_name', 'top_salary', 'emp', 'dept'],
          employees: employees.map(empInfo),
          top_name: { ...topName }, top_salary: { ...topSalary },
          emp: `{name: "${emp.name}", dept: "${dept}", salary: ${emp.salary}}`,
          dept,
          changedVars: ['top_name', 'top_salary'],
          annotation: `✏️ WRITE to both dicts: "${emp.name}" → top_name, $${emp.salary} → top_salary`,
        }));
      } else if (beatsCurrent) {
        const oldName = topName[dept];
        const oldSal = topSalary[dept];

        // Step B — CHECK: compare salary
        steps.push(mkStep(`check-${i}`, `CHECK top_salary["${dept}"]: $${emp.salary} vs $${oldSal} → BEATS IT!`, {
          code: HIGHEST_PAID_CODE, activeLine: 5,
          array: names, currentIndex: i, processedIndices: [...processed], matchIndices: [],
          visibleVars: ['employees', 'top_name', 'top_salary', 'emp', 'dept'],
          employees: employees.map(empInfo),
          top_name: { ...topName }, top_salary: { ...topSalary },
          emp: `{name: "${emp.name}", dept: "${dept}", salary: ${emp.salary}}`,
          dept,
          changedVars: ['top_salary'],
          annotation: `🔍 CHECK top_salary["${dept}"] = $${oldSal}. Is $${emp.salary} > $${oldSal}? YES!`,
        }));

        // Step C — WRITE: replace both
        topName[dept] = emp.name;
        topSalary[dept] = emp.salary;
        processed.push(i);

        steps.push(mkStep(`write-${i}`, `WRITE → replace "${oldName}" with "${emp.name}", $${oldSal} with $${emp.salary}`, {
          code: HIGHEST_PAID_CODE, activeLine: 6,
          array: names, currentIndex: i, processedIndices: [...processed], matchIndices: [],
          visibleVars: ['employees', 'top_name', 'top_salary', 'emp', 'dept'],
          employees: employees.map(empInfo),
          top_name: { ...topName }, top_salary: { ...topSalary },
          emp: `{name: "${emp.name}", dept: "${dept}", salary: ${emp.salary}}`,
          dept,
          changedVars: ['top_name', 'top_salary'],
          annotation: `✏️ WRITE: top_name["${dept}"] = "${emp.name}" (was "${oldName}"), top_salary = $${emp.salary} (was $${oldSal})`,
        }));
      } else {
        // Step B — CHECK: doesn't beat
        processed.push(i);

        steps.push(mkStep(`check-${i}`, `CHECK top_salary["${dept}"]: $${emp.salary} vs $${topSalary[dept]} → doesn't beat it`, {
          code: HIGHEST_PAID_CODE, activeLine: 5,
          array: names, currentIndex: i, processedIndices: [...processed], matchIndices: [],
          visibleVars: ['employees', 'top_name', 'top_salary', 'emp', 'dept'],
          employees: employees.map(empInfo),
          top_name: { ...topName }, top_salary: { ...topSalary },
          emp: `{name: "${emp.name}", dept: "${dept}", salary: ${emp.salary}}`,
          dept,
          changedVars: [],
          annotation: `🔍 CHECK top_salary["${dept}"] = $${topSalary[dept]}. Is $${emp.salary} > $${topSalary[dept]}? NO → skip. ${topName[dept]} keeps the crown.`,
        }));
      }
    }

    // Return — only top_name
    steps.push(mkStep('return', `Return top_name (we never return top_salary — it was just for comparing)`, {
      code: HIGHEST_PAID_CODE, activeLine: 7,
      array: names, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
      visibleVars: ['employees', 'top_name', 'top_salary'],
      employees: employees.map(empInfo),
      top_name: { ...topName }, top_salary: { ...topSalary },
      result: { ...topName },
      changedVars: [],
      annotation: `✅ Return top_name only: ${Object.entries(topName).map(([d, n]) => `${d}: ${n}`).join(', ')}. top_salary was just the gatekeeper.`,
    }));

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 8 — Customers Who Bought All Products
   ═══════════════════════════════════════ */

const BOUGHT_ALL_CODE = `def customers_who_bought_all(orders, products):
    required = set(products)
    bought = {}
    for order in orders:
        cust = order["customer"]
        if cust not in bought:
            bought[cust] = set()
        bought[cust].add(order["product"])
    result = []
    for cust, prods in bought.items():
        if required.issubset(prods):
            result.append(cust)
    return result`;

interface Order { customer: string; product: string; amount: number }

const DEFAULT_ORDERS: Order[] = [
  { customer: 'Alice', product: 'laptop', amount: 1200 },
  { customer: 'Bob', product: 'phone', amount: 800 },
  { customer: 'Alice', product: 'phone', amount: 800 },
  { customer: 'Charlie', product: 'laptop', amount: 1200 },
  { customer: 'Alice', product: 'tablet', amount: 450 },
  { customer: 'Bob', product: 'laptop', amount: 1200 },
  { customer: 'Charlie', product: 'phone', amount: 800 },
  { customer: 'Charlie', product: 'tablet', amount: 450 },
];

const customersWhoBoughtAll: VisualConfig = {
  questionId: 'py-boughtall',
  template: 'array-grouping',
  title: 'Customers Who Bought All',
  subtitle: 'Group into sets, then check with issubset',
  category: 'python',
  thinking: {
    logic: 'Find customers who bought EVERY product in a given list.',
    decomposition: 'Turn required products into a set. Group each customer\'s purchases into a set. Check: is required a subset of what they bought?',
    translation: 'set() for required. Dict of sets for bought. .add() to build sets. issubset() to compare. List for results.',
    edgeCases: 'Empty orders → no customers qualify. Empty products list → everyone qualifies (empty set is subset of everything). Customer bought same product twice → set handles dedup automatically.',
    tradeOffs: 'Dict of sets + issubset. Alternative: count unique matching products per customer and compare to len(products). Set approach is cleaner and handles duplicates automatically.',
  },
  pseudoCode: `1. required = set of products we're checking for
2. Create empty dict "bought" (customer → set of products)
3. For each order:
   a. Get customer name
   b. If customer not in bought → create empty set
   c. Add the product to their set
4. For each customer, check: is required a subset of what they bought?
   If yes → add to result
5. Return result`,
  solutionCode: BOUGHT_ALL_CODE,
  inputs: [
    { key: 'array', label: 'orders', type: 'array', defaultValue: DEFAULT_ORDERS, editable: true },
    { key: 'target', label: 'products', type: 'array', defaultValue: ['laptop', 'phone'], editable: true },
  ],
  generateSteps: (inputs) => {
    const orders = inputs.array as Order[];
    const products = inputs.target as string[];
    const steps: AnimStep[] = [];
    const required = new Set(products);
    const bought: Record<string, Set<string>> = {};
    const processed: number[] = [];

    const labels = orders.map(o => `${o.customer}:${o.product}`);

    // Step 0 — required = set(products)
    steps.push(mkStep('start', `required = set(${JSON.stringify(products)}) → {${[...required].join(', ')}}`, {
      code: BOUGHT_ALL_CODE, activeLine: 1,
      array: labels, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['required'],
      required: [...required],
      changedVars: ['required'],
      annotation: `Turn products list into a set: {${[...required].join(', ')}}`,
    }));

    // Step 1 — init bought
    steps.push(mkStep('init', 'Initialize empty bought dict', {
      code: BOUGHT_ALL_CODE, activeLine: 2,
      array: labels, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['required', 'bought'],
      required: [...required], bought: {},
      changedVars: ['bought'],
    }));

    // Phase 1: group products per customer
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const cust = order.customer;
      const prod = order.product;
      const isNew = !(cust in bought);

      steps.push(mkStep(`order-${i}`, `Order: ${cust} bought "${prod}"`, {
        code: BOUGHT_ALL_CODE, activeLine: 4,
        array: labels, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['required', 'bought', 'order', 'cust'],
        required: [...required],
        bought: Object.fromEntries(Object.entries(bought).map(([k, v]) => [k, [...v]])),
        order: `{${cust}, ${prod}}`,
        cust,
        changedVars: ['order', 'cust'],
        annotation: `👀 Processing order: ${cust} bought "${prod}"`,
      }));

      if (isNew) {
        bought[cust] = new Set();
      }
      bought[cust].add(prod);
      processed.push(i);

      steps.push(mkStep(`add-${i}`, `bought["${cust}"] = {${[...bought[cust]].join(', ')}}`, {
        code: BOUGHT_ALL_CODE, activeLine: 7,
        array: labels, currentIndex: i, processedIndices: [...processed], matchIndices: [],
        visibleVars: ['required', 'bought', 'order', 'cust'],
        required: [...required],
        bought: Object.fromEntries(Object.entries(bought).map(([k, v]) => [k, [...v]])),
        order: `{${cust}, ${prod}}`,
        cust,
        changedVars: ['bought'],
        annotation: isNew
          ? `🆕 New customer "${cust}" → bought["${cust}"] = {"${prod}"}`
          : `Added "${prod}" → bought["${cust}"] = {${[...bought[cust]].join(', ')}}`,
      }));
    }

    // Phase 2: check each customer
    const result: string[] = [];
    const custEntries = Object.entries(bought);

    steps.push(mkStep('phase2', 'Now check each customer against required products', {
      code: BOUGHT_ALL_CODE, activeLine: 8,
      array: labels, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
      visibleVars: ['required', 'bought', 'result'],
      required: [...required],
      bought: Object.fromEntries(custEntries.map(([k, v]) => [k, [...v]])),
      result: [],
      changedVars: ['result'],
      annotation: `Check: does each customer's set contain all of {${[...required].join(', ')}}?`,
    }));

    for (const [cust, prods] of custEntries) {
      const passes = [...required].every(p => prods.has(p));

      if (passes) {
        result.push(cust);
        steps.push(mkStep(`check-${cust}`, `${cust}: {${[...prods].join(', ')}} ⊇ {${[...required].join(', ')}} → YES!`, {
          code: BOUGHT_ALL_CODE, activeLine: 10,
          array: labels, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
          visibleVars: ['required', 'bought', 'result', 'cust', 'prods'],
          required: [...required],
          bought: Object.fromEntries(custEntries.map(([k, v]) => [k, [...v]])),
          result: [...result], cust, prods: [...prods],
          changedVars: ['result'],
          annotation: `✅ {${[...required].join(', ')}} is a subset of {${[...prods].join(', ')}} → add "${cust}"`,
        }));
      } else {
        const missing = [...required].filter(p => !prods.has(p));
        steps.push(mkStep(`check-${cust}`, `${cust}: {${[...prods].join(', ')}} — missing {${missing.join(', ')}} → NO`, {
          code: BOUGHT_ALL_CODE, activeLine: 10,
          array: labels, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
          visibleVars: ['required', 'bought', 'result', 'cust', 'prods'],
          required: [...required],
          bought: Object.fromEntries(custEntries.map(([k, v]) => [k, [...v]])),
          result: [...result], cust, prods: [...prods],
          changedVars: [],
          annotation: `❌ Missing: {${missing.join(', ')}} — "${cust}" doesn't qualify`,
        }));
      }
    }

    // Return
    steps.push(mkStep('return', `Return [${result.map(r => `"${r}"`).join(', ')}]`, {
      code: BOUGHT_ALL_CODE, activeLine: 12,
      array: labels, currentIndex: -1, processedIndices: [...processed], matchIndices: [],
      visibleVars: ['required', 'bought', 'result'],
      required: [...required],
      bought: Object.fromEntries(custEntries.map(([k, v]) => [k, [...v]])),
      result: [...result],
      changedVars: [],
      annotation: `✅ ${result.length} customers bought all of {${[...required].join(', ')}}: ${result.join(', ')}`,
    }));

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 9 — Sort Employees by Salary
   ═══════════════════════════════════════ */

const SORT_SALARY_CODE = `def sort_by_salary(employees):
    sorted_emps = sorted(employees,
        key=lambda x: x["salary"],
        reverse=True)
    return [emp["name"] for emp in sorted_emps]`;

const sortBySalary: VisualConfig = {
  questionId: 'py-sortsalary',
  template: 'array-to-dict',
  title: 'Sort Employees by Salary',
  subtitle: 'sorted() with key=lambda and list comprehension',
  category: 'python',
  thinking: {
    logic: 'Return employee names sorted by salary, highest first.',
    decomposition: 'Sort the list by a specific field (salary). Extract just the names in that order.',
    translation: 'sorted() with key=lambda x: x["salary"]. reverse=True for descending. List comprehension to extract names.',
    edgeCases: 'Empty list → return []. All same salary → original order preserved (stable sort). One employee → list with one name.',
    tradeOffs: 'sorted() returns new list (safe). .sort() modifies original (risky). Lambda is a one-line function — cleaner than defining a separate function for something used once.',
  },
  pseudoCode: `1. Sort employees by salary (highest first)
   - sorted() with key=lambda to pick the salary field
   - reverse=True for descending order
2. Extract just the names from the sorted list
   - List comprehension: [emp["name"] for emp in sorted_emps]
3. Return the list of names`,
  solutionCode: SORT_SALARY_CODE,
  inputs: [
    {
      key: 'array',
      label: 'employees',
      type: 'array',
      defaultValue: DEFAULT_EMPLOYEES,
      editable: true,
    },
  ],
  generateSteps: (inputs) => {
    const employees = inputs.array as Employee[];
    const steps: AnimStep[] = [];

    const names = employees.map(e => e.name);

    // Step 0 — show input
    steps.push(mkStep('start', 'Call sort_by_salary(employees)', {
      code: SORT_SALARY_CODE, activeLine: 0,
      array: names, currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['employees'],
      employees: employees.map(e => `${e.name} ($${e.salary})`),
      changedVars: ['employees'],
    }));

    // Step 1 — sorted with lambda
    const sorted = [...employees].sort((a, b) => b.salary - a.salary);
    steps.push(mkStep('sort', `sorted by salary descending: ${sorted.map(e => `${e.name}($${e.salary})`).join(', ')}`, {
      code: SORT_SALARY_CODE, activeLine: 1,
      array: sorted.map(e => e.name), currentIndex: -1, processedIndices: [], matchIndices: [],
      visibleVars: ['employees', 'sorted_emps'],
      employees: employees.map(e => `${e.name} ($${e.salary})`),
      sorted_emps: sorted.map(e => `${e.name} ($${e.salary})`),
      changedVars: ['sorted_emps'],
      annotation: `key=lambda x: x["salary"] tells sorted() to compare by salary. reverse=True = highest first.`,
    }));

    // Step 2 — extract names
    const result = sorted.map(e => e.name);
    steps.push(mkStep('extract', `Extract names: [${result.map(n => `"${n}"`).join(', ')}]`, {
      code: SORT_SALARY_CODE, activeLine: 4,
      array: sorted.map(e => e.name), currentIndex: -1,
      processedIndices: Array.from({ length: sorted.length }, (_, i) => i),
      matchIndices: [],
      visibleVars: ['employees', 'sorted_emps', 'result'],
      employees: employees.map(e => `${e.name} ($${e.salary})`),
      sorted_emps: sorted.map(e => `${e.name} ($${e.salary})`),
      result,
      changedVars: ['result'],
      annotation: `List comprehension: [emp["name"] for emp in sorted_emps] → pull out just the names`,
    }));

    // Return
    steps.push(mkStep('return', `Return ${result.length} names sorted by salary`, {
      code: SORT_SALARY_CODE, activeLine: 4,
      array: sorted.map(e => e.name), currentIndex: -1,
      processedIndices: Array.from({ length: sorted.length }, (_, i) => i),
      matchIndices: [],
      visibleVars: ['result'],
      result,
      changedVars: [],
      annotation: `✅ ${result.join(', ')}`,
    }));

    return steps;
  },
};

/* ═══════════════════════════════════════ */

const pythonConfigs: VisualConfig[] = [
  twoSum,
  containsDuplicate,
  validAnagram,
  groupAnagrams,
  topKFrequent,
  groupByDepartment,
  highestPaidPerDept,
  customersWhoBoughtAll,
  sortBySalary,
];

export default pythonConfigs;
