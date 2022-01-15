
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let state = writable("menu");

    function trocarStateDoJogo(newState) {
    	state.set(newState);
    }

    /* src/VoltarMenu.svelte generated by Svelte v3.46.0 */
    const file$7 = "src/VoltarMenu.svelte";

    function create_fragment$8(ctx) {
    	let button;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			div = element("div");
    			div.textContent = "Voltar para o menu";
    			attr_dev(div, "class", "menu");
    			add_location(div, file$7, 33, 1, 655);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-e03egl");
    			add_location(button, file$7, 32, 0, 631);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, div);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('VoltarMenu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<VoltarMenu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => trocarStateDoJogo("menu");
    	$$self.$capture_state = () => ({ trocarStateDoJogo });
    	return [click_handler];
    }

    class VoltarMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VoltarMenu",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/JogarA.svelte generated by Svelte v3.46.0 */
    const file$6 = "src/JogarA.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (131:3) {#each linha as dado, j}
    function create_each_block_1$2(ctx) {
    	let td;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*i*/ ctx[15], /*j*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*dado*/ ctx[16])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$6, 133, 5, 3998);
    			attr_dev(td, "id", `${/*i*/ ctx[15]}-${/*j*/ ctx[18]}`);
    			add_location(td, file$6, 131, 4, 3917);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, img);

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*estadoTabela*/ 1 && !src_url_equal(img.src, img_src_value = /*dado*/ ctx[16])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(131:3) {#each linha as dado, j}",
    		ctx
    	});

    	return block;
    }

    // (129:1) {#each estadoTabela.tabela as linha, i}
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*linha*/ ctx[13];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$6, 129, 2, 3880);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clicarPeca, estadoTabela*/ 3) {
    				each_value_1 = /*linha*/ ctx[13];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(129:1) {#each estadoTabela.tabela as linha, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let link;
    	let t0;
    	let h10;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let h11;
    	let t5;
    	let table;
    	let t6;
    	let br;
    	let t7;
    	let voltarmenu;
    	let t8;
    	let p;
    	let current;
    	let each_value = /*estadoTabela*/ ctx[0].tabela;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	voltarmenu = new VoltarMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			h10 = element("h1");
    			h10.textContent = "Imagem original";
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			h11 = element("h1");
    			h11.textContent = "Boa sorte!";
    			t5 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			br = element("br");
    			t7 = space();
    			create_component(voltarmenu.$$.fragment);
    			t8 = space();
    			p = element("p");
    			p.textContent = "Ao voltar para o menu, seu progresso atual será perdido.";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/jogo.css");
    			add_location(link, file$6, 1, 1, 15);
    			set_style(h10, "color", "white");
    			add_location(h10, file$6, 115, 0, 3535);
    			set_style(img, "width", "50%");
    			set_style(img, "margin-bottom", "50px");
    			if (!src_url_equal(img.src, img_src_value = "/images/ayaka.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$6, 120, 0, 3622);
    			set_style(h11, "color", "white");
    			add_location(h11, file$6, 122, 0, 3701);
    			add_location(table, file$6, 127, 0, 3829);
    			add_location(br, file$6, 140, 0, 4070);
    			add_location(p, file$6, 145, 0, 4142);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t6, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(voltarmenu, target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*estadoTabela, clicarPeca*/ 3) {
    				each_value = /*estadoTabela*/ ctx[0].tabela;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voltarmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voltarmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t7);
    			destroy_component(voltarmenu, detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function embaralhar$2(tabela) {
    	// Embaralha todas as peças do quebra-cabeça
    	for (var k = 0; k < tabela.length; k++) {
    		var i = tabela[k].length;

    		if (i == 0) return false; else {
    			while (--i) {
    				var j = Math.floor(Math.random() * (i + 1));
    				var tempi = tabela[k][i];
    				var tempj = tabela[k][j];
    				tabela[k][i] = tempj;
    				tabela[k][j] = tempi;
    			}
    		}
    	}

    	return tabela;
    }

    // Função que valida se as todas as peças estão no seu lugar
    function validar$2(tabela, tabelaReal) {
    	let checkin = 0;

    	for (let i = 0; i < tabela.length; i++) {
    		for (let j = 0; j < tabela[i].length; j++) {
    			if (tabela[i][j] == tabelaReal[i][j]) {
    				checkin++;
    			}
    		}
    	}

    	if (checkin == tabela.length * tabela[1].length) {
    		alert("Parabéns, você conseguiu resolver!!");
    	}
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('JogarA', slots, []);

    	class EstadoTabela {
    		constructor(tabela) {
    			this.tabela = tabela;
    		}
    	}

    	// Duas variaveis iguais, sendo que somente a segunda está sujeita a mudanças
    	let tabelaReal = [
    		[
    			"/images/divisionA/1.jpg",
    			"/images/divisionA/2.jpg",
    			"/images/divisionA/3.jpg",
    			"/images/divisionA/4.jpg",
    			"/images/divisionA/5.jpg",
    			"/images/divisionA/6.jpg"
    		],
    		[
    			"/images/divisionA/7.jpg",
    			"/images/divisionA/8.jpg",
    			"/images/divisionA/9.jpg",
    			"/images/divisionA/10.jpg",
    			"/images/divisionA/11.jpg",
    			"/images/divisionA/12.jpg"
    		],
    		[
    			"/images/divisionA/13.jpg",
    			"/images/divisionA/14.jpg",
    			"/images/divisionA/15.jpg",
    			"/images/divisionA/16.jpg",
    			"/images/divisionA/17.jpg",
    			"/images/divisionA/18.jpg"
    		]
    	];

    	let tabela = [
    		[
    			"/images/divisionA/1.jpg",
    			"/images/divisionA/2.jpg",
    			"/images/divisionA/3.jpg",
    			"/images/divisionA/4.jpg",
    			"/images/divisionA/5.jpg",
    			"/images/divisionA/6.jpg"
    		],
    		[
    			"/images/divisionA/7.jpg",
    			"/images/divisionA/8.jpg",
    			"/images/divisionA/9.jpg",
    			"/images/divisionA/10.jpg",
    			"/images/divisionA/11.jpg",
    			"/images/divisionA/12.jpg"
    		],
    		[
    			"/images/divisionA/13.jpg",
    			"/images/divisionA/14.jpg",
    			"/images/divisionA/15.jpg",
    			"/images/divisionA/16.jpg",
    			"/images/divisionA/17.jpg",
    			"/images/divisionA/18.jpg"
    		]
    	];

    	// toda vez que entramos na tela de jogar o estado do jogo é resetado
    	let estadoTabela = new EstadoTabela(tabela);

    	// Uma tremenda gambiarra de armazenamento de valores
    	let chosen1 = null;

    	let chosen2 = null;
    	let k = null;
    	let l = null;
    	let m = null;
    	let n = null;

    	function clicarPeca(i, j) {
    		// Função que permite o usuário a selecionar a peça
    		if (chosen1 == null) {
    			k = i;
    			l = j;
    			chosen1 = tabela[k][l];
    		} else if (chosen2 == null) {
    			m = i;
    			n = j;
    			chosen2 = tabela[m][n];
    			atualizarTabela();
    		}
    	}

    	// Esta função atualiza o quebra cabeça, de acordo com as peças que o usuário selecionou
    	function atualizarTabela() {
    		let temp = estadoTabela.tabela[k][l];
    		$$invalidate(0, estadoTabela.tabela[k][l] = estadoTabela.tabela[m][n], estadoTabela);
    		$$invalidate(0, estadoTabela.tabela[m][n] = temp, estadoTabela);

    		// Os valores da gambiarra são resetados para que uma próxima troca possa ocorrer
    		chosen1 = null;

    		chosen2 = null;
    		k = null;
    		l = null;
    		m = null;
    		n = null;

    		// Após a troca, ocorre a validação
    		validar$2(tabela, tabelaReal);
    	}

    	embaralhar$2(tabela); // Ativa a função do embaralhamento
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<JogarA> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, j) => clicarPeca(i, j);

    	$$self.$capture_state = () => ({
    		VoltarMenu,
    		EstadoTabela,
    		tabelaReal,
    		tabela,
    		embaralhar: embaralhar$2,
    		estadoTabela,
    		chosen1,
    		chosen2,
    		k,
    		l,
    		m,
    		n,
    		clicarPeca,
    		atualizarTabela,
    		validar: validar$2
    	});

    	$$self.$inject_state = $$props => {
    		if ('tabelaReal' in $$props) tabelaReal = $$props.tabelaReal;
    		if ('tabela' in $$props) tabela = $$props.tabela;
    		if ('estadoTabela' in $$props) $$invalidate(0, estadoTabela = $$props.estadoTabela);
    		if ('chosen1' in $$props) chosen1 = $$props.chosen1;
    		if ('chosen2' in $$props) chosen2 = $$props.chosen2;
    		if ('k' in $$props) k = $$props.k;
    		if ('l' in $$props) l = $$props.l;
    		if ('m' in $$props) m = $$props.m;
    		if ('n' in $$props) n = $$props.n;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [estadoTabela, clicarPeca, click_handler];
    }

    class JogarA extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JogarA",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/JogarB.svelte generated by Svelte v3.46.0 */
    const file$5 = "src/JogarB.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (133:3) {#each linha as dado, j}
    function create_each_block_1$1(ctx) {
    	let td;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*i*/ ctx[15], /*j*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*dado*/ ctx[16])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 135, 5, 4840);
    			attr_dev(td, "id", `${/*i*/ ctx[15]}-${/*j*/ ctx[18]}`);
    			add_location(td, file$5, 133, 4, 4759);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, img);

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*estadoTabela*/ 1 && !src_url_equal(img.src, img_src_value = /*dado*/ ctx[16])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(133:3) {#each linha as dado, j}",
    		ctx
    	});

    	return block;
    }

    // (131:1) {#each estadoTabela.tabela as linha, i}
    function create_each_block$1(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*linha*/ ctx[13];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$5, 131, 2, 4722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clicarPeca, estadoTabela*/ 3) {
    				each_value_1 = /*linha*/ ctx[13];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(131:1) {#each estadoTabela.tabela as linha, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let link;
    	let t0;
    	let h10;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let h11;
    	let t5;
    	let table;
    	let t6;
    	let br;
    	let t7;
    	let voltarmenu;
    	let t8;
    	let p;
    	let current;
    	let each_value = /*estadoTabela*/ ctx[0].tabela;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	voltarmenu = new VoltarMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			h10 = element("h1");
    			h10.textContent = "Imagem original";
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			h11 = element("h1");
    			h11.textContent = "Boa sorte!";
    			t5 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			br = element("br");
    			t7 = space();
    			create_component(voltarmenu.$$.fragment);
    			t8 = space();
    			p = element("p");
    			p.textContent = "Ao voltar para o menu, seu progresso atual será perdido.";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/jogo.css");
    			add_location(link, file$5, 1, 1, 15);
    			set_style(h10, "color", "white");
    			add_location(h10, file$5, 117, 0, 4377);
    			set_style(img, "width", "50%");
    			set_style(img, "margin-bottom", "50px");
    			if (!src_url_equal(img.src, img_src_value = "/images/ayaka.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 122, 0, 4464);
    			set_style(h11, "color", "white");
    			add_location(h11, file$5, 124, 0, 4543);
    			add_location(table, file$5, 129, 0, 4671);
    			add_location(br, file$5, 142, 0, 4912);
    			add_location(p, file$5, 147, 0, 4984);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t6, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(voltarmenu, target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*estadoTabela, clicarPeca*/ 3) {
    				each_value = /*estadoTabela*/ ctx[0].tabela;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voltarmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voltarmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t7);
    			destroy_component(voltarmenu, detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function embaralhar$1(tabela) {
    	// Embaralha todas as peças do quebra-cabeça
    	for (var k = 0; k < tabela.length; k++) {
    		var i = tabela[k].length;

    		if (i == 0) return false; else {
    			while (--i) {
    				var j = Math.floor(Math.random() * (i + 1));
    				var tempi = tabela[k][i];
    				var tempj = tabela[k][j];
    				tabela[k][i] = tempj;
    				tabela[k][j] = tempi;
    			}
    		}
    	}

    	return tabela;
    }

    // Função que valida se as todas as peças estão no seu lugar
    function validar$1(tabela, tabelaReal) {
    	let checkin = 0;

    	for (let i = 0; i < tabela.length; i++) {
    		for (let j = 0; j < tabela[i].length; j++) {
    			if (tabela[i][j] == tabelaReal[i][j]) {
    				checkin++;
    			}
    		}
    	}

    	if (checkin == tabela.length * tabela[1].length) {
    		alert("Parabéns, você conseguiu resolver!!");
    	}
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('JogarB', slots, []);

    	class EstadoTabela {
    		constructor(tabela) {
    			this.tabela = tabela;
    		}
    	}

    	// Duas variaveis iguais, sendo que somente a segunda está sujeita a mudanças
    	let tabelaReal = [
    		[
    			"/images/divisionB/1.jpg",
    			"/images/divisionB/2.jpg",
    			"/images/divisionB/3.jpg",
    			"/images/divisionB/4.jpg",
    			"/images/divisionB/5.jpg",
    			"/images/divisionB/6.jpg",
    			"/images/divisionB/7.jpg",
    			"/images/divisionB/8.jpg"
    		],
    		[
    			"/images/divisionB/9.jpg",
    			"/images/divisionB/10.jpg",
    			"/images/divisionB/11.jpg",
    			"/images/divisionB/12.jpg",
    			"/images/divisionB/13.jpg",
    			"/images/divisionB/14.jpg",
    			"/images/divisionB/15.jpg",
    			"/images/divisionB/16.jpg"
    		],
    		[
    			"/images/divisionB/17.jpg",
    			"/images/divisionB/18.jpg",
    			"/images/divisionB/19.jpg",
    			"/images/divisionB/20.jpg",
    			"/images/divisionB/21.jpg",
    			"/images/divisionB/22.jpg",
    			"/images/divisionB/23.jpg",
    			"/images/divisionB/24.jpg"
    		],
    		[
    			"/images/divisionB/25.jpg",
    			"/images/divisionB/26.jpg",
    			"/images/divisionB/27.jpg",
    			"/images/divisionB/28.jpg",
    			"/images/divisionB/29.jpg",
    			"/images/divisionB/30.jpg",
    			"/images/divisionB/31.jpg",
    			"/images/divisionB/32.jpg"
    		]
    	];

    	let tabela = [
    		[
    			"/images/divisionB/1.jpg",
    			"/images/divisionB/2.jpg",
    			"/images/divisionB/3.jpg",
    			"/images/divisionB/4.jpg",
    			"/images/divisionB/5.jpg",
    			"/images/divisionB/6.jpg",
    			"/images/divisionB/7.jpg",
    			"/images/divisionB/8.jpg"
    		],
    		[
    			"/images/divisionB/9.jpg",
    			"/images/divisionB/10.jpg",
    			"/images/divisionB/11.jpg",
    			"/images/divisionB/12.jpg",
    			"/images/divisionB/13.jpg",
    			"/images/divisionB/14.jpg",
    			"/images/divisionB/15.jpg",
    			"/images/divisionB/16.jpg"
    		],
    		[
    			"/images/divisionB/17.jpg",
    			"/images/divisionB/18.jpg",
    			"/images/divisionB/19.jpg",
    			"/images/divisionB/20.jpg",
    			"/images/divisionB/21.jpg",
    			"/images/divisionB/22.jpg",
    			"/images/divisionB/23.jpg",
    			"/images/divisionB/24.jpg"
    		],
    		[
    			"/images/divisionB/25.jpg",
    			"/images/divisionB/26.jpg",
    			"/images/divisionB/27.jpg",
    			"/images/divisionB/28.jpg",
    			"/images/divisionB/29.jpg",
    			"/images/divisionB/30.jpg",
    			"/images/divisionB/31.jpg",
    			"/images/divisionB/32.jpg"
    		]
    	];

    	// toda vez que entramos na tela de jogar o estado do jogo é resetado
    	let estadoTabela = new EstadoTabela(tabela);

    	// Uma tremenda gambiarra de armazenamento de valores
    	let chosen1 = null;

    	let chosen2 = null;
    	let k = null;
    	let l = null;
    	let m = null;
    	let n = null;

    	function clicarPeca(i, j) {
    		// Função que permite o usuário a selecionar a peça
    		if (chosen1 == null) {
    			k = i;
    			l = j;
    			chosen1 = tabela[k][l];
    		} else if (chosen2 == null) {
    			m = i;
    			n = j;
    			chosen2 = tabela[m][n];
    			atualizarTabela();
    		}
    	}

    	// Esta função atualiza o quebra cabeça, de acordo com as peças que o usuário selecionou
    	function atualizarTabela() {
    		let temp = estadoTabela.tabela[k][l];
    		$$invalidate(0, estadoTabela.tabela[k][l] = estadoTabela.tabela[m][n], estadoTabela);
    		$$invalidate(0, estadoTabela.tabela[m][n] = temp, estadoTabela);

    		// Os valores da gambiarra são resetados para que uma próxima troca possa ocorrer
    		chosen1 = null;

    		chosen2 = null;
    		k = null;
    		l = null;
    		m = null;
    		n = null;

    		// Após a troca, ocorre a validação
    		validar$1(tabela, tabelaReal);
    	}

    	embaralhar$1(tabela); // Ativa a função do embaralhamento
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<JogarB> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, j) => clicarPeca(i, j);

    	$$self.$capture_state = () => ({
    		VoltarMenu,
    		EstadoTabela,
    		tabelaReal,
    		tabela,
    		embaralhar: embaralhar$1,
    		estadoTabela,
    		chosen1,
    		chosen2,
    		k,
    		l,
    		m,
    		n,
    		clicarPeca,
    		atualizarTabela,
    		validar: validar$1
    	});

    	$$self.$inject_state = $$props => {
    		if ('tabelaReal' in $$props) tabelaReal = $$props.tabelaReal;
    		if ('tabela' in $$props) tabela = $$props.tabela;
    		if ('estadoTabela' in $$props) $$invalidate(0, estadoTabela = $$props.estadoTabela);
    		if ('chosen1' in $$props) chosen1 = $$props.chosen1;
    		if ('chosen2' in $$props) chosen2 = $$props.chosen2;
    		if ('k' in $$props) k = $$props.k;
    		if ('l' in $$props) l = $$props.l;
    		if ('m' in $$props) m = $$props.m;
    		if ('n' in $$props) n = $$props.n;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [estadoTabela, clicarPeca, click_handler];
    }

    class JogarB extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JogarB",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/JogarC.svelte generated by Svelte v3.46.0 */
    const file$4 = "src/JogarC.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (135:3) {#each linha as dado, j}
    function create_each_block_1(ctx) {
    	let td;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*i*/ ctx[15], /*j*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*dado*/ ctx[16])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$4, 137, 5, 5834);
    			attr_dev(td, "id", `${/*i*/ ctx[15]}-${/*j*/ ctx[18]}`);
    			add_location(td, file$4, 135, 4, 5753);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, img);

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*estadoTabela*/ 1 && !src_url_equal(img.src, img_src_value = /*dado*/ ctx[16])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(135:3) {#each linha as dado, j}",
    		ctx
    	});

    	return block;
    }

    // (133:1) {#each estadoTabela.tabela as linha, i}
    function create_each_block(ctx) {
    	let tr;
    	let t;
    	let each_value_1 = /*linha*/ ctx[13];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$4, 133, 2, 5716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clicarPeca, estadoTabela*/ 3) {
    				each_value_1 = /*linha*/ ctx[13];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(133:1) {#each estadoTabela.tabela as linha, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let link;
    	let t0;
    	let h10;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let h11;
    	let t5;
    	let table;
    	let t6;
    	let br;
    	let t7;
    	let voltarmenu;
    	let t8;
    	let p;
    	let current;
    	let each_value = /*estadoTabela*/ ctx[0].tabela;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	voltarmenu = new VoltarMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			h10 = element("h1");
    			h10.textContent = "Imagem original";
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			h11 = element("h1");
    			h11.textContent = "Boa sorte!";
    			t5 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			br = element("br");
    			t7 = space();
    			create_component(voltarmenu.$$.fragment);
    			t8 = space();
    			p = element("p");
    			p.textContent = "Ao voltar para o menu, seu progresso atual será perdido.";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/jogo.css");
    			add_location(link, file$4, 1, 1, 15);
    			set_style(h10, "color", "white");
    			add_location(h10, file$4, 119, 0, 5371);
    			set_style(img, "width", "50%");
    			set_style(img, "margin-bottom", "50px");
    			if (!src_url_equal(img.src, img_src_value = "/images/ayaka.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$4, 124, 0, 5458);
    			set_style(h11, "color", "white");
    			add_location(h11, file$4, 126, 0, 5537);
    			add_location(table, file$4, 131, 0, 5665);
    			add_location(br, file$4, 144, 0, 5906);
    			add_location(p, file$4, 149, 0, 5978);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, table, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t6, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(voltarmenu, target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*estadoTabela, clicarPeca*/ 3) {
    				each_value = /*estadoTabela*/ ctx[0].tabela;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voltarmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voltarmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t7);
    			destroy_component(voltarmenu, detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function embaralhar(tabela) {
    	// Embaralha todas as peças do quebra-cabeça
    	for (var k = 0; k < tabela.length; k++) {
    		var i = tabela[k].length;

    		if (i == 0) return false; else {
    			while (--i) {
    				var j = Math.floor(Math.random() * (i + 1));
    				var tempi = tabela[k][i];
    				var tempj = tabela[k][j];
    				tabela[k][i] = tempj;
    				tabela[k][j] = tempi;
    			}
    		}
    	}

    	return tabela;
    }

    // Função que valida se as todas as peças estão no seu lugar
    function validar(tabela, tabelaReal) {
    	let checkin = 0;

    	for (let i = 0; i < tabela.length; i++) {
    		for (let j = 0; j < tabela[i].length; j++) {
    			if (tabela[i][j] == tabelaReal[i][j]) {
    				checkin++;
    			}
    		}
    	}

    	if (checkin == tabela.length * tabela[1].length) {
    		alert("Parabéns, você conseguiu resolver!!");
    	}
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('JogarC', slots, []);

    	class EstadoTabela {
    		constructor(tabela) {
    			this.tabela = tabela;
    		}
    	}

    	// Duas variaveis iguais, sendo que somente a segunda está sujeita a mudanças
    	let tabelaReal = [
    		[
    			"/images/divisionC/1.jpg",
    			"/images/divisionC/2.jpg",
    			"/images/divisionC/3.jpg",
    			"/images/divisionC/4.jpg",
    			"/images/divisionC/5.jpg",
    			"/images/divisionC/6.jpg",
    			"/images/divisionC/7.jpg",
    			"/images/divisionC/8.jpg",
    			"/images/divisionC/9.jpg",
    			"/images/divisionC/10.jpg"
    		],
    		[
    			"/images/divisionC/11.jpg",
    			"/images/divisionC/12.jpg",
    			"/images/divisionC/13.jpg",
    			"/images/divisionC/14.jpg",
    			"/images/divisionC/15.jpg",
    			"/images/divisionC/16.jpg",
    			"/images/divisionC/17.jpg",
    			"/images/divisionC/18.jpg",
    			"/images/divisionC/19.jpg",
    			"/images/divisionC/20.jpg"
    		],
    		[
    			"/images/divisionC/21.jpg",
    			"/images/divisionC/22.jpg",
    			"/images/divisionC/23.jpg",
    			"/images/divisionC/24.jpg",
    			"/images/divisionC/25.jpg",
    			"/images/divisionC/26.jpg",
    			"/images/divisionC/27.jpg",
    			"/images/divisionC/28.jpg",
    			"/images/divisionC/29.jpg",
    			"/images/divisionC/30.jpg"
    		],
    		[
    			"/images/divisionC/31.jpg",
    			"/images/divisionC/32.jpg",
    			"/images/divisionC/33.jpg",
    			"/images/divisionC/34.jpg",
    			"/images/divisionC/35.jpg",
    			"/images/divisionC/36.jpg",
    			"/images/divisionC/37.jpg",
    			"/images/divisionC/38.jpg",
    			"/images/divisionC/39.jpg",
    			"/images/divisionC/40.jpg"
    		],
    		[
    			"/images/divisionC/41.jpg",
    			"/images/divisionC/42.jpg",
    			"/images/divisionC/43.jpg",
    			"/images/divisionC/44.jpg",
    			"/images/divisionC/45.jpg",
    			"/images/divisionC/46.jpg",
    			"/images/divisionC/47.jpg",
    			"/images/divisionC/48.jpg",
    			"/images/divisionC/49.jpg",
    			"/images/divisionC/50.jpg"
    		]
    	];

    	let tabela = [
    		[
    			"/images/divisionC/1.jpg",
    			"/images/divisionC/2.jpg",
    			"/images/divisionC/3.jpg",
    			"/images/divisionC/4.jpg",
    			"/images/divisionC/5.jpg",
    			"/images/divisionC/6.jpg",
    			"/images/divisionC/7.jpg",
    			"/images/divisionC/8.jpg",
    			"/images/divisionC/9.jpg",
    			"/images/divisionC/10.jpg"
    		],
    		[
    			"/images/divisionC/11.jpg",
    			"/images/divisionC/12.jpg",
    			"/images/divisionC/13.jpg",
    			"/images/divisionC/14.jpg",
    			"/images/divisionC/15.jpg",
    			"/images/divisionC/16.jpg",
    			"/images/divisionC/17.jpg",
    			"/images/divisionC/18.jpg",
    			"/images/divisionC/19.jpg",
    			"/images/divisionC/20.jpg"
    		],
    		[
    			"/images/divisionC/21.jpg",
    			"/images/divisionC/22.jpg",
    			"/images/divisionC/23.jpg",
    			"/images/divisionC/24.jpg",
    			"/images/divisionC/25.jpg",
    			"/images/divisionC/26.jpg",
    			"/images/divisionC/27.jpg",
    			"/images/divisionC/28.jpg",
    			"/images/divisionC/29.jpg",
    			"/images/divisionC/30.jpg"
    		],
    		[
    			"/images/divisionC/31.jpg",
    			"/images/divisionC/32.jpg",
    			"/images/divisionC/33.jpg",
    			"/images/divisionC/34.jpg",
    			"/images/divisionC/35.jpg",
    			"/images/divisionC/36.jpg",
    			"/images/divisionC/37.jpg",
    			"/images/divisionC/38.jpg",
    			"/images/divisionC/39.jpg",
    			"/images/divisionC/40.jpg"
    		],
    		[
    			"/images/divisionC/41.jpg",
    			"/images/divisionC/42.jpg",
    			"/images/divisionC/43.jpg",
    			"/images/divisionC/44.jpg",
    			"/images/divisionC/45.jpg",
    			"/images/divisionC/46.jpg",
    			"/images/divisionC/47.jpg",
    			"/images/divisionC/48.jpg",
    			"/images/divisionC/49.jpg",
    			"/images/divisionC/50.jpg"
    		]
    	];

    	// toda vez que entramos na tela de jogar o estado do jogo é resetado
    	let estadoTabela = new EstadoTabela(tabela);

    	// Uma tremenda gambiarra de armazenamento de valores
    	let chosen1 = null;

    	let chosen2 = null;
    	let k = null;
    	let l = null;
    	let m = null;
    	let n = null;

    	function clicarPeca(i, j) {
    		// Função que permite o usuário a selecionar a peça
    		if (chosen1 == null) {
    			k = i;
    			l = j;
    			chosen1 = tabela[k][l];
    		} else if (chosen2 == null) {
    			m = i;
    			n = j;
    			chosen2 = tabela[m][n];
    			atualizarTabela();
    		}
    	}

    	// Esta função atualiza o quebra cabeça, de acordo com as peças que o usuário selecionou
    	function atualizarTabela() {
    		let temp = estadoTabela.tabela[k][l];
    		$$invalidate(0, estadoTabela.tabela[k][l] = estadoTabela.tabela[m][n], estadoTabela);
    		$$invalidate(0, estadoTabela.tabela[m][n] = temp, estadoTabela);

    		// Os valores da gambiarra são resetados para que uma próxima troca possa ocorrer
    		chosen1 = null;

    		chosen2 = null;
    		k = null;
    		l = null;
    		m = null;
    		n = null;

    		// Após a troca, ocorre a validação
    		validar(tabela, tabelaReal);
    	}

    	embaralhar(tabela); // Ativa a função do embaralhamento
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<JogarC> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, j) => clicarPeca(i, j);

    	$$self.$capture_state = () => ({
    		VoltarMenu,
    		EstadoTabela,
    		tabelaReal,
    		tabela,
    		embaralhar,
    		estadoTabela,
    		chosen1,
    		chosen2,
    		k,
    		l,
    		m,
    		n,
    		clicarPeca,
    		atualizarTabela,
    		validar
    	});

    	$$self.$inject_state = $$props => {
    		if ('tabelaReal' in $$props) tabelaReal = $$props.tabelaReal;
    		if ('tabela' in $$props) tabela = $$props.tabela;
    		if ('estadoTabela' in $$props) $$invalidate(0, estadoTabela = $$props.estadoTabela);
    		if ('chosen1' in $$props) chosen1 = $$props.chosen1;
    		if ('chosen2' in $$props) chosen2 = $$props.chosen2;
    		if ('k' in $$props) k = $$props.k;
    		if ('l' in $$props) l = $$props.l;
    		if ('m' in $$props) m = $$props.m;
    		if ('n' in $$props) n = $$props.n;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [estadoTabela, clicarPeca, click_handler];
    }

    class JogarC extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JogarC",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Sobre.svelte generated by Svelte v3.46.0 */
    const file$3 = "src/Sobre.svelte";

    function create_fragment$4(ctx) {
    	let link;
    	let t0;
    	let body;
    	let h1;
    	let t2;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let p2;
    	let t10;
    	let p3;
    	let t12;
    	let img2;
    	let img2_src_value;
    	let t13;
    	let p4;
    	let t15;
    	let p5;
    	let t17;
    	let img3;
    	let img3_src_value;
    	let t18;
    	let p6;
    	let t20;
    	let p7;
    	let t22;
    	let img4;
    	let img4_src_value;
    	let t23;
    	let p8;
    	let t25;
    	let p9;
    	let t27;
    	let p10;
    	let t29;
    	let h2;
    	let t31;
    	let p11;
    	let t33;
    	let voltarmenu;
    	let current;
    	voltarmenu = new VoltarMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			body = element("body");
    			h1 = element("h1");
    			h1.textContent = "Sobre";
    			t2 = space();
    			img0 = element("img");
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Afonso Henrique Gomes Barbosa de Araújo";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Tecnologia em Sistemas para Internet";
    			t7 = space();
    			img1 = element("img");
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "Antônio Pedro do Nascimento Neto";
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "Tecnologia em Sistemas para Internet";
    			t12 = space();
    			img2 = element("img");
    			t13 = space();
    			p4 = element("p");
    			p4.textContent = "Waldyr Soares da Silva Filho";
    			t15 = space();
    			p5 = element("p");
    			p5.textContent = "Tecnologia em Sistemas para Internet";
    			t17 = space();
    			img3 = element("img");
    			t18 = space();
    			p6 = element("p");
    			p6.textContent = "Paulo Henrique Lopes da Silva";
    			t20 = space();
    			p7 = element("p");
    			p7.textContent = "Técnico em Informática para Internet";
    			t22 = space();
    			img4 = element("img");
    			t23 = space();
    			p8 = element("p");
    			p8.textContent = "Danielle Pamela Bispo de Moura";
    			t25 = space();
    			p9 = element("p");
    			p9.textContent = "Tecnologia em Sistemas para Internet";
    			t27 = space();
    			p10 = element("p");
    			p10.textContent = "Todas essas pessoas foram responsáveis por este projeto, com cada uma dando o melhor \n\t\tde si para a sua realidade.";
    			t29 = space();
    			h2 = element("h2");
    			h2.textContent = "Esta idéia não seria possível se não fosse por vocês. Agradeço grandiosamente a todos!";
    			t31 = space();
    			p11 = element("p");
    			p11.textContent = "- Afonso H.";
    			t33 = space();
    			create_component(voltarmenu.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/sobre.css");
    			add_location(link, file$3, 1, 1, 15);
    			attr_dev(h1, "class", "about");
    			add_location(h1, file$3, 9, 1, 154);
    			if (!src_url_equal(img0.src, img0_src_value = "images/AfonsoH.jpeg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Imagem de Afonso.");
    			add_location(img0, file$3, 13, 1, 187);
    			add_location(p0, file$3, 14, 1, 245);
    			add_location(p1, file$3, 17, 1, 298);
    			if (!src_url_equal(img1.src, img1_src_value = "images/AntonioP.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Imagem de Antônio.");
    			add_location(img1, file$3, 21, 1, 349);
    			add_location(p2, file$3, 22, 1, 408);
    			add_location(p3, file$3, 25, 1, 454);
    			if (!src_url_equal(img2.src, img2_src_value = "images/WaldyrS.jpeg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Imagem de Waldyr.");
    			add_location(img2, file$3, 29, 1, 505);
    			add_location(p4, file$3, 30, 1, 562);
    			add_location(p5, file$3, 33, 1, 604);
    			if (!src_url_equal(img3.src, img3_src_value = "images/PauloH.jpeg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Imagem de Paulo.");
    			add_location(img3, file$3, 37, 1, 655);
    			add_location(p6, file$3, 38, 1, 710);
    			add_location(p7, file$3, 41, 1, 753);
    			if (!src_url_equal(img4.src, img4_src_value = "images/DanielleP.jpeg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Imagem de Danielle.");
    			add_location(img4, file$3, 45, 1, 804);
    			add_location(p8, file$3, 46, 1, 865);
    			add_location(p9, file$3, 49, 1, 909);
    			set_style(p10, "margin-top", "80px");
    			add_location(p10, file$3, 55, 1, 962);
    			attr_dev(h2, "class", "about");
    			add_location(h2, file$3, 60, 1, 1117);
    			attr_dev(p11, "id", "text");
    			add_location(p11, file$3, 64, 1, 1234);
    			add_location(body, file$3, 8, 0, 146);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, body, anchor);
    			append_dev(body, h1);
    			append_dev(body, t2);
    			append_dev(body, img0);
    			append_dev(body, t3);
    			append_dev(body, p0);
    			append_dev(body, t5);
    			append_dev(body, p1);
    			append_dev(body, t7);
    			append_dev(body, img1);
    			append_dev(body, t8);
    			append_dev(body, p2);
    			append_dev(body, t10);
    			append_dev(body, p3);
    			append_dev(body, t12);
    			append_dev(body, img2);
    			append_dev(body, t13);
    			append_dev(body, p4);
    			append_dev(body, t15);
    			append_dev(body, p5);
    			append_dev(body, t17);
    			append_dev(body, img3);
    			append_dev(body, t18);
    			append_dev(body, p6);
    			append_dev(body, t20);
    			append_dev(body, p7);
    			append_dev(body, t22);
    			append_dev(body, img4);
    			append_dev(body, t23);
    			append_dev(body, p8);
    			append_dev(body, t25);
    			append_dev(body, p9);
    			append_dev(body, t27);
    			append_dev(body, p10);
    			append_dev(body, t29);
    			append_dev(body, h2);
    			append_dev(body, t31);
    			append_dev(body, p11);
    			append_dev(body, t33);
    			mount_component(voltarmenu, body, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voltarmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voltarmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(body);
    			destroy_component(voltarmenu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sobre', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sobre> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ VoltarMenu });
    	return [];
    }

    class Sobre extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sobre",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Ajuda.svelte generated by Svelte v3.46.0 */
    const file$2 = "src/Ajuda.svelte";

    function create_fragment$3(ctx) {
    	let link;
    	let t0;
    	let h1;
    	let t2;
    	let body;
    	let p0;
    	let t4;
    	let img;
    	let img_src_value;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let h2;
    	let t11;
    	let voltarmenu;
    	let current;
    	voltarmenu = new VoltarMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Ajuda";
    			t2 = space();
    			body = element("body");
    			p0 = element("p");
    			p0.textContent = "O Quebra-Cabeça é um jogo de raciocínio lógico. O objetivo é pegar e juntar as peças de \n        um modo ordenado, formando assim uma imagem completa.";
    			t4 = space();
    			img = element("img");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Acima há uma ilustração que será utilizada no quebra-cabeça. Ela será \n        exibida durante o jogo.";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "Ao entrar no jogo, a figura será dividida em pedaços, embaralhadas de forma aleatória.\n        Seu objetivo é juntar os pedaços para que a imagem original seja formada.";
    			t9 = space();
    			h2 = element("h2");
    			h2.textContent = "Boa sorte!";
    			t11 = space();
    			create_component(voltarmenu.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/ajuda.css");
    			add_location(link, file$2, 1, 1, 15);
    			add_location(h1, file$2, 8, 0, 149);
    			add_location(p0, file$2, 11, 4, 176);
    			if (!src_url_equal(img.src, img_src_value = "images/ayaka.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Uma imagem.");
    			attr_dev(img, "width", "300");
    			attr_dev(img, "height", "400");
    			add_location(img, file$2, 16, 4, 357);
    			add_location(p1, file$2, 18, 4, 438);
    			add_location(p2, file$2, 23, 4, 571);
    			add_location(h2, file$2, 28, 4, 770);
    			add_location(body, file$2, 10, 0, 165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, body, anchor);
    			append_dev(body, p0);
    			append_dev(body, t4);
    			append_dev(body, img);
    			append_dev(body, t5);
    			append_dev(body, p1);
    			append_dev(body, t7);
    			append_dev(body, p2);
    			append_dev(body, t9);
    			append_dev(body, h2);
    			append_dev(body, t11);
    			mount_component(voltarmenu, body, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voltarmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voltarmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(body);
    			destroy_component(voltarmenu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ajuda', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ajuda> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ VoltarMenu });
    	return [];
    }

    class Ajuda extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ajuda",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Menu.svelte generated by Svelte v3.46.0 */
    const file$1 = "src/Menu.svelte";

    function create_fragment$2(ctx) {
    	let link;
    	let t0;
    	let body;
    	let h1;
    	let t2;
    	let button0;
    	let div0;
    	let t4;
    	let button1;
    	let div1;
    	let t6;
    	let button2;
    	let div2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			body = element("body");
    			h1 = element("h1");
    			h1.textContent = "Puzzle - Quebra Cabeça";
    			t2 = space();
    			button0 = element("button");
    			div0 = element("div");
    			div0.textContent = "Jogar";
    			t4 = space();
    			button1 = element("button");
    			div1 = element("div");
    			div1.textContent = "Ajuda";
    			t6 = space();
    			button2 = element("button");
    			div2 = element("div");
    			div2.textContent = "Sobre";
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/menu.css");
    			add_location(link, file$1, 1, 1, 15);
    			add_location(h1, file$1, 10, 1, 191);
    			attr_dev(div0, "class", "menu");
    			add_location(div0, file$1, 15, 2, 256);
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$1, 14, 1, 231);
    			attr_dev(div1, "class", "menu");
    			add_location(div1, file$1, 21, 2, 381);
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$1, 20, 1, 356);
    			attr_dev(div2, "class", "menu");
    			add_location(div2, file$1, 27, 2, 501);
    			attr_dev(button2, "type", "button");
    			add_location(button2, file$1, 26, 1, 476);
    			add_location(body, file$1, 9, 0, 183);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, body, anchor);
    			append_dev(body, h1);
    			append_dev(body, t2);
    			append_dev(body, button0);
    			append_dev(button0, div0);
    			append_dev(body, t4);
    			append_dev(body, button1);
    			append_dev(button1, div1);
    			append_dev(body, t6);
    			append_dev(body, button2);
    			append_dev(button2, div2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[0], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[1], false, false, false),
    					listen_dev(div2, "click", /*click_handler_2*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => trocarStateDoJogo('dificuldade');
    	const click_handler_1 = () => trocarStateDoJogo('ajuda');
    	const click_handler_2 = () => trocarStateDoJogo('sobre');
    	$$self.$capture_state = () => ({ state, trocarStateDoJogo });
    	return [click_handler, click_handler_1, click_handler_2];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Dificuldade.svelte generated by Svelte v3.46.0 */
    const file = "src/Dificuldade.svelte";

    function create_fragment$1(ctx) {
    	let link;
    	let t0;
    	let body;
    	let h1;
    	let t2;
    	let button0;
    	let div0;
    	let t4;
    	let button1;
    	let div1;
    	let t6;
    	let button2;
    	let div2;
    	let t8;
    	let voltarmenu;
    	let current;
    	let mounted;
    	let dispose;
    	voltarmenu = new VoltarMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			body = element("body");
    			h1 = element("h1");
    			h1.textContent = "Selecione uma dificuldade";
    			t2 = space();
    			button0 = element("button");
    			div0 = element("div");
    			div0.textContent = "Fácil";
    			t4 = space();
    			button1 = element("button");
    			div1 = element("div");
    			div1.textContent = "Normal";
    			t6 = space();
    			button2 = element("button");
    			div2 = element("div");
    			div2.textContent = "Difícil";
    			t8 = space();
    			create_component(voltarmenu.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/styles/dificuldade.css");
    			add_location(link, file, 1, 1, 15);
    			add_location(h1, file, 11, 1, 244);
    			attr_dev(div0, "class", "dificuldade");
    			add_location(div0, file, 16, 2, 312);
    			attr_dev(button0, "type", "button");
    			add_location(button0, file, 15, 1, 287);
    			attr_dev(div1, "class", "dificuldade");
    			add_location(div1, file, 22, 2, 439);
    			attr_dev(button1, "type", "button");
    			add_location(button1, file, 21, 1, 414);
    			attr_dev(div2, "class", "dificuldade");
    			add_location(div2, file, 28, 2, 597);
    			attr_dev(button2, "type", "button");
    			set_style(button2, "margin-bottom", "100px");
    			add_location(button2, file, 27, 1, 542);
    			add_location(body, file, 10, 0, 236);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, body, anchor);
    			append_dev(body, h1);
    			append_dev(body, t2);
    			append_dev(body, button0);
    			append_dev(button0, div0);
    			append_dev(body, t4);
    			append_dev(body, button1);
    			append_dev(button1, div1);
    			append_dev(body, t6);
    			append_dev(body, button2);
    			append_dev(button2, div2);
    			append_dev(body, t8);
    			mount_component(voltarmenu, body, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[0], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[1], false, false, false),
    					listen_dev(div2, "click", /*click_handler_2*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voltarmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voltarmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(body);
    			destroy_component(voltarmenu);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dificuldade', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dificuldade> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => trocarStateDoJogo('jogarA');
    	const click_handler_1 = () => trocarStateDoJogo('jogarB');
    	const click_handler_2 = () => trocarStateDoJogo('jogarC');
    	$$self.$capture_state = () => ({ state, trocarStateDoJogo, VoltarMenu });
    	return [click_handler, click_handler_1, click_handler_2];
    }

    class Dificuldade extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dificuldade",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.0 */

    // (25:30) 
    function create_if_block_6(ctx) {
    	let jogoc;
    	let current;
    	jogoc = new JogarC({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(jogoc.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jogoc, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jogoc.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jogoc.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jogoc, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(25:30) ",
    		ctx
    	});

    	return block;
    }

    // (23:30) 
    function create_if_block_5(ctx) {
    	let jogob;
    	let current;
    	jogob = new JogarB({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(jogob.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jogob, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jogob.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jogob.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jogob, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(23:30) ",
    		ctx
    	});

    	return block;
    }

    // (21:30) 
    function create_if_block_4(ctx) {
    	let jogoa;
    	let current;
    	jogoa = new JogarA({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(jogoa.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(jogoa, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jogoa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jogoa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(jogoa, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(21:30) ",
    		ctx
    	});

    	return block;
    }

    // (19:35) 
    function create_if_block_3(ctx) {
    	let dificuldade;
    	let current;
    	dificuldade = new Dificuldade({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(dificuldade.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dificuldade, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dificuldade.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dificuldade.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dificuldade, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(19:35) ",
    		ctx
    	});

    	return block;
    }

    // (17:29) 
    function create_if_block_2(ctx) {
    	let ajuda;
    	let current;
    	ajuda = new Ajuda({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(ajuda.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ajuda, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ajuda.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ajuda.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ajuda, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(17:29) ",
    		ctx
    	});

    	return block;
    }

    // (15:29) 
    function create_if_block_1(ctx) {
    	let sobre;
    	let current;
    	sobre = new Sobre({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sobre.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sobre, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sobre.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sobre.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sobre, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:29) ",
    		ctx
    	});

    	return block;
    }

    // (13:0) {#if $state === "menu"}
    function create_if_block(ctx) {
    	let menu;
    	let current;
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:0) {#if $state === \\\"menu\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$state*/ ctx[0] === "menu") return 0;
    		if (/*$state*/ ctx[0] === "sobre") return 1;
    		if (/*$state*/ ctx[0] === "ajuda") return 2;
    		if (/*$state*/ ctx[0] === "dificuldade") return 3;
    		if (/*$state*/ ctx[0] === "jogarA") return 4;
    		if (/*$state*/ ctx[0] === "jogarB") return 5;
    		if (/*$state*/ ctx[0] === "jogarC") return 6;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $state;
    	validate_store(state, 'state');
    	component_subscribe($$self, state, $$value => $$invalidate(0, $state = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		JogoA: JogarA,
    		JogoB: JogarB,
    		JogoC: JogarC,
    		Sobre,
    		Ajuda,
    		Menu,
    		Dificuldade,
    		state,
    		$state
    	});

    	return [$state];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
