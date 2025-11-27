export default {
	async fetch(request: Request): Promise<Response> {
		/**
		 * Replace `remote` with the host you wish to send requests to
		 */
		const remote = "https://ray-white-marine.pages.dev";

		return await fetch(remote, request);
	},
};
