module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  reporters: ['<rootDir>/dist/reporter.js']
};
