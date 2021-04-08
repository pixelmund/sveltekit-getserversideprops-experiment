
	import path from 'path';

	export async function get(): Promise<{ body: any }> {
		return {
			body: {
				hello: 'World'
			}
		};
	}

	export async function post({ body }) {
		return {
			body
		};
	}
