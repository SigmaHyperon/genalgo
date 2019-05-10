const fn = (func) => {
    function papply(fn, ...args){
        const [first, ...rest] = args;
        return (typeof fn == 'function' && typeof first != 'undefined') ? papply(fn(first), ...rest) : fn;
    }
    return (...args) => papply(func, ...args);
}
const compose = (...fns) => x => fns.reduce((v, f) => f(v), x);
if(typeof module != 'undefined') module.exports = {fn, compose};