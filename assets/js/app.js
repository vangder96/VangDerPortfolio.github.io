/*
	Der Vang — portfolio interactions (vanilla, no dependencies)
	Nav toggle · scroll-spy · header shrink · scroll reveal · impact counters
	· publication filters · gallery lightbox · button ripple
*/
(function () {
	'use strict';

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	document.addEventListener('DOMContentLoaded', function () {

		/* ── Mobile nav toggle ─────────────────────────────── */
		var toggle = document.querySelector('.nav-toggle');
		var navLinks = document.querySelector('.nav-links');
		if (toggle && navLinks) {
			toggle.addEventListener('click', function () {
				var open = navLinks.classList.toggle('open');
				toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
			navLinks.querySelectorAll('a').forEach(function (a) {
				a.addEventListener('click', function () {
					navLinks.classList.remove('open');
					toggle.setAttribute('aria-expanded', 'false');
				});
			});
		}

		/* ── Header shrink on scroll ───────────────────────── */
		var header = document.querySelector('.site-header');
		function onScroll() {
			if (header) header.classList.toggle('scrolled', window.scrollY > 40);
		}
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });

		/* ── Scroll-spy active nav link ────────────────────── */
		var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
		var linkFor = {};
		document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
			linkFor[a.getAttribute('href').slice(1)] = a;
		});
		if ('IntersectionObserver' in window && sections.length) {
			var spy = new IntersectionObserver(function (entries) {
				entries.forEach(function (e) {
					if (e.isIntersecting) {
						var id = e.target.id;
						Object.keys(linkFor).forEach(function (k) {
							linkFor[k].classList.toggle('active', k === id);
						});
					}
				});
			}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
			sections.forEach(function (s) { spy.observe(s); });
		}

		/* ── Scroll reveal ─────────────────────────────────── */
		var reveals = document.querySelectorAll('.reveal');
		if (reduceMotion || !('IntersectionObserver' in window)) {
			reveals.forEach(function (el) { el.classList.add('is-visible'); });
		} else {
			var revObs = new IntersectionObserver(function (entries, obs) {
				entries.forEach(function (e) {
					if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
				});
			}, { threshold: 0.12 });
			reveals.forEach(function (el) { revObs.observe(el); });
		}

		/* ── Collapsible paper abstracts ───────────────────── */
		document.querySelectorAll('.paper-abstract').forEach(function (abs) {
			var toggle = abs.parentElement.querySelector('.abstract-toggle');
			if (!toggle) return;
			// If the abstract fits within the collapsed height, no toggle is needed.
			if (abs.scrollHeight <= abs.clientHeight + 4) {
				toggle.hidden = true;
				abs.style.maxHeight = 'none';
				return;
			}
			toggle.addEventListener('click', function () {
				var expanded = abs.classList.toggle('expanded');
				toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
				toggle.querySelector('.abstract-label').textContent = expanded ? 'Show less' : 'Read summary';
			});
		});

		/* ── Copy email ────────────────────────────────────── */
		document.querySelectorAll('.btn-copy').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var value = btn.getAttribute('data-copy');
				var done = function () {
					var label = btn.querySelector('.copy-label');
					btn.classList.add('copied');
					if (label) label.textContent = 'Copied';
					setTimeout(function () {
						btn.classList.remove('copied');
						if (label) label.textContent = 'Copy';
					}, 1800);
				};
				if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(value).then(done, done);
				} else {
					var t = document.createElement('textarea');
					t.value = value; document.body.appendChild(t); t.select();
					try { document.execCommand('copy'); } catch (e) {}
					document.body.removeChild(t); done();
				}
			});
		});

		/* ── Impact counters ───────────────────────────────── */
		function animateCount(el) {
			var target = parseInt(el.getAttribute('data-to'), 10) || 0;
			var suffix = el.getAttribute('data-suffix') || '';
			if (reduceMotion) { el.textContent = target + suffix; return; }
			var start = null, dur = 1300;
			function step(ts) {
				if (!start) start = ts;
				var p = Math.min((ts - start) / dur, 1);
				var eased = 1 - Math.pow(1 - p, 3);
				el.textContent = Math.round(eased * target) + (p === 1 ? suffix : '');
				if (p < 1) requestAnimationFrame(step);
			}
			requestAnimationFrame(step);
		}
		var counters = document.querySelectorAll('[data-to]');
		if ('IntersectionObserver' in window && counters.length) {
			var cObs = new IntersectionObserver(function (entries, obs) {
				entries.forEach(function (e) {
					if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); }
				});
			}, { threshold: 0.6 });
			counters.forEach(function (c) { cObs.observe(c); });
		} else {
			counters.forEach(function (c) { c.textContent = (c.getAttribute('data-to') || '') + (c.getAttribute('data-suffix') || ''); });
		}

		/* ── Publication theme filters ─────────────────────── */
		var pills = document.querySelectorAll('.filter-pill');
		var papers = document.querySelectorAll('.paper');
		pills.forEach(function (pill) {
			pill.addEventListener('click', function () {
				pills.forEach(function (p) { p.classList.remove('active'); });
				pill.classList.add('active');
				var f = pill.getAttribute('data-filter');
				papers.forEach(function (paper) {
					var themes = paper.getAttribute('data-themes') || '';
					var show = (f === 'all') || themes.split(' ').indexOf(f) > -1;
					paper.hidden = !show;
				});
			});
		});

		/* ── Gallery lightbox ──────────────────────────────── */
		var lightbox = document.querySelector('.lightbox');
		if (lightbox) {
			var lbImg = lightbox.querySelector('img');
			var lbClose = lightbox.querySelector('.lightbox-close');
			function openLb(src, alt) { lbImg.src = src; lbImg.alt = alt || ''; lightbox.classList.add('open'); }
			function closeLb() { lightbox.classList.remove('open'); }
			document.querySelectorAll('.photo img').forEach(function (img) {
				img.parentElement.addEventListener('click', function () { openLb(img.src, img.alt); });
			});
			lbClose.addEventListener('click', closeLb);
			lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
			document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
		}

		/* ── Contact form (sends email via FormSubmit) ─────── */
		var form = document.getElementById('contact-form');
		if (form) {
			var status = form.querySelector('.form-status');
			var submitBtn = form.querySelector('.form-submit');
			form.addEventListener('submit', function (e) {
				e.preventDefault();
				if (form.querySelector('[name="_honey"]').value) return; // bot trap
				status.className = 'form-status';
				status.textContent = 'Sending…';
				submitBtn.disabled = true;
				var payload = {
					name: form.name.value,
					email: form.email.value,
					message: form.message.value,
					_subject: 'New message from your portfolio site'
				};
				fetch(form.action, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
					body: JSON.stringify(payload)
				}).then(function (r) { return r.json().catch(function () { return {}; }); })
				.then(function (data) {
					var ok = data && (data.success === true || data.success === 'true');
					if (ok) {
						status.className = 'form-status success';
						status.textContent = 'Thanks — your message is on its way to Der.';
						form.reset();
					} else {
						status.className = 'form-status error';
						status.textContent = (data && data.message) ? data.message : 'Something went wrong. Please email directly instead.';
					}
				}).catch(function () {
					status.className = 'form-status error';
					status.textContent = 'Could not send right now. Please email directly instead.';
				}).then(function () { submitBtn.disabled = false; });
			});
		}

		/* ── Button ripple ─────────────────────────────────── */
		document.querySelectorAll('.btn').forEach(function (btn) {
			btn.addEventListener('click', function (e) {
				if (reduceMotion) return;
				var rect = this.getBoundingClientRect();
				var size = Math.max(rect.width, rect.height);
				var ripple = document.createElement('span');
				ripple.className = 'ripple';
				ripple.style.width = ripple.style.height = size + 'px';
				ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
				ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
				this.appendChild(ripple);
				ripple.addEventListener('animationend', function () { ripple.remove(); });
			});
		});
	});
})();
