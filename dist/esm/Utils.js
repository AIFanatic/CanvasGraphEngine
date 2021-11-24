var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.isPointInsideRect = function (position, size, point) {
        return (point.x > position.x && point.x < position.x + size.w && point.y > position.y && point.y < position.y + size.h);
    };
    Utils.isPointInsideCircle = function (point, center, radius) {
        return Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2) <= radius * radius;
    };
    Utils.pointsDistance = function (p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };
    Utils.pointsMidPoint = function (p1, p2) {
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    };
    Utils.lerp = function (a, b, t) {
        // return (1 - t) * a + t * b;
        // return a + (b - a) * t;
        return a * (1 - t) + b * t;
    };
    Utils.scaleCanvas = function (canvas, context, width, height) {
        // assume the device pixel ratio is 1 if the browser doesn't specify it
        var devicePixelRatio = window.devicePixelRatio || 1;
        // determine the 'backing store ratio' of the canvas context
        var backingStoreRatio = (context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1);
        // determine the actual ratio we want to draw at
        var ratio = devicePixelRatio / backingStoreRatio;
        if (devicePixelRatio !== backingStoreRatio) {
            // set the 'real' canvas size to the higher width/height
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            // ...then scale it back down with CSS
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }
        else {
            // this is a normal 1:1 device; just scale it simply
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = '';
            canvas.style.height = '';
        }
        // scale the drawing context so everything will work at the higher ratio
        context.scale(ratio, ratio);
        return ratio;
    };
    Utils.uuid = function () {
        return 'xxxxxxxx'.replace(/[x]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    return Utils;
}());
export { Utils };
//# sourceMappingURL=Utils.js.map