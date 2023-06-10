/**
 * Created by ruben on 12/12/14.
 */

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

function toRadians(angle) {
    return angle / (180 / Math.PI);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRotatedVector(vector, degrees) {
    var x = vector[0];
    var y = vector[1];
    var radians = toRadians(degrees);
    return [
        x * Math.cos(radians) - y * Math.sin(radians),
        x * Math.sin(radians) + y * Math.cos(radians)
    ]
}

function getRandomlyRotatedVector(vector) {
    var degrees = getRandomInt(0,360);
    return getRotatedVector(vector, degrees);
}