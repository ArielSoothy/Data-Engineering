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

/* ═══════════════════════════════════════ */

const pythonConfigs: VisualConfig[] = [
  twoSum,
  containsDuplicate,
  validAnagram,
  groupAnagrams,
  topKFrequent,
];

export default pythonConfigs;
