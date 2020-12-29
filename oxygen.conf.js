module.exports = {
    
    suites: [{
        name: 'E2E',
        cases: [
            { path: '/src/00. Sanity.js' },
            { path: '/src/' },
        ]
    }],

    modules: ['web', 'log', 'assert', 'db', 'email'],

    reporting: {
        reporters: ['html', 'json']
    },

}