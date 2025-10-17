module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000, // 30s timeout pour tests E2E
  reporters: [
    'default', // console
    ['jest-html-reporter', {
      pageTitle: 'BloodLink Test Report',
      outputPath: './reports/test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true,
    }],
    ['jest-junit', {
      outputDirectory: './reports',
      outputName: 'junit-report.xml',
    }]
  ],
};
