/**
 * This file contains prototype extensions for default javascript handlers
 */

/**
 * Array unique for javascript array.
 *
 * @type    {Array.prototype.unique}
 *
 * @returns {array}
 */
Array.prototype.unique = function(a) {
    return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
});

/**
 * Simple new line (\n) convert to <br /> html tags.
 *
 * @returns {string}
 */
String.prototype.nl2br = function() {
    return this.replace(/\n/g, "<br />");
};

/**
 * Simple <br /> convert to nt new line (\n)
 *
 * @returns {string}
 */
String.prototype.br2nl = function() {
    return this.replace(/<br\s*[\/]?>/gi, "\n");
};

/**
 * Simple string truncate helper.
 *
 * @param   {number}    length
 * @param   {boolean}   useWordBoundary
 *
 * @returns {string}
 */
String.prototype.truncate = function(length, useWordBoundary) {
    var toLong = this.length > length,
    s_ = toLong ? this.substr(0, length - 1) : this;
    s_ = useWordBoundary && toLong ? s_.substr(0, s_.lastIndexOf(' ')) : s_;

    return toLong ? s_ + '&hellip;' : s_;
};

/**
 * Simple strip tags helper.
 *
 * @returns {string}
 */
String.prototype.stripTags = function() {
    var div = document.createElement("div");

    div.innerHTML = this.br2nl();

    return div.textContent || div.innerText || "";
};