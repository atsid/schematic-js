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
    },
    
    indexOf: function (val, array) {
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (obj, fromIndex) {
                if (fromIndex == null) {
                    fromIndex = 0;
                } else if (fromIndex < 0) {
                    fromIndex = Math.max(0, this.length + fromIndex);
                }
                for (var i = fromIndex, j = this.length; i < j; i++) {
                    if (this[i] === obj)
                        return i;
                }
                return -1;
            };
        }
        return array.indexOf(val);
    }
});