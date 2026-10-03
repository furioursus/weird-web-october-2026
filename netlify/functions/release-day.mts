import type { Config } from "@netlify/functions";

export default async () => {
	const hook = Netlify.env.get("NETLIFY_BUILD_HOOK");
	if (!hook) {
		throw new Error(
			"Add the NETLIFY_BUILD_HOOK environment variable (see README.md#scheduled-releases)",
		);
	}
	const res = await fetch(`${hook}?trigger_title=Scheduled+release`, {
		method: "POST",
		body: "{}",
	});
	if (!res.ok) {
		throw new Error(`Build hook answered ${res.status}`);
	}
};

export const config: Config = {
	schedule: "5 4 * 10 *",
};
