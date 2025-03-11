const overrideConsole = () => {
    if (process.env.NODE_ENV === 'production') {
        console.log = () => { };
    }
};

module.exports = overrideConsole;
