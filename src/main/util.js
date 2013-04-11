/**
 * Utility methods not guaranteed to be available.
 */
define({
    /**
     * Simple dojo.mixin replacement.
     */
    mixin: function (target, source) {
        var name;
        for (name in source) {
            target[name] = source[name];
        }
        return target;
    }
});