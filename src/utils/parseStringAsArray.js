module.exports = function parrseStringAsArray(arrayAsString) {
    return arrayAsString.split(',').map(tech => tech.trim());
}