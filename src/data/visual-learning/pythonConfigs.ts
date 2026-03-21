import type { VisualConfig, AnimStep } from '../../components/visual-learning/types';

/* ─────────────── helpers ─────────────── */

function step(
  id: string,
  label: string,
  dataState: Record<string, unknown>,
  highlights: AnimStep['highlights'] = []
): AnimStep {
  return { id, label, highlights, dataState };
}

/* ═══════════════════════════════════════
   Config 1 — Two Sum (lc-1)
   ═══════════════════════════════════════ */
const twoSum: VisualConfig = {
  questionId: 'lc-1',
  template: 'array-to-dict',
  title: 'Two Sum',
  subtitle: 'Build a HashMap for O(1) lookups',
  category: 'python',
  solutionCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
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

    // Step 0 — start
    steps.push(
      step('start', 'Initialize empty dictionary seen = {}', {
        array: nums,
        currentIndex: -1,
        processedIndices: [],
        dict: {},
        computation: '',
        checkResult: '',
      })
    );

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const diff = target - num;
      const found = diff in seen;

      if (found) {
        const j = seen[diff];
        steps.push(
          step(`match-${i}`, `Match! diff=${diff} found at index ${j}`, {
            array: nums,
            currentIndex: i,
            processedIndices: [...processed],
            dict: { ...seen },
            computation: `diff = ${target} - ${num} = ${diff}`,
            checkResult: `${diff} found at index ${j}!`,
            foundMatch: true,
            matchIndices: [j, i],
            result: [j, i],
          }, [
            { elementId: `cell-${i}`, action: 'match', color: 'green-500' },
            { elementId: `cell-${j}`, action: 'match', color: 'green-500' },
          ])
        );
        return steps;
      }

      // Not found — check + add in one step
      seen[String(num)] = i;
      processed.push(i);

      steps.push(
        step(`process-${i}`, `Process nums[${i}]=${num}: diff=${diff} not in seen, add {${num}: ${i}}`, {
          array: nums,
          currentIndex: i,
          processedIndices: [...processed],
          dict: { ...seen },
          computation: `diff = ${target} - ${num} = ${diff}`,
          checkResult: `${diff} not in seen`,
        }, [
          { elementId: `cell-${i}`, action: 'highlight', color: 'blue-500' },
          { elementId: `dict-${num}`, action: 'add', color: 'amber-500' },
        ])
      );
    }

    // No match found
    steps.push(
      step('end', 'No two numbers sum to target', {
        array: nums,
        currentIndex: -1,
        processedIndices: [...processed],
        dict: { ...seen },
        computation: '',
        checkResult: 'No valid pair found',
        result: [],
      })
    );

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 2 — Contains Duplicate (lc-3)
   ═══════════════════════════════════════ */
const containsDuplicate: VisualConfig = {
  questionId: 'lc-3',
  template: 'array-to-set',
  title: 'Contains Duplicate',
  subtitle: 'Use a Set for O(1) membership checks',
  category: 'python',
  solutionCode: `def contains_duplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False`,
  inputs: [
    { key: 'array', label: 'nums', type: 'array', defaultValue: [1, 2, 3, 1], editable: true },
  ],
  generateSteps: (inputs) => {
    const nums = inputs.array as number[];
    const steps: AnimStep[] = [];
    const seen: (string | number)[] = [];
    const processed: number[] = [];

    steps.push(
      step('start', 'Initialize empty set seen = set()', {
        array: nums,
        currentIndex: -1,
        processedIndices: [],
        set: [],
        computation: '',
        checkResult: '',
      })
    );

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const found = seen.includes(num);

      if (found) {
        steps.push(
          step(`dup-${i}`, `Duplicate found! ${num} is already in seen`, {
            array: nums,
            currentIndex: i,
            processedIndices: [...processed],
            set: [...seen],
            computation: `Check: ${num} in seen?`,
            checkResult: `${num} is in seen! Return True`,
            foundMatch: true,
            matchIndices: [i],
            result: true as unknown,
          }, [
            { elementId: `cell-${i}`, action: 'match', color: 'green-500' },
          ])
        );
        return steps;
      }

      seen.push(num);
      processed.push(i);

      steps.push(
        step(`process-${i}`, `Check ${num}: not in seen, add to set`, {
          array: nums,
          currentIndex: i,
          processedIndices: [...processed],
          set: [...seen],
          computation: `Check: ${num} in seen?`,
          checkResult: `${num} not in seen. Add ${num}`,
        }, [
          { elementId: `cell-${i}`, action: 'highlight', color: 'blue-500' },
          { elementId: `set-${num}`, action: 'add', color: 'amber-500' },
        ])
      );
    }

    steps.push(
      step('end', 'No duplicates found, return False', {
        array: nums,
        currentIndex: -1,
        processedIndices: [...processed],
        set: [...seen],
        computation: '',
        checkResult: 'All elements are unique',
        result: false as unknown,
      })
    );

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 3 — Valid Anagram (lc-2)
   ═══════════════════════════════════════ */
const validAnagram: VisualConfig = {
  questionId: 'lc-2',
  template: 'array-to-dict',
  title: 'Valid Anagram',
  subtitle: 'Count character frequencies with a HashMap',
  category: 'python',
  solutionCode: `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
        if count[c] < 0:
            return False
    return True`,
  inputs: [
    { key: 'array', label: 's', type: 'string', defaultValue: 'anagram', editable: true },
    { key: 'target', label: 't', type: 'string', defaultValue: 'nagaram', editable: true },
  ],
  generateSteps: (inputs) => {
    const s = String(inputs.array);
    const t = String(inputs.target);
    const sChars = s.split('');
    const tChars = t.split('');
    const steps: AnimStep[] = [];
    const count: Record<string, number> = {};

    // Length check
    if (s.length !== t.length) {
      steps.push(
        step('len-check', `len("${s}") != len("${t}"), return False`, {
          array: sChars,
          currentIndex: -1,
          processedIndices: [],
          dict: {},
          computation: `len("${s}") = ${s.length}, len("${t}") = ${t.length}`,
          checkResult: 'Lengths differ! Return False',
          result: false as unknown,
        })
      );
      return steps;
    }

    steps.push(
      step('start', `Lengths match (${s.length}). Count chars in s`, {
        array: sChars,
        currentIndex: -1,
        processedIndices: [],
        dict: {},
        computation: `len("${s}") = len("${t}") = ${s.length}`,
        checkResult: '',
      })
    );

    // Phase 1: count chars in s
    const processedPhase1: number[] = [];
    for (let i = 0; i < sChars.length; i++) {
      const c = sChars[i];
      count[c] = (count[c] ?? 0) + 1;
      processedPhase1.push(i);

      steps.push(
        step(`count-s-${i}`, `s[${i}]='${c}': count['${c}'] = ${count[c]}`, {
          array: sChars,
          currentIndex: i,
          processedIndices: [...processedPhase1],
          dict: { ...count },
          computation: `count['${c}'] = ${count[c] - 1} + 1 = ${count[c]}`,
          checkResult: '',
        }, [
          { elementId: `cell-${i}`, action: 'highlight', color: 'blue-500' },
          { elementId: `dict-${c}`, action: 'add', color: 'amber-500', value: count[c] },
        ])
      );
    }

    // Transition step
    steps.push(
      step('phase2', 'Now subtract chars in t from counts', {
        array: tChars,
        currentIndex: -1,
        processedIndices: [],
        dict: { ...count },
        computation: 'Phase 2: decrement for each char in t',
        checkResult: '',
      })
    );

    // Phase 2: subtract chars in t
    const processedPhase2: number[] = [];
    for (let i = 0; i < tChars.length; i++) {
      const c = tChars[i];
      count[c] = (count[c] ?? 0) - 1;
      processedPhase2.push(i);

      if (count[c] < 0) {
        steps.push(
          step(`count-t-${i}`, `t[${i}]='${c}': count['${c}'] = ${count[c]} < 0! Return False`, {
            array: tChars,
            currentIndex: i,
            processedIndices: [...processedPhase2],
            dict: { ...count },
            computation: `count['${c}'] = ${count[c] + 1} - 1 = ${count[c]}`,
            checkResult: `count['${c}'] < 0, return False`,
            foundMatch: true,
            matchIndices: [i],
            result: false as unknown,
          })
        );
        return steps;
      }

      steps.push(
        step(`count-t-${i}`, `t[${i}]='${c}': count['${c}'] = ${count[c]}`, {
          array: tChars,
          currentIndex: i,
          processedIndices: [...processedPhase2],
          dict: { ...count },
          computation: `count['${c}'] = ${count[c] + 1} - 1 = ${count[c]}`,
          checkResult: `count['${c}'] >= 0, OK`,
        }, [
          { elementId: `cell-${i}`, action: 'highlight', color: 'blue-500' },
          { elementId: `dict-${c}`, action: 'highlight', color: 'amber-500', value: count[c] },
        ])
      );
    }

    steps.push(
      step('end', 'All counts are zero. Valid anagram!', {
        array: tChars,
        currentIndex: -1,
        processedIndices: [...processedPhase2],
        dict: { ...count },
        computation: '',
        checkResult: 'All counts zero. Return True',
        foundMatch: true,
        matchIndices: [],
        result: true as unknown,
      })
    );

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 4 — Group Anagrams (lc-8)
   ═══════════════════════════════════════ */
const groupAnagrams: VisualConfig = {
  questionId: 'lc-8',
  template: 'array-grouping',
  title: 'Group Anagrams',
  subtitle: 'Sort keys to group equivalent strings',
  category: 'python',
  solutionCode: `def group_anagrams(strs):
    groups = {}
    for s in strs:
        key = ''.join(sorted(s))
        if key not in groups:
            groups[key] = []
        groups[key].append(s)
    return list(groups.values())`,
  inputs: [
    {
      key: 'array',
      label: 'strs',
      type: 'array',
      defaultValue: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
      editable: true,
    },
  ],
  generateSteps: (inputs) => {
    const strs = inputs.array as string[];
    const steps: AnimStep[] = [];
    const groups: Record<string, string[]> = {};
    const processed: number[] = [];

    steps.push(
      step('start', 'Initialize empty groups dictionary', {
        array: strs,
        currentIndex: -1,
        processedIndices: [],
        groups: {},
        computation: '',
        checkResult: '',
      })
    );

    for (let i = 0; i < strs.length; i++) {
      const s = strs[i];
      const key = s.split('').sort().join('');
      const isNew = !(key in groups);

      if (isNew) {
        groups[key] = [];
      }
      groups[key].push(s);
      processed.push(i);

      const desc = isNew
        ? `"${s}" -> sorted key "${key}" (new group). Add "${s}"`
        : `"${s}" -> sorted key "${key}" (existing group). Add "${s}"`;

      steps.push(
        step(`group-${i}`, desc, {
          array: strs,
          currentIndex: i,
          processedIndices: [...processed],
          groups: JSON.parse(JSON.stringify(groups)),
          computation: `key = ''.join(sorted("${s}")) = "${key}"`,
          checkResult: isNew
            ? `New group "${key}". Append "${s}"`
            : `Group "${key}" exists. Append "${s}"`,
        }, [
          { elementId: `cell-${i}`, action: 'highlight', color: 'blue-500' },
          { elementId: `group-${key}`, action: 'add', color: 'amber-500', value: s },
        ])
      );
    }

    steps.push(
      step('end', `Done! ${Object.keys(groups).length} groups formed`, {
        array: strs,
        currentIndex: -1,
        processedIndices: [...processed],
        groups: JSON.parse(JSON.stringify(groups)),
        computation: '',
        checkResult: `Return ${Object.keys(groups).length} groups`,
        result: Object.values(groups) as unknown,
      })
    );

    return steps;
  },
};

/* ═══════════════════════════════════════
   Config 5 — Top K Frequent Elements (lc-23)
   ═══════════════════════════════════════ */
const topKFrequent: VisualConfig = {
  questionId: 'lc-23',
  template: 'array-to-dict',
  title: 'Top K Frequent Elements',
  subtitle: 'Count frequencies, then sort',
  category: 'python',
  solutionCode: `def top_k_frequent(nums, k):
    count = {}
    for num in nums:
        count[num] = count.get(num, 0) + 1
    sorted_items = sorted(count.keys(),
        key=lambda x: count[x], reverse=True)
    return sorted_items[:k]`,
  inputs: [
    { key: 'array', label: 'nums', type: 'array', defaultValue: [1, 1, 1, 2, 2, 3], editable: true },
    { key: 'target', label: 'k', type: 'number', defaultValue: 2, editable: true },
  ],
  generateSteps: (inputs) => {
    const nums = inputs.array as number[];
    const k = inputs.target as number;
    const steps: AnimStep[] = [];
    const count: Record<string, number> = {};
    const processed: number[] = [];

    steps.push(
      step('start', 'Phase 1: Count frequencies', {
        array: nums,
        currentIndex: -1,
        processedIndices: [],
        dict: {},
        computation: 'count = {}',
        checkResult: '',
      })
    );

    // Phase 1: count frequencies
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const key = String(num);
      count[key] = (count[key] ?? 0) + 1;
      processed.push(i);

      steps.push(
        step(`count-${i}`, `nums[${i}]=${num}: count[${num}] = ${count[key]}`, {
          array: nums,
          currentIndex: i,
          processedIndices: [...processed],
          dict: { ...count },
          computation: `count[${num}] = ${count[key] - 1 || 0} + 1 = ${count[key]}`,
          checkResult: '',
        }, [
          { elementId: `cell-${i}`, action: 'highlight', color: 'blue-500' },
          { elementId: `dict-${num}`, action: 'add', color: 'amber-500', value: count[key] },
        ])
      );
    }

    // Phase 2: sort and pick top k
    const sorted = Object.entries(count)
      .sort((a, b) => b[1] - a[1]);
    const topK = sorted.slice(0, k).map(([key]) => Number(key));

    steps.push(
      step('sort', `Phase 2: Sort by frequency, pick top ${k}`, {
        array: nums,
        currentIndex: -1,
        processedIndices: [...processed],
        dict: { ...count },
        computation: `Sorted: ${sorted.map(([key, val]) => `${key}(${val})`).join(', ')}`,
        checkResult: `Top ${k}: [${topK.join(', ')}]`,
        foundMatch: true,
        matchIndices: [],
        result: topK as unknown,
      }, sorted.slice(0, k).map(([key]) => ({
        elementId: `dict-${key}`,
        action: 'match' as const,
        color: 'green-500',
      })))
    );

    return steps;
  },
};

/* ═══════════════ Export ═══════════════ */

const pythonConfigs: VisualConfig[] = [
  twoSum,
  containsDuplicate,
  validAnagram,
  groupAnagrams,
  topKFrequent,
];

export default pythonConfigs;
