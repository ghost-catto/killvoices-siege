define(function() {

'use strict';

var w = window,
	d = document,
	raf = w.requestAnimationFrame || w.setImmediate || function(c) { return setTimeout(c, 0); };

function initEl(el) {
	if (el.hasOwnProperty('data-simple-scrollbar')) return;
	Object.defineProperty(el, 'data-simple-scrollbar', new SimpleScrollbar(el));
}

// Mouse drag handler
function dragDealer(el, context) {
	var lastPageY;

	el.addEventListener('mousedown', function(e) {
		lastPageY = e.pageY;
		el.classList.add('ss-grabbed');
		d.body.classList.add('ss-grabbed');

		d.addEventListener('mousemove', drag);
		d.addEventListener('mouseup', stop);

		return false;
	});

	function drag(e) {
		var delta = e.pageY - lastPageY;
		lastPageY = e.pageY;

		raf(function() {
			context.el.scrollTop += delta / context.scrollRatio;
		});
	}

	function stop() {
		el.classList.remove('ss-grabbed');
		d.body.classList.remove('ss-grabbed');
		d.removeEventListener('mousemove', drag);
		d.removeEventListener('mouseup', stop);
	}
}

// Constructor
function SimpleScrollbar(el) {
	this.target = el;

	this.direction = window.getComputedStyle(this.target).direction;

	this.bar = '<div class="ss-scroll">';

	this.el = d.createElement('div');
	this.el.setAttribute('class', 'ss-content');

	while (this.target.firstChild) {
		this.el.appendChild(this.target.firstChild);
	}

	this.target.appendChild(this.el);

	this.target.insertAdjacentHTML('beforeend', this.bar);
	this.bar = this.target.lastChild;

	dragDealer(this.bar, this);
	this.moveBar();

	this.el.addEventListener('scroll', this.moveBar.bind(this));
	this.el.addEventListener('mouseenter', this.moveBar.bind(this));

	this.target.classList.add('ss-container');

	var css = window.getComputedStyle(el);
	if (css['height'] === '0px' && css['max-height'] !== '0px') {
		el.style.height = css['max-height'];
	}
}

SimpleScrollbar.prototype = {
	moveBar: function(e) {
		var totalHeight = this.el.scrollHeight,
			ownHeight = this.el.clientHeight,
			_this = this;

		this.scrollRatio = ownHeight / totalHeight;

		raf(function() {
			// Hide scrollbar if no scrolling is possible
			if(_this.scrollRatio >= 1) {
				_this.bar.classList.add('ss-hidden');
			} else {
				_this.bar.classList.remove('ss-hidden');
				_this.bar.style.cssText = 'height:' + Math.max(_this.scrollRatio * 100, 10) + '%; top:' + (_this.el.scrollTop / totalHeight ) * 100 + '%;';
			}
		});
	}
}

function initAll() {
	var nodes = d.querySelectorAll('*[ss-container]');

	for (var i = 0; i < nodes.length; i++) {
		initEl(nodes[i]);
	}
}

d.addEventListener('DOMContentLoaded', initAll);
SimpleScrollbar.initEl = initEl;
SimpleScrollbar.initAll = initAll;

return SimpleScrollbar;
});
