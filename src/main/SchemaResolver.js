/**
 * @class SchemaResolver
 * Class exposing a method to resolve schema references to schema objects in a
 * schema.
 */
define([
], function (
) {
    return function(resolvers) {

        /**
         * Given the passed subobject walk its properties looking for $refs and
         * replace them with the loaded schema.
         * @param subobj - object to walk
         * @param parent - parent of object if the $ref needs to be replaced.
         * @param parentKey - key to replace $ref, if found.
         */
        this.resolveRefs = function (subobj, parent, parentKey) {
            if (!(subobj.tag && subobj.tag.resolved)) {
                Object.keys(subobj).forEach(function (key, idx, obj) {
                    var val = subobj[key], value;
                    if (key === "$ref") {
                        resolvers.some(function (res) {
                            value = res(val);
                            return value;
                        });
                        if (value && value.tag && !value.tag.resolved) {
                            value.resolved = true;
                            this.resolveRefs(value, subobj, key);
                        }
                        parent[parentKey] = value;
                    } else if (typeof val === "object") {
                        this.resolveRefs(val, subobj, key);
                    }

                }, this);
            }
        }
    };
});
