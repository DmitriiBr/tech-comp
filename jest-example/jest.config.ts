export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jest-fixed-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                useESM: true,
                isolatedModules: true,
                tsconfig: 'tsconfig.app.json',
            },
        ],
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(test).+(ts|tsx|js)'],
}
