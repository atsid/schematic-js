define([
], function (
) {
    return function(resolvers) {

        //similar to dojox.json.ref.resolveJson, but doesn't get hung up on circular references

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
