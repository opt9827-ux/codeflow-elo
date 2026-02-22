export type SupportedLanguage = 'java' | 'python' | 'cpp' | 'javascript';

export function getLanguageBoilerplate(language: SupportedLanguage, functionName: string = 'solve'): string {
    switch (language) {
        case 'java':
            return `class Solution {\n    public int ${functionName}(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`;
        case 'python':
            return `class Solution:\n    def ${functionName}(self, nums: List[int]) -> int:\n        # Write your code here\n        pass`;
        case 'cpp':
            return `class Solution {\npublic:\n    int ${functionName}(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};`;
        case 'javascript':
            return `/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction ${functionName}(nums) {\n    // Write your code here\n    return 0;\n}`;
        default:
            return '';
    }
}

export const LANGUAGE_MODES: Record<SupportedLanguage, string> = {
    java: 'java',
    python: 'python',
    cpp: 'cpp',
    javascript: 'javascript'
};
