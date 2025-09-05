export interface Env {
	ANIMES_DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if(url.pathname === '/') {
			return new Response('OK', { status: 200 });
		}

		if(url.pathname === '/search') { // search anime by features
			const feature1 = url.searchParams.get('feature1');
			const feature2 = url.searchParams.get('feature2');
			
			if(!feature1 || !feature2) {
				return new Response('Missing feature parameters', { status: 400 });
			}
			
			const allowedColumns = await env.ANIMES_DB.prepare("SELECT col_name FROM column_mapping").all();
			const allowedColNames = allowedColumns.results.map((row) => row.col_name);
			if(!allowedColNames.includes(feature1) ||
			   !allowedColNames.includes(feature2)) {
				return new Response('Invalid feature parameters', { status: 400 });
			}

			const result = await env.ANIMES_DB.prepare(`SELECT name FROM anime_data WHERE ${feature1} = 'True' AND ${feature2} = 'True' ORDER BY rowid`).all();
			const animeNames = result.results.map(row => row.name);
			return new Response(JSON.stringify(animeNames), { status: 200 });
		}

    if(url.pathname === '/cols') { // get allowed columns
      const result = await env.ANIMES_DB.prepare("SELECT * FROM column_mapping").all();
      return new Response(JSON.stringify(result.results), { status: 200 });
    }

		// Default response for other routes
		return new Response('Not Found', { status: 404 });
	}
};