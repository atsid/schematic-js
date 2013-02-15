var profile = (function () {
    var copyOnly = function (filename, mid) {
            var list = {
                "schematic-js/schematic.profile": true,
                "schematic-js/package.json": true
            };
            return list.hasOwnProperty(mid);
        };
 
    return {
        resourceTags: {
            copyOnly: function (filename, mid) {
                return copyOnly(filename, mid);
            }
        }
    };
}());