define([
], function (
) {
    return function() {

        //similar to dojox.json.ref.resolveJson, but doesn't get hung up on circular references

        this.resolveRefs = function (subobj, parent, parentKey) {
            if (!(subobj.tag && subobj.tag.resolved)) {
                Object.keys(subobj).forEach(function (value, key, obj) {
                    if (key === "$ref") {
                        require([value], function (Obj) {
                            value = Obj;
                        });
                        if (value && !value.resolved) {
                            value.resolved = true;
                            this.resolveRefs(value, obj, key);
                        }
                        parent[parentKey] = value;
                    } else if (typeof value === "object") {
                        this.resolveRefs(value, obj, key);
                    }

                }, this);
            }
        }
    };
});
