((root, factory) => 
{
	if (typeof define === 'function' && define.amd) 
		define([], (() => { return factory(root); }));
	else if (typeof exports === 'object')
		module.exports = factory(root);
	else 
		root.SmoothScroll = factory(root);
})

(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, ((window) => 
{
	'use strict';

	const defaults = 
	{
		ignore: '[data-scroll-ignore]',
		header: null,
		topOnEmptyHash: true,

		speed: 750,
		speedAsDuration: false,
		durationMax: null,
		durationMin: null,
		clip: true,
		offset: 50,

		easing: 'easeInOutCubic',
		customEasing: null,

		updateURL: true,
		popstate: true,

		emitEvents: true

	};

	const supports = () => 
	{
		return 'querySelector' in document && 'addEventListener' in window && 'requestAnimationFrame' in window && 'closest' in window.Element.prototype;
	}

	const extend = function () {
		var merged = {};
		Array.prototype.forEach.call(arguments, (function (obj) {
			for (var key in obj) {
				if (!obj.hasOwnProperty(key)) return;
				merged[key] = obj[key];
			}
		}));
		return merged;
	};

	const reduceMotion = function () {
		if ('matchMedia' in window && window.matchMedia('(prefers-reduced-motion)').matches) {
			return true;
		}
		return false;
	};

	const getHeight = (elem) => 
	{
		return parseInt(window.getComputedStyle(elem).height, 10);
	};

	const escapeCharacters = (id) => {

		if (id.charAt(0) === '#') {
			id = id.substr(1);
		}

		let string = String(id);
		let length = string.length;
		let index = -1;
		let codeUnit;
		let result = '';
		let firstCodeUnit = string.charCodeAt(0);

		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			if (codeUnit === 0x0000)
				throw new InvalidCharacterError('Invalid character: the input contains U+0000.');

			if ((codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F || (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) || (index === 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit === 0x002D)) 
			{
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}
			if (codeUnit >= 0x0080 || codeUnit === 0x002D || codeUnit === 0x005F || codeUnit >= 0x0030 && codeUnit <= 0x0039 || codeUnit >= 0x0041 && codeUnit <= 0x005A || codeUnit >= 0x0061 && codeUnit <= 0x007A) 
			{
				result += string.charAt(index);
				continue;
			}

			result += '\\' + string.charAt(index);

		}

		return '#' + result;
	};

	const easingPattern = (settings, time) =>
	{
		let pattern;

		if (settings.easing === 'easeInQuad') pattern = time * time; 
		if (settings.easing === 'easeOutQuad') pattern = time * (2 - time); 
		if (settings.easing === 'easeInOutQuad') pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; 
		if (settings.easing === 'easeInCubic') pattern = time * time * time; 
		if (settings.easing === 'easeOutCubic') pattern = (--time) * time * time + 1; 
		if (settings.easing === 'easeInOutCubic') pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1;
		if (settings.easing === 'easeInQuart') pattern = time * time * time * time; 
		if (settings.easing === 'easeOutQuart') pattern = 1 - (--time) * time * time * time; 
		if (settings.easing === 'easeInOutQuart') pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; 
		if (settings.easing === 'easeInQuint') pattern = time * time * time * time * time; 
		if (settings.easing === 'easeOutQuint') pattern = 1 + (--time) * time * time * time * time;
		if (settings.easing === 'easeInOutQuint') pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; 

		if (!!settings.customEasing) pattern = settings.customEasing(time);

		return pattern || time; 
	};

	const getDocumentHeight = () => 
	{
		return Math.max
		(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
	};

	const getEndLocation = (anchor, headerHeight, offset, clip) =>
	{
		let location = 0;

		if (anchor.offsetParent) {
			do {
				location += anchor.offsetTop;
				anchor = anchor.offsetParent;
			} while (anchor);
		}
		location = Math.max(location - headerHeight - offset, 0);
		if (clip) {
			location = Math.min(location, getDocumentHeight() - window.innerHeight);
		}
 		return location;
	};

	const getHeaderHeight = (header) => 
	{
		return !header ? 0 : (getHeight(header) + header.offsetTop);
	};

	const getSpeed = (distance, settings) => {
		let speed = settings.speedAsDuration ? settings.speed : Math.abs(distance / 1000 * settings.speed);
		if (settings.durationMax && speed > settings.durationMax) return settings.durationMax;
		if (settings.durationMin && speed < settings.durationMin) return settings.durationMin;
		return parseInt(speed, 10);
	};

	const setHistory = (options) =>
	{
		if (!history.replaceState || !options.updateURL || history.state) return;

		let hash = window.location.hash;
		hash = hash ? hash : '';

		history.replaceState
		(
			{
				smoothScroll: JSON.stringify(options),
				anchor: hash ? hash : window.pageYOffset
			},
			document.title,
			hash ? hash : window.location.href
		);
	};

	const updateURL = (anchor, isNum, options) => {
		if (isNum) return;

		if (!history.pushState || !options.updateURL) return;

		history.pushState
		(
			{
				smoothScroll: JSON.stringify(options),
				anchor: anchor.id
			},
			document.title,
			anchor === document.documentElement ? '#top' : '#' + anchor.id
		);

	};

	const adjustFocus = (anchor, endLocation, isNum) =>
	{
		if (anchor === 0) {
			document.body.focus();
		}

		if (isNum) return;

		anchor.focus();
		
		if (document.activeElement !== anchor) 
		{
			anchor.setAttribute('tabindex', '-1');
			anchor.focus();
			anchor.style.outline = 'none';
		}

		window.scrollTo(0 , endLocation);
	};

	let emitEvent = (type, options, anchor, toggle) =>
	{
		if (!options.emitEvents || typeof window.CustomEvent !== 'function') return;
		let event = new CustomEvent(type, {
			bubbles: true,
			detail: {
				anchor: anchor,
				toggle: toggle
			}
		});
		document.dispatchEvent(event);
	};

	const SmoothScroll = function (selector, options) 
	{
		let smoothScroll = {}; 
		let settings, toggle, fixedHeader, animationInterval;

		smoothScroll.cancelScroll = (noEvent) =>
		{
			cancelAnimationFrame(animationInterval);
			animationInterval = null;

			if (noEvent) 
				return;

			emitEvent('scrollCancel', settings);
		};

		smoothScroll.animateScroll = (anchor, toggle, options) =>
		{
			smoothScroll.cancelScroll();

			let _settings = extend(settings || defaults, options || {}); 

			let isNum = Object.prototype.toString.call(anchor) === '[object Number]' ? true : false;
			let anchorElem = isNum || !anchor.tagName ? null : anchor;
			if (!isNum && !anchorElem) return;
			let startLocation = window.pageYOffset; 
			if (_settings.header && !fixedHeader) 
			{
				fixedHeader = document.querySelector(_settings.header);
			}
			let headerHeight = getHeaderHeight(fixedHeader);
			let endLocation = isNum ? anchor : getEndLocation(anchorElem, headerHeight, parseInt((typeof _settings.offset === 'function' ? _settings.offset(anchor, toggle) : _settings.offset), 10), _settings.clip); // Location to scroll to
			let distance = endLocation - startLocation; 
			let documentHeight = getDocumentHeight();
			let timeLapsed = 0;
			let speed = getSpeed(distance, _settings);
			let start, percentage, position;

			let stopAnimateScroll = (position, endLocation) =>
			{
				let currentLocation = window.pageYOffset;

				if (position == endLocation || currentLocation == endLocation || ((startLocation < endLocation && window.innerHeight + currentLocation) >= documentHeight)) 
				{
					smoothScroll.cancelScroll(true);

					adjustFocus(anchor, endLocation, isNum);

					emitEvent('scrollStop', _settings, anchor, toggle);

					start = null;
					animationInterval = null;

					return true;
				}
			};

			const loopAnimateScroll = (timestamp) => 
			{
				if (!start) 
					start = timestamp; 

				timeLapsed += timestamp - start;
				percentage = speed === 0 ? 0 : (timeLapsed / speed);
				percentage = (percentage > 1) ? 1 : percentage;
				position = startLocation + (distance * easingPattern(_settings, percentage));
				window.scrollTo(0, Math.floor(position));

				if (!stopAnimateScroll(position, endLocation)) 
				{
					animationInterval = window.requestAnimationFrame(loopAnimateScroll);
					start = timestamp;
				}
			};

			if (window.pageYOffset === 0) 
			{
				window.scrollTo(0, 0);
			}

			updateURL(anchor, isNum, _settings);

			if (reduceMotion()) 
			{
				window.scrollTo(0, Math.floor(endLocation));
				return;
			}

			emitEvent('scrollStart', _settings, anchor, toggle);

			smoothScroll.cancelScroll(true);
			window.requestAnimationFrame(loopAnimateScroll);

		};

		const clickHandler = (event) =>
		{
			if (event.defaultPrevented) return;

			if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;

			if (!('closest' in event.target)) return;

			toggle = event.target.closest(selector);
			if (!toggle || toggle.tagName.toLowerCase() !== 'a' || event.target.closest(settings.ignore)) return;

			if (toggle.hostname !== window.location.hostname || toggle.pathname !== window.location.pathname || !/#/.test(toggle.href)) return;

			let hash;
			try {
				hash = escapeCharacters(decodeURIComponent(toggle.hash));
			} catch(e) {
				hash = escapeCharacters(toggle.hash);
			}

			let anchor;
			if (hash === '#') {
				if (!settings.topOnEmptyHash) return;
				anchor = document.documentElement;
			} else {
				anchor = document.querySelector(hash);
			}
			anchor = !anchor && hash === '#top' ? document.documentElement : anchor;

 			if (!anchor) return;
			event.preventDefault();
			setHistory(settings);
			smoothScroll.animateScroll(anchor, toggle);
		};

		const popstateHandler = () =>
		{
			if (history.state === null) return;

			if (!history.state.smoothScroll || history.state.smoothScroll !== JSON.stringify(settings)) return;

			let anchor = history.state.anchor;

			if (typeof anchor === 'string' && anchor) {
				anchor = document.querySelector(escapeCharacters(history.state.anchor));
				if (!anchor) return;
			}

			smoothScroll.animateScroll(anchor, null, {updateURL: false});
		};

		smoothScroll.destroy = () =>
		{
			if (!settings) return;

			document.removeEventListener('click', clickHandler, false);
			window.removeEventListener('popstate', popstateHandler, false);

			smoothScroll.cancelScroll();

			settings = null;
			anchor = null;
			toggle = null;
			fixedHeader = null;
			eventTimeout = null;
			animationInterval = null;

		};

		const init = ()  =>
		{
			if (!supports()) throw 'Smooth Scroll: This browser does not support the required JavaScript methods and browser APIs.';

			smoothScroll.destroy();

			settings = extend(defaults, options || {}); 
			fixedHeader = settings.header ? document.querySelector(settings.header) : null; 

			document.addEventListener('click', clickHandler, false);

			if (settings.updateURL && settings.popstate) 
				window.addEventListener('popstate', popstateHandler, false);
		};

		init();

		return smoothScroll;

	};

	return SmoothScroll;
}));