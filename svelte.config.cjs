const sveltePreprocess = require('svelte-preprocess');
const node = require('@sveltejs/adapter-node');
const pkg = require('./package.json');

const fs = require('fs');
const loadPreprocess = () => {
	return {
		markup: ({ content, filename }) => {
			const scripts = [];

			const re = /<script([^>]*?)>([\s\S]+?)<\/script>/gm;
			let match;
			while ((match = re.exec(content))) {
				const attrs = match[1]
					.split(' ')
					.map((str) => str.trim())
					.filter(Boolean)
					.map((str) => {
						const [name, quoted_value] = str.split('=');
						const value = quoted_value
							? quoted_value.replace(/^['"]/, '').replace(/['"]$/, '')
							: true;

						return { name, value };
					})
					.reduce((attrs, { name, value }) => {
						attrs[name] = value;
						return attrs;
					}, {});

				scripts.push({ attrs, content: match[2] });
			}

			if (scripts.length === 0) {
				return {
					code: content
				};
			}

			const ssr_module_script = scripts.find((s) => s.attrs.context === 'module' && s.attrs.ssr);

			let i = 0;

			return {
				code: content.replace(re, (_, attrs, content) => {
					const script = scripts[i++];

					if (script === ssr_module_script) {
						const fileName = filename.split('/');
						const extension = fileName.pop();
						const newFilename =
							fileName.join('/') +
							'/api/' +
							extension.replace('.svelte', script.attrs && script.attrs.lang && script.attrs.lang === 'ts' ? '.ts' : '.js');
						let routesName = '/api/' + extension.replace('.svelte', '').replace('index', '');
						fs.writeFileSync(newFilename, ssr_module_script.content);

						if (routesName.endsWith('/')) {
							routesName = routesName.slice(0, -1);
						}

						let cd = _.replace(/\S/g, ' ');
						cd = `
						<script context="module">
							export async function load({ fetch }) {
								const response = await fetch('/api', {
									credentials: 'include',
									headers: { 'content-type': 'application/json' }
								});
								const json = await response.json();
								try {
									return {
										props: json,
									};
								} catch (err) {
									return {
										error: err,
										status: 500
									};
								}
							}
						</script>
						`;

						return cd;
					}

					return _;
				})
			};
		}
	};
};

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [loadPreprocess(), sveltePreprocess()],
	kit: {
		// By default, `npm run build` will create a standard Node app.
		// You can create optimized builds for different platforms by
		// specifying a different adapter
		adapter: node(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		vite: {
			ssr: {
				noExternal: Object.keys(pkg.dependencies || {})
			}
		}
	}
};
